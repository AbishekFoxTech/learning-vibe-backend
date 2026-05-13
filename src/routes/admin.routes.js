const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const {
  getDashboardStats, getStaffList,
  getAllStudents, getStudentDetail,
  getAllStaff, getStaffDetail,
  createStaff,
} = require("../controllers/admin.controller");

router.get("/dashboard", auth, role("ADMIN"), getDashboardStats);
router.get("/staff-list", auth, role("ADMIN"), getStaffList);
router.get("/students", auth, role("ADMIN"), getAllStudents);
router.get("/students/:id", auth, role("ADMIN"), getStudentDetail);
router.get("/staff", auth, role("ADMIN"), getAllStaff);
router.get("/staff/:id", auth, role("ADMIN"), getStaffDetail);
router.post("/create-staff", auth, role("ADMIN"), createStaff);

module.exports = router;