const jwt = require("jsonwebtoken");
const AppDataSource = require("../config/db");

// Track online users: userId -> socketId
const onlineUsers = new Map();

function initSocket(io) {
  // Auth middleware for socket
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user?.id;
    if (!userId) return;

    // Join personal room for direct notifications
    socket.join(`user:${userId}`);
    onlineUsers.set(userId, socket.id);

    // Broadcast online status
    io.emit("user:online", { userId });
    socket.emit("online:list", Array.from(onlineUsers.keys()));

    // ── Join group rooms ──────────────────────────
    socket.on("join:group", (groupId) => {
      socket.join(`group:${groupId}`);
    });

    socket.on("leave:group", (groupId) => {
      socket.leave(`group:${groupId}`);
    });

    // ── Group Chat ────────────────────────────────
    socket.on("chat:group:message", async ({ groupId, content, fileUrl, fileType }) => {
      try {
        const messageRepo = AppDataSource.getRepository("Message");
        const msg = await messageRepo.save(
          messageRepo.create({
            sender: { id: userId },
            group: { id: groupId },
            content,
            fileUrl,
            fileType,
          })
        );

        // Fetch with sender info
        const saved = await messageRepo.findOne({
          where: { id: msg.id },
          relations: ["sender"],
        });

        io.to(`group:${groupId}`).emit("chat:group:message", saved);
      } catch (err) {
        console.error("Socket group message error:", err);
      }
    });

    // ── Direct Chat ───────────────────────────────
    socket.on("chat:direct:message", async ({ recipientId, content, fileUrl, fileType }) => {
      try {
        const messageRepo = AppDataSource.getRepository("Message");
        const msg = await messageRepo.save(
          messageRepo.create({
            sender: { id: userId },
            recipientUser: { id: recipientId },
            content,
            fileUrl,
            fileType,
          })
        );

        const saved = await messageRepo.findOne({
          where: { id: msg.id },
          relations: ["sender", "recipientUser"],
        });

        // Send to recipient
        io.to(`user:${recipientId}`).emit("chat:direct:message", saved);
        // Send back to sender
        socket.emit("chat:direct:message", saved);
      } catch (err) {
        console.error("Socket direct message error:", err);
      }
    });

    // ── Typing Indicators ─────────────────────────
    socket.on("typing:start", ({ groupId, recipientId }) => {
      const payload = { userId, groupId };
      if (groupId) io.to(`group:${groupId}`).emit("typing:start", payload);
      if (recipientId) io.to(`user:${recipientId}`).emit("typing:start", payload);
    });

    socket.on("typing:stop", ({ groupId, recipientId }) => {
      const payload = { userId, groupId };
      if (groupId) io.to(`group:${groupId}`).emit("typing:stop", payload);
      if (recipientId) io.to(`user:${recipientId}`).emit("typing:stop", payload);
    });

    // ── Disconnect ────────────────────────────────
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("user:offline", { userId });
    });
  });
}

module.exports = { initSocket, onlineUsers };
