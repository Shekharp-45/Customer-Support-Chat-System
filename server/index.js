import express from "express";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoute.js";
import chatRoutes from "./routes/chatRoutes.js";
import dotenv from "dotenv";
import cors from "cors";
import chalk from "chalk";
import bodyParser from "body-parser";
import pool from "./config/db.js";
import { v4 as uuidv4, validate as isUUID } from "uuid";
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

  socket.on("join-room", async ({ room, user, customerId, category }) => {
    try {
      if (!room || typeof room !== "string") {
        console.error("Invalid room name:", room);
        return socket.emit("error", { message: "Invalid room name." });
      }

      if (!customerId) {
        console.error("Missing customer ID.");
        return socket.emit("error", { message: "Customer ID is required." });
      }
      if (user && user !== "Agent") {
        activeCustomers.set(socket.id, {
          name: user,
          issue: category,
          customerId,
        });

        emitActiveCustomers();
      }

      if (!isUUID(room)) {
        if (!roomMapping[room]) {
          const newRoomId = uuidv4();
          roomMapping[room] = newRoomId;
          console.log(`Room "${room}" mapped to UUID "${newRoomId}"`);
          const defaultCategoryId = 1;

          await pool.query(
            `INSERT INTO chat_sessions (id, category_id, customer_id) VALUES ($1, $2, $3)`,
            [newRoomId, defaultCategoryId, customerId]
          );
          console.log(
            `Room ${newRoomId} created for customer ID ${customerId}.`
          );
        }
        room = roomMapping[room];
      }
      if (room) {
        socket.join(room);
        console.log(`${user} joined room: ${room}`);
      } else {
        console.error("No room specified.");
      }
    } catch (error) {
      console.error("Error in join-room handler:", error.message);
      socket.emit("error", {
        message: "An error occurred while processing your request.",
      });
    }
  });

  const emitActiveCustomers = () => {
    const customers = Array.from(activeCustomers.values()).map((customer) => ({
      ...customer,
      customerId: customer.customerId,
    }));
    io.emit(
      "active-customers",
      customers.filter((customer) => customer.name !== "Agent")
    );
  };

  socket.on(
    "send-message",
    async ({ room, message, sender, timestamp }, callback) => {
      console.log(`Received message for room ${room}:`, { message, sender });

      try {
        if (!room || !message || !sender) {
          console.error("Missing required fields:", { room, message, sender });
          socket.emit("error", { message: "Missing required fields." });
          return;
        }

        if (!isUUID(room)) {
          if (!roomMapping[room]) {
            const newRoomId = uuidv4();
            roomMapping[room] = newRoomId;

            console.log(`Room "${room}" mapped to UUID "${newRoomId}"`);

            try {
              await pool.query(
                `INSERT INTO chat_sessions (id, category_id) VALUES ($1, $2)`,
                [newRoomId, 1]
              );
            } catch (error) {
              console.error(
                "Error inserting new room into chat_sessions:",
                error.message
              );
              socket.emit("error", { message: "Failed to create new room." });
              return;
            }
          }
          room = roomMapping[room];
        }

        const insertQuery = `
      INSERT INTO messages (chat_session_id, sender_id, message, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
        const result = await pool.query(insertQuery, [
          room,
          sender,
          message,
          timestamp,
        ]);

        if (result.rows.length > 0) {
          const newMessage = result.rows[0];
          const isAgent =
            newMessage.sender_id === "79f82015-d9a2-4b3b-a34c-9c60601604ed";
          console.log("new mwssage ", newMessage);
          console.log("is agent??", isAgent);
          socket.to(room).emit("receive-message", {
            message: newMessage.message,
            sender: newMessage.sender_id,
            timestamp: new Date(newMessage.created_at).toISOString(),
            room,
            isAgent,
          });

          callback && callback({ status: "success", message, room });
        } else {
          console.error("Failed to insert message.");
          socket.emit("error", { message: "Failed to send message." });
        }
      } catch (error) {
        console.error("Error in send-message handler:", error.message);
        socket.emit("error", { message: "Unexpected server error occurred." });
      }
    }
  );

  socket.on("typing", ({ room, user, isTyping }) => {
    if (!isUUID(room)) {
      room = roomMapping[room];
    }

    if (room) {
      console.log(`Typing by ${user} in room: ${room}`);
      socket.to(room).emit("userTyping", { room, user, isTyping });
    } else {
      console.error("Invalid room for typing event.");
    }
  });

  socket.on("disconnect", () => {
    if (activeCustomers.has(socket.id)) {
      activeCustomers.delete(socket.id);
      emitActiveCustomers();
    }
    console.log(chalk.magenta("User disconnected:", socket.id));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(chalk.bgMagenta(`Server running on port ${PORT}`))
);
