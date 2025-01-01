import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoute.js';
import chatRoutes from './routes/chatRoutes.js';
import dotenv from 'dotenv';
import cors from 'cors';
import chalk from 'chalk';
import bodyParser from 'body-parser';
import pool from './config/db.js';
import { v4 as uuidv4, validate as isUUID } from 'uuid';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the Authentication API!");
});
 
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
  },
});
const roomMapping = {};

io.on("connection", (socket) => {
  console.log(chalk.green("A user connected:", socket.id));

  socket.on("join-room", async ({ room, user, customerId }) => {
    

    if (!room || typeof room !== "string") {
      console.error("Invalid room name:", room);
      socket.emit("error", { message: "Invalid room name." });
      return;
    }
  
    if (!customerId) {
      console.error("Missing customer ID.");
      socket.emit("error", { message: "Customer ID is required." });
      return;
    }
  
    if (!isUUID(room)) {
      if (!roomMapping[room]) {
        const newRoomId = uuidv4();
        roomMapping[room] = newRoomId;
  
        const defaultCategoryId =1; // Replace with actual default category ID
        console.log(`Attempting to insert into chat_sessions: ${newRoomId}, ${defaultCategoryId}, ${customerId}`);
  
        try {
          await pool.query(
            `INSERT INTO chat_sessions (id, category_id, customer_id) VALUES ($1, $2, $3)`,
            [newRoomId, defaultCategoryId, customerId]
          );
          console.log(`Inserted room ID ${newRoomId} with customer ID ${customerId} into chat_sessions.`);
        } catch (error) {
          console.error("Error inserting room into chat_sessions:", error.message);
          socket.emit("error", { message: "Failed to create room." });
          return;
        }
      }
      room = roomMapping[room];
    }
  
    socket.join(room);
    console.log(`${user} joined room: ${room}`);
  });
  
  
  
  socket.on("send-message", async ({ room, message, sender }) => {
    if (!room || !message || !sender) {
      socket.emit("error", { message: "Missing required fields: room, message, or sender." });
      return;
    }
  
    // Check if the room is in UUID format; map it if necessary
    if (!isUUID(room)) {
      if (!roomMapping[room]) {
        const newRoomId = uuidv4();
        roomMapping[room] = newRoomId;
        const defaultCategoryId =1;
        try {
          await pool.query(
            `INSERT INTO chat_sessions (id, category_id) VALUES ($1, $2)`,
            [newRoomId,defaultCategoryId]
          );
          console.log(`Mapped and inserted room "${room}" as UUID: ${newRoomId}`);
        } catch (error) {
          console.error("Error inserting room into chat_sessions:", error.message);
          socket.emit("error", { message: "Failed to create room." });
          return;
        }
      }
      room = roomMapping[room];
    }
  
    try {
      const insertQuery = `
        INSERT INTO messages (chat_session_id, sender_id, message, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING *;
      `;
      const result = await pool.query(insertQuery, [room, sender, message]);
  
      if (result.rows.length > 0) {
        const newMessage = result.rows[0];
        const timestamp = newMessage.created_at.toISOString();
  
        io.to(room).emit("receive-message", {
          message: newMessage.message,
          sender: newMessage.sender_id,
          timestamp,
        });
        console.log(`Message from ${sender}: ${message} in room: ${room}`);
      } else {
        socket.emit("error", { message: "Failed to send message." });
      }
    } catch (error) {
      console.error("Error sending message:", error.message);
      socket.emit("error", { message: "Error occurred while sending the message." });
    }
  });
  

  socket.on("typing", ({ room, user, isTyping }) => {
    if (!room || !user) {
      console.error("Missing room or user in typing event.", { room, user });
      return;
    }
  
    console.log(`Typing event in room ${room} by user ${user}: ${isTyping}`);
    socket.to(room).emit("typing-status", { isTyping });
  });
  

  socket.on("disconnect", () => {
    console.log(chalk.magenta("User disconnected:", socket.id));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(chalk.bgMagenta(`Server running on port ${PORT}`)));
