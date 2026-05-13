const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const { createStudent, getMyProfile, getMyCourse, submitTask } = require("../controllers/student.controller");

// Admin/Staff Route
router.post("/create", auth, role("ADMIN", "STAFF"), createStudent);

// Student Portal Routes
router.get("/me", auth, role("STUDENT"), getMyProfile);
router.get("/course", auth, role("STUDENT"), getMyCourse);
router.post("/task/submit", auth, role("STUDENT"), submitTask);

module.exports = router;