const AppDataSource = require("../config/db");

// GET /api/notifications/my
const getMyNotifications = async (req, res) => {
  try {
    const notifRepo = AppDataSource.getRepository("Notification");
    const notifications = await notifRepo.find({
      where: { user: { id: req.user.id } },
      order: { createdAt: "DESC" },
      take: 50,
    });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// PATCH /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    const notifRepo = AppDataSource.getRepository("Notification");
    await notifRepo.update({ user: { id: req.user.id }, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update notifications" });
  }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const notifRepo = AppDataSource.getRepository("Notification");
    const count = await notifRepo.count({ where: { user: { id: req.user.id }, isRead: false } });
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch count" });
  }
};

module.exports = { getMyNotifications, markAllRead, getUnreadCount };
