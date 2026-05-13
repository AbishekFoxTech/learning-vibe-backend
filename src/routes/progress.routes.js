const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const { updateProgress } = require("../controllers/progress.controller");

router.post("/update", auth, role("ADMIN", "STAFF"), updateProgress);

module.exports = router;