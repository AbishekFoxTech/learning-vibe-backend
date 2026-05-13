const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const {
  getAssignedStudents,
  getStudentDetails,
  updateProgress,
  createTask,
  reviewTask,
  updateTask,
  deleteTask,
} = require("../controllers/staff.controller");

// All routes here require Auth and STAFF role
router.use(auth, role("STAFF", "ADMIN"));

router.get("/students", getAssignedStudents);
router.get("/student/:id", getStudentDetails);
router.patch("/progress", updateProgress);
router.post("/task", createTask);
router.patch("/task/review", reviewTask);
router.patch("/task/:id", updateTask);
router.delete("/task/:id", deleteTask);

module.exports = router;
