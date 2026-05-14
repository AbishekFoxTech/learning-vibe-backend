const AppDataSource = require("../config/db");

/**
 * Creates a notification for a specific user and emits it via socket if online.
 */
async function createNotification(userId, { title, body, type, data }, io) {
  const notifRepo = AppDataSource.getRepository("Notification");
  const notif = notifRepo.create({ title, body, type, data, user: { id: userId } });
  await notifRepo.save(notif);

  if (io) {
    io.to(`user:${userId}`).emit("notification", { title, body, type, data });
  }
  return notif;
}

module.exports = { createNotification };
