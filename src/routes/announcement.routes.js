const router = require("express").Router();
const { createAnnouncement, getAnnouncements, getMyAnnouncements, deleteAnnouncement } = require("../controllers/announcement.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

router.post("/", authenticate, authorize("ADMIN", "STAFF"), createAnnouncement);
router.get("/", authenticate, authorize("ADMIN", "STAFF"), getAnnouncements);
router.get("/my", authenticate, authorize("STUDENT"), getMyAnnouncements);
router.delete("/:id", authenticate, authorize("ADMIN", "STAFF"), deleteAnnouncement);

module.exports = router;
