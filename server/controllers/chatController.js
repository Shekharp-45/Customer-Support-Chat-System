const bcrypt = require("bcrypt");
const pool = require("../config/db");
require("dotenv").config();
const { v4: uuidv4 , validate: isUUID  } = require("uuid");

// Create a new chat session
const createChatSession = async (req, res) => {
  const { customerId, categoryId } = req.body;

  // Debugging log
  console.log("Received data:", { customerId, categoryId });

  try {
    const result = await pool.query(
      `INSERT INTO chat_sessions (id, customer_id, category_id) VALUES (gen_random_uuid(), $1, $2) RETURNING *`,
      [customerId, categoryId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating chat session:", error.message);
    res.status(500).send("Failed to create chat session");
  }
};

// Get messages for a chat session
const getChatMessages = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM chat_messages WHERE chat_session_id = $1 ORDER BY timestamp ASC`,
      [sessionId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching chat messages:", error.message);
    res.status(500).send("Failed to fetch messages");
  }
};

// Send a message in a chat session
const sendMessage = async (req, res) => {
  const { sessionId } = req.params;
  const { senderId, receiverId, message } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO chat_messages (chat_session_id, sender_id, receiver_id, message) VALUES ($1, $2, $3, $4) RETURNING *`,
      [sessionId, senderId, receiverId, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).send("Failed to send message");
  }
};

// Get chats by category
const getChatByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const query = `
      SELECT cs.id AS chat_session_id, 
             u.name AS user_name, 
             cat.name AS category, 
             cm.message, 
             cm.timestamp
      FROM chat_sessions cs
      JOIN users u ON cs.customer_id = u.id
      JOIN chat_messages cm ON cs.id = cm.chat_session_id
      JOIN categories cat ON cs.category_id = cat.id
      WHERE cat.name = $1
      ORDER BY cm.timestamp ASC;
    `;

    const result = await pool.query(query, [category]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No chats found for this category." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching chats by category:", error.message);
    res.status(500).json({ message: "Failed to fetch chats." });
  }
};

// Get messages between two users
// Get messages between two users
const getMessages = async (req, res, next) => {
  try {
    const { from, chatSessionId } = req.body;

    const query = `
      SELECT sender_id, message, created_at
      FROM messages
      WHERE chat_session_id = $1
      ORDER BY created_at ASC;
    `;

    const result = await pool.query(query, [chatSessionId]);

    const projectedMessages = result.rows.map((msg) => ({
      fromSelf: msg.sender_id === from,
      message: msg.message,
      timestamp: msg.created_at,
    }));

    res.json(projectedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    next(error);
  }
};

// Add a new message to the database
const addMessage = async (req, res, next) => {
  try {
    const { from, message, chatSessionId } = req.body;
    console.log("Request Body:", req.body);

    // Validate inputs
    if (!from || !isUUID(from)) {
      return res.status(400).json({ msg: "Invalid sender ID format." });
    }

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ msg: "Message cannot be empty." });
    }

    if (!chatSessionId || !isUUID(chatSessionId)) {
      return res.status(400).json({ msg: "Invalid chat session ID format." });
    }

    // Insert message into the database
    const query = `
      INSERT INTO messages (chat_session_id, sender_id, message, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, chat_session_id, sender_id, message, created_at;
    `;

    const result = await pool.query(query, [chatSessionId, from, message]);

    if (result.rows.length > 0) {
      res.json({ 
        msg: "Message added successfully.", 
        data: result.rows[0] 
      });
    } else {
      res.status(500).json({ msg: "Failed to add message to the database." });
    }
  } catch (error) {
    console.error("Error adding message:", error.message);
    next(error);
  }
};



const getChatHistoryByRoomId = async (req, res) => {
  const roomId = req.params.roomId;

  if (!roomId) {
    console.error("[ERROR] Room ID is missing in the request.");
    return res.status(400).send({ error: "Room ID is required." });
  }

  try {
    console.log(`[GET] Fetching messages for roomId: ${roomId}`);

    const { rows } = await pool.query(
      "SELECT * FROM messages WHERE chat_session_id = $1 ORDER BY created_at ASC",
      [roomId]
    );

    if (rows.length === 0) {
      console.log(`[INFO] No messages found for roomId: ${roomId}`);
      return res.status(404).send({ error: "No messages found for this room." });
    }

    res.status(200).send({
      status: "success",
      data: rows,
    });
  } catch (err) {
    console.error("[ERROR] Database error:", err);
    res.status(500).send({ error: "Failed to fetch messages for the room." });
  }
};


const getChatHistoryBySession = async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    console.error("[ERROR] Session ID is missing.");
    return res.status(400).send({ error: "Session ID is required." });
  }

  try {
    console.log(`[GET] Searching for sessionId like: ${sessionId}`);

    // Find matching session
    const sessionQuery = await pool.query(
      "SELECT id FROM chat_sessions WHERE id::TEXT LIKE $1",
      [`%${sessionId}%`]
    );

    if (sessionQuery.rows.length === 0) {
      console.log(`[INFO] No session found matching: ${sessionId}`);
      return res.status(404).send({ error: "Session not found." });
    }

    const matchedSessionId = sessionQuery.rows[0].id;

    // Fetch messages for the matched session
    const chatQuery = await pool.query(
      "SELECT sender_id, message, created_at FROM messages WHERE chat_session_id = $1 ORDER BY created_at ASC",
      [matchedSessionId]
    );

    if (chatQuery.rows.length === 0) {
      console.log(`[INFO] No messages found for sessionId: ${matchedSessionId}`);
      return res.status(404).send({ error: "No messages found for this session." });
    }

    res.status(200).send({
      status: "success",
      data: chatQuery.rows,
    });
  } catch (err) {
    console.error("[ERROR] Error fetching chat history:", err);
    res.status(500).send({ error: "Failed to fetch chat history." });
  }
};
const getSessionMessages=async (req, res) => {
  const chatSessionId = req.params.chatSessionId;

  try {
    const result = await pool.query(
      `
      SELECT sender_id, chat_session_id, message, created_at
      FROM messages
      WHERE chat_session_id = $1
      ORDER BY created_at ASC;
      `,
      [chatSessionId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching messages');
  }
};





module.exports = { getMessages,getSessionMessages,getChatHistoryByRoomId, addMessage, createChatSession, getChatMessages, sendMessage, getChatByCategory };
