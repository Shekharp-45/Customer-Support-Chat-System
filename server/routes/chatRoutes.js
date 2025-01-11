const express = require("express");
const {
  createChatSession,
  getChatMessages,
  sendMessage,
  getChatByCategory,
  addMessage,
  getChatHistoryByRoomId,
  getConversations,
  getMessages,
  getSessionMessages,
} = require("../controllers/chatController");
const pool = require("../config/db");
const { v4: uuidv4, validate: isUUID } = require("uuid");

const router = express.Router();
router.post("/", async (req, res) => {
  const { sender_id, receiver_id, message } = req.body;
  const chat_session_id = uuidv4(); // Generates a valid UUID

  try {
    const result = await pool.query(
      `INSERT INTO chat_messages (chat_session_id, sender_id, receiver_id, message)
         VALUES ($1, $2, $3, $4) RETURNING *`,
      [chat_session_id, sender_id, receiver_id, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error saving message:", error.message);
    res.status(500).send("Failed to save message.");
  }
});

// Create a new chat session
router.post("/sessions", createChatSession);

// Get messages for a chat session
router.get("/:sessionId/messages", getChatMessages);

// Send a message in a chat session
router.post("/:sessionId/send-message", sendMessage);

// Get chats by category
router.get("/category/:category", getChatByCategory);

router.post("/addmsg/", addMessage);
router.post("/getmsg/", getMessages);
router.get("/history/:roomId", getChatHistoryByRoomId);
router.get("/conversations/:chatSessionId", getSessionMessages);
router.get("/conversations", getConversations);
module.exports = router;
