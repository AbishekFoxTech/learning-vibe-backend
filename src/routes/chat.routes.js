const router = require("express").Router();
const { getGroupMessages, getDirectMessages, getChatContacts } = require("../controllers/chat.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/contacts", authenticate, getChatContacts);
router.get("/group/:groupId/messages", authenticate, getGroupMessages);
router.get("/direct/:userId", authenticate, getDirectMessages);

module.exports = router;
