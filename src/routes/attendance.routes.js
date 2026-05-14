const router = require("express").Router();
const { checkIn, checkOut, getMyAttendance, getStudentAttendance, markAttendance, getTodayStatus } = require("../controllers/attendance.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.post("/checkin", authenticate, authorize("STUDENT"), checkIn);
router.post("/checkout", authenticate, authorize("STUDENT"), checkOut);
router.get("/today", authenticate, authorize("STUDENT"), getTodayStatus);
router.get("/my", authenticate, authorize("STUDENT"), getMyAttendance);
router.get("/student/:studentId", authenticate, authorize("STAFF", "ADMIN"), getStudentAttendance);
router.post("/mark", authenticate, authorize("STAFF", "ADMIN"), markAttendance);

module.exports = router;
