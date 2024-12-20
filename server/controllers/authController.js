const bcrypt = require("bcrypt");
const { validationResult } = require('express-validator');
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

// User Registration
exports.registerController = async (req, res) => {
    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password, role } = req.body;

  try {
    // Check if the user already exists
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user into the database
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

// Login Controller
exports.loginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      console.warn("Login attempt with invalid email:", email);
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const foundUser = userResult.rows[0];
    // Validate password
    const validPassword = await bcrypt.compare(password, foundUser.password);
    if (!validPassword) {
      console.warn("Login attempt with invalid password for user:", email);
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Ensure role exists
    if (!foundUser.role) {
      console.error("Role missing for user:", foundUser.id);
      return res.status(400).json({ message: "Role not found. Please contact support." });
    }

    // Generate JWT token
    const payload = { id: foundUser.id, role: foundUser.role }; // Ensure payload matches expected structure
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    console.log("Login successful for user:", foundUser.id, "Role:", foundUser.role);

    // Return response
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


  
