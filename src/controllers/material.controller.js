const AppDataSource = require("../config/db");

// POST /api/materials - Upload material
const uploadMaterial = async (req, res) => {
  try {
    const { title, type, description, topicId, groupId } = req.body;
    const fileUrl = req.file?.path || req.body.fileUrl;

    if (!fileUrl) return res.status(400).json({ error: "File or URL is required" });

    const materialRepo = AppDataSource.getRepository("StudyMaterial");
    const material = await materialRepo.save(
      materialRepo.create({
        title,
        type: type || "DOC",
        fileUrl,
        description,
        topic: topicId ? { id: topicId } : null,
        group: groupId ? { id: groupId } : null,
        uploadedBy: { id: req.user.id },
      })
    );

    res.status(201).json({ message: "Material uploaded", material });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload material" });
  }
};

// GET /api/materials/group/:groupId
const getMaterialsByGroup = async (req, res) => {
  try {
    const materialRepo = AppDataSource.getRepository("StudyMaterial");
    const materials = await materialRepo.find({
      where: { group: { id: req.params.groupId } },
      relations: ["uploadedBy", "topic"],
      order: { createdAt: "DESC" },
    });
    res.json(materials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch materials" });
  }
};

// GET /api/materials/topic/:topicId
const getMaterialsByTopic = async (req, res) => {
  try {
    const materialRepo = AppDataSource.getRepository("StudyMaterial");
    const materials = await materialRepo.find({
      where: { topic: { id: req.params.topicId } },
      relations: ["uploadedBy"],
      order: { createdAt: "DESC" },
    });
    res.json(materials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch materials" });
  }
};

// DELETE /api/materials/:id
const deleteMaterial = async (req, res) => {
  try {
    const materialRepo = AppDataSource.getRepository("StudyMaterial");
    await materialRepo.delete({ id: req.params.id });
    res.json({ message: "Material deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete material" });
  }
};

module.exports = { uploadMaterial, getMaterialsByGroup, getMaterialsByTopic, deleteMaterial };
