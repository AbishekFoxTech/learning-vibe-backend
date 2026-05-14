const router = require("express").Router();
const { upload } = require("../config/cloudinary");
const { uploadMaterial, getMaterialsByGroup, getMaterialsByTopic, deleteMaterial } = require("../controllers/material.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

router.post("/", authenticate, authorize("ADMIN", "STAFF"), upload.single("file"), uploadMaterial);
router.get("/group/:groupId", authenticate, getMaterialsByGroup);
router.get("/topic/:topicId", authenticate, getMaterialsByTopic);
router.delete("/:id", authenticate, authorize("ADMIN", "STAFF"), deleteMaterial);

module.exports = router;
