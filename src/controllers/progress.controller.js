const AppDataSource = require("../config/db");

exports.updateProgress = async (req, res) => {
  try {
    const { studentId, topicId, status } = req.body;

    const progressRepo = AppDataSource.getRepository("Progress");
    const studentRepo = AppDataSource.getRepository("Student");
    const topicRepo = AppDataSource.getRepository("Topic");

    const student = await studentRepo.findOne({ where: { id: studentId } });
    const topic = await topicRepo.findOne({ where: { id: topicId } });

    if (!student || !topic) {
      return res.status(404).json({ message: "Student or Topic not found" });
    }

    let progress = await progressRepo.findOne({
      where: {
        student: { id: studentId },
        topic: { id: topicId },
      },
      relations: ["student", "topic"],
    });

    if (!progress) {
      progress = progressRepo.create({
        student,
        topic,
        status,
      });
    } else {
      progress.status = status;
    }

    await progressRepo.save(progress);

    res.json({ message: "Progress updated", progress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};