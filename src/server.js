import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";

import { connectDatabase } from "./config/database.js";
import {
  notFoundHandler,
  errorHandler,
} from "./middleware/errorHandler.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// Trust the frontend origin explicitly.
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Add protective HTTP headers.
app.use(helmet());

// Limit incoming JSON payload size.
app.use(express.json({ limit: "1mb" }));

// Read form-encoded request bodies.
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// Parse cookies sent with requests.
app.use(cookieParser());

// Apply a general request limit.
// We'll add stricter limits to login and other sensitive routes later.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  })
);

// Basic API health endpoint.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Kifaru Market API is running.",
    timestamp: new Date().toISOString(),
  });
});

// Authentication endpoints.
app.use("/api/auth", authRoutes);

// Unknown routes must be handled before the general error handler.
app.use(notFoundHandler);
app.use(errorHandler);

// Start only after the database connects successfully.
let server;

async function startServer() {
  try {
    await connectDatabase();

    server = app.listen(PORT, () => {
      console.log(`Server running on https://locahost: ${PORT}.`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start the API:", error.message);
    process.exit(1);
  }
}

// Handle shutdown signals cleanly.
async function shutdown() {
  console.log("Shutting down Kifaru Market API...");

  if (server) {
    server.close(async () => {
      try {
        const mongoose = await import("mongoose");
        await mongoose.default.disconnect();
        process.exit(0);
      } catch (error) {
        console.error("Error during shutdown:", error.message);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();

export default app;