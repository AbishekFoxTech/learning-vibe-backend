const AppDataSource = require("../config/db");

exports.createTask = async (req, res) => {
  try {
    const { studentId, topicId, description } = req.body;

    const taskRepo = AppDataSource.getRepository("Task");
    const studentRepo = AppDataSource.getRepository("Student");
    const topicRepo = AppDataSource.getRepository("Topic");

    const student = await studentRepo.findOne({ where: { id: studentId } });
    const topic = await topicRepo.findOne({ where: { id: topicId } });

    if (!student || !topic) {
      return res.status(404).json({ message: "Student or Topic not found" });
    }

    const task = taskRepo.create({
      student,
      topic,
      description,
    });

    await taskRepo.save(task);

    res.json({ message: "Task assigned", task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitTask = async (req, res) => {
  try {
    const { taskId, imageUrl } = req.body;

    const taskRepo = AppDataSource.getRepository("Task");

    const task = await taskRepo.findOne({ where: { id: taskId } });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.imageUrl = imageUrl;
    task.status = "PENDING";

    await taskRepo.save(task);

    res.json({ message: "Task submitted", task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reviewTask = async (req, res) => {
  try {
    const { taskId, status, feedback } = req.body;

    const taskRepo = AppDataSource.getRepository("Task");

    const task = await taskRepo.findOne({ where: { id: taskId } });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = status; // APPROVED / REJECTED
    task.feedback = feedback;

    await taskRepo.save(task);

    res.json({ message: "Task reviewed", task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};