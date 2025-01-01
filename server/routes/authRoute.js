const express = require("express");
const { registerController, loginController ,addAgentController} = require("../controllers/authController");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registerController); 
router.post("/login", loginController);       
router.post("/admin", addAgentController);

module.exports = router;
