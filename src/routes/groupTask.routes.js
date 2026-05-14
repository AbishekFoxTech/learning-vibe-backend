const router = require("express").Router();
const { upload } = require("../config/cloudinary");
const {
  createGroupTask,
  getGroupTasks,
  getMyGroupTasks,
  submitTask,
  reviewSubmission,
  deleteGroupTask,
} = require("../controllers/groupTask.controller");
const { authenticate } = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

router.post("/", authenticate, authorize("ADMIN", "STAFF"), createGroupTask);
router.get("/group/:groupId", authenticate, getGroupTasks);
router.get("/my", authenticate, authorize("STUDENT"), getMyGroupTasks);
router.post("/submit/:submissionId", authenticate, authorize("STUDENT"), upload.single("file"), submitTask);
router.patch("/review/:submissionId", authenticate, authorize("ADMIN", "STAFF"), reviewSubmission);
router.delete("/:id", authenticate, authorize("ADMIN", "STAFF"), deleteGroupTask);

module.exports = router;
