const express = require("express");
const { registerController, loginController ,addAgentController} = require("../controllers/authController");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

// Routes
router.post("/register", registerController); // User registration
router.post("/login", loginController);       // User login
router.post("/admin", addAgentController);

module.exports = router;
