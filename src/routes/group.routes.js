const router = require("express").Router();
const { createGroup, getGroups, getMyGroups, getGroupById, addMembers, removeMember, deleteGroup } = require("../controllers/group.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.post("/", authenticate, authorize("ADMIN", "STAFF"), createGroup);
router.get("/", authenticate, authorize("ADMIN", "STAFF"), getGroups);
router.get("/my", authenticate, authorize("STUDENT"), getMyGroups);
router.get("/:id", authenticate, getGroupById);
router.post("/:id/members", authenticate, authorize("ADMIN", "STAFF"), addMembers);
router.delete("/:id/members/:memberId", authenticate, authorize("ADMIN", "STAFF"), removeMember);
router.delete("/:id", authenticate, authorize("ADMIN", "STAFF"), deleteGroup);

module.exports = router;
