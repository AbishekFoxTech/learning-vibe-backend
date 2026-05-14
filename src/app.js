require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const AppDataSource = require("./config/db");
const { initSocket } = require("./sockets");

// ── Import Routes ──────────────────────────────────────
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const courseRoutes = require("./routes/course.routes");
const studentRoutes = require("./routes/student.routes");
const staffRoutes = require("./routes/staff.routes");
const progressRoutes = require("./routes/progress.routes");
const userRoutes = require("./routes/user.routes");
const taskRoutes = require("./routes/task.routes");
// Phase 2
const attendanceRoutes = require("./routes/attendance.routes");
const groupRoutes = require("./routes/group.routes");
const groupTaskRoutes = require("./routes/groupTask.routes");
const materialRoutes = require("./routes/material.routes");
const announcementRoutes = require("./routes/announcement.routes");
const chatRoutes = require("./routes/chat.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();
const server = http.createServer(app);

// ── Socket.IO ──────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
initSocket(io);

// Pass io to controllers that need it
const announcementController = require("./controllers/announcement.controller");
const groupTaskController = require("./controllers/groupTask.controller");
announcementController.setIo(io);
groupTaskController.setIo(io);

// ── Middleware ─────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ── Health Check ───────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Learning Vibe API v2 is running 🚀" });
});

// ── Routes ─────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/user", userRoutes);
app.use("/api/task", taskRoutes);
// Phase 2
app.use("/api/attendance", attendanceRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/group-tasks", groupTaskRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

// ── Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// ── Start Server ───────────────────────────────────────
const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Database connected successfully");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔌 Socket.IO ready`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });
