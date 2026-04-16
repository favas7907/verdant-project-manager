import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import authRoutes from "./src/server/routes/auth.routes.js";
import projectRoutes from "./src/server/routes/project.routes.js";
import taskRoutes from "./src/server/routes/task.routes.js";
import notificationRoutes from "./src/server/routes/notification.routes.js";
import Task from "./src/server/models/Task.js";
import Notification from "./src/server/models/Notification.js";
import { createNotification } from "./src/server/lib/notifications.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const PORT = 3000;

  // MongoDB Connection
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined in .env");
  } else {
    mongoose
      .connect(MONGODB_URI)
      .then(() => console.log("Connected to MongoDB Atlas"))
      .catch((err) => console.error("MongoDB connection error:", err));
  }

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Socket.io setup
  app.set("io", io);
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their notification room`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/notifications", notificationRoutes);

  // Deadline Check Job (Runs every hour)
  setInterval(async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nearTasks = await Task.find({
        dueDate: { $lte: tomorrow, $gt: new Date() },
        status: { $ne: "Done" }
      });

      for (const task of nearTasks) {
        if (task.assignedTo) {
          // Check if notification already exists for this task deadline
          const existing = await Notification.findOne({
            recipient: task.assignedTo,
            type: "DEADLINE_NEAR",
            link: { $regex: task._id.toString() }
          });

          if (!existing) {
            await createNotification(io, {
              recipient: task.assignedTo,
              type: "DEADLINE_NEAR",
              message: `Task deadline is approaching: ${task.title}`,
              link: `/projects/${task.project}/tasks/${task._id}`
            });
          }
        }
      }
    } catch (error) {
      console.error("Deadline check error:", error);
    }
  }, 1000 * 60 * 60);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
