const bcrypt = require("bcrypt");
const { validationResult } = require('express-validator');
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();


exports.registerController = async (req, res) => {
    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password, role } = req.body;
  
  
  try {
    const validRoles = ["admin", "agent", "customer"];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role specified" });
  }
   
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, hashedPassword, role || "customer"]
    );

    res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
exports.loginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      console.warn("Login attempt with invalid email:", email);
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const foundUser = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, foundUser.password);
    if (!validPassword) {
      console.warn("Login attempt with invalid password for user:", email);
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    if (!foundUser.role) {
      console.error("Role missing for user:", foundUser.id);
      return res.status(400).json({ message: "Role not found. Please contact support." });
    }

    const payload = { id: foundUser.id, role: foundUser.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    console.log("Login successful for user:", foundUser.id, "Role:", foundUser.role);

    return res.status(200).json({
      token,
      role: foundUser.role,
      message: "Login successful",
    });
  } catch (err) {
    console.error("Error during login:", err.message);
    return res.status(500).json({ message: "Server Error" });
  }
};


exports.addAgentController = async (req, res) => {
  const { fullName, email, mobile } = req.body;

  try {
    const newAgent = await pool.query(
      "INSERT INTO agents (name, email, mobile) VALUES ($1, $2, $3) RETURNING *",
      [fullName, email, mobile]
    );

    res.status(201).json({ message: "Agent added successfully", agent: newAgent.rows[0] });
  } catch (error) {
    console.error(error.message);
    if (error.code === "23505") {
      res.status(400).json({ message: "Email already exists" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};


  
exports.agentLoginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    const agent = await pool.query("SELECT * FROM agents WHERE email = $1", [email]);
    if (agent.rows.length === 0) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const validPassword = await bcrypt.compare(password, agent.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const payload = { id: agent.rows[0].id, role: "agent" };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(200).json({ token, message: "Agent login successful" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
