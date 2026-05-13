const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const { createTask, submitTask, reviewTask } = require("../controllers/task.controller");
router.post("/create", auth, role("ADMIN", "STAFF"), createTask);
router.post("/submit", auth, role("STUDENT"), submitTask);
router.post("/review", auth, role("ADMIN", "STAFF"), reviewTask);

module.exports = router;