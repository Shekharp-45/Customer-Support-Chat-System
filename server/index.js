import express from 'express';
import authRoutes from './routes/authRoute.js'; // Note the .js extension
import dotenv from 'dotenv';
import cors from 'cors';
import chalk from 'chalk';

dotenv.config(); // Initialize dotenv

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("Welcome to the Authentication API!");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(chalk.bgMagenta(`Server running on port ${PORT}`)));

