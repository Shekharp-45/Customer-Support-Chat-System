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
const activeCustomers = new Map();
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
  console.log(chalk.green(`Client connected: ${socket.id}`));

 

socket.on("join-room", async ({ room, user, customerId }) => {
    try {
        if (!room || typeof room !== "string") {
            console.error("Invalid room name:", room);
            return socket.emit("error", { message: "Invalid room name." });
        }

        if (!customerId) {
            console.error("Missing customer ID.");
            return socket.emit("error", { message: "Customer ID is required." });
        }
        if (user && customerId && user !== "Agent") {
          const category = room.split('-')[1]; // Extract only the category
          activeCustomers.set(socket.id, { name: user, issue: category, customerId :customerId}); // Use customerId directly
          emitActiveCustomers();
      }
      
        // Map room names to UUIDs if not already
        if (!isUUID(room)) {
            if (!roomMapping[room]) {
                const newRoomId = uuidv4();
                roomMapping[room] = newRoomId;
                console.log(`Room "${room}" mapped to UUID "${newRoomId}"`);
                const defaultCategoryId = 1; // Replace with your default category ID
                

                // Insert room data into the database
                await pool.query(
                    `INSERT INTO chat_sessions (id, category_id, customer_id) VALUES ($1, $2, $3)`,
                    [newRoomId, defaultCategoryId, customerId]
                );
                console.log(`Room ${newRoomId} created for customer ID ${customerId}.`);
            }
            room = roomMapping[room];
        }
        console.log(`User ${socket.id} joined room: ${room}`);
        console.log("Active rooms:", io.sockets.adapter.rooms);
        // Join the room
        if (room) {
          socket.join(room);
          console.log(`${user} joined room: ${room}`);
      } else {
          console.error("No room specified.");
      }
    } catch (error) {
        console.error("Error in join-room handler:", error.message);
        socket.emit("error", { message: "An error occurred while processing your request." });
    }
});

const emitActiveCustomers = () => {
  const customers = Array.from(activeCustomers.values());
  io.emit("active-customers", customers);
};
  
  
socket.on("send-message", async ({ room, message, sender, timestamp }) => {
  try {
    if (!room || !message || !sender) {
      console.error("Missing required fields:", { room, message, sender });
      socket.emit("error", { message: "Missing required fields." });
      return;
    }

    // Map room to UUID if necessary
    if (!isUUID(room)) {
      if (!roomMapping[room]) {
        const newRoomId = generateUUID(); // Generate a new UUID
    roomMapping[room] = newRoomId;
    console.log(`Room "${room}" mapped to UUID "${newRoomId}"`);
        const defaultCategoryId = 1;

        try {     // Insert the new room into the database
          await pool.query(
            `INSERT INTO chat_sessions (id, category_id) VALUES ($1, $2)`,
            [newRoomId, defaultCategoryId]
          );
          console.log(`Room "${room}" mapped to UUID "${newRoomId}" and inserted into chat_sessions.`);
        } catch (error) {
          console.error("Error inserting new room into chat_sessions:", error.message);
          socket.emit("error", { message: "Failed to create new room." });
          return;
        }
      }
      room = roomMapping[room];
    }
    // Insert the message into the database
    const insertQuery = `
      INSERT INTO messages (chat_session_id, sender_id, message, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [room, sender, message, timestamp]);
    console.log("Message inserted to DB");
    if (result.rows.length > 0 ) {
      const newMessage = result.rows[0];
      socket.to(room).emit("receive-message", {
        message: newMessage.message,
        sender: newMessage.sender_id,
        timestamp: new Date(newMessage.created_at).toISOString(),
        room,
      });
      socket.emit("message-sent", { status: "success", message, room });
      console.log(`Message sent to room ${room}:`, newMessage.message);
      console.log("Emitting to room:", room);
      
    } else {
      console.error("Failed to insert message.");
      socket.emit("error", { message: "Failed to send message." });
    }
  } catch (error) {
    console.error("Error in send-message handler:", error.message);
    socket.emit("error", { message: "Unexpected server error occurred." });
  }
});




  socket.on("typing", ({ room, user, isTyping }) => {
    if (!room || !user) {
      console.error("Missing room or user in typing event.", { room, user });
      return;
    }
  
    console.log(`Typing event in room ${room} by user ${user}: ${isTyping}`);
    socket.to(room).emit("typing-status", { user, isTyping });
  });
  

  socket.on("disconnect", () => {
    if (activeCustomers.has(socket.id)) {
      activeCustomers.delete(socket.id);
      emitActiveCustomers(); // Update list when a customer disconnects
    }
    console.log(chalk.magenta("User disconnected:", socket.id));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(chalk.bgMagenta(`Server running on port ${PORT}`)));
