const express = require("express");
const { registerController, loginController } = require("../controllers/authController");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

// Routes
router.post("/register", registerController); // User registration
router.post("/login", loginController);       // User login


module.exports = router;
