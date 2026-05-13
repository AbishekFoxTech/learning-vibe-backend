const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const {
  getAllCourses, getCourseDetail,
  createCourse, createModule, createTopic,
  getCourseWithProgress,
} = require("../controllers/course.controller");

router.get("/", auth, getAllCourses);
router.get("/:id", auth, getCourseDetail);
router.post("/create", auth, role("ADMIN", "STAFF"), createCourse);
router.post("/module", auth, role("ADMIN", "STAFF"), createModule);
router.post("/topic", auth, role("ADMIN", "STAFF"), createTopic);
router.get("/:courseId/student/:studentId", auth, role("ADMIN", "STAFF", "STUDENT"), getCourseWithProgress);

module.exports = router;