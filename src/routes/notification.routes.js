const router = require("express").Router();
const { getMyNotifications, markAllRead, getUnreadCount } = require("../controllers/notification.controller");
const authenticate = require("../middleware/auth.middleware");

router.get("/my", authenticate, getMyNotifications);
router.get("/unread-count", authenticate, getUnreadCount);
router.patch("/read-all", authenticate, markAllRead);

module.exports = router;
