const AppDataSource = require("../config/db");

// Helper to get Staff ID from User ID
const getStaffIdFromUser = async (userId) => {
  const staffRepo = AppDataSource.getRepository("Staff");
  const staff = await staffRepo.findOne({ where: { user: { id: userId } } });
  return staff ? staff.id : null;
};

const getScopeForUser = async (req) => {
  if (req.user.role === "ADMIN") return { isAdmin: true, staffId: null };
  const staffId = await getStaffIdFromUser(req.user.id);
  return { isAdmin: false, staffId };
};

exports.getAssignedStudents = async (req, res) => {
  try {
    const { isAdmin, staffId } = await getScopeForUser(req);
    if (!isAdmin && !staffId) return res.status(404).json({ message: "Staff profile not found" });

    const studentRepo = AppDataSource.getRepository("Student");
    const students = await studentRepo.find({
      where: isAdmin ? {} : { staff: { id: staffId } },
      relations: ["user", "course"],
    });

    // Format response to flatten user data
    const formatted = students.map((s) => ({
      id: s.id,
      name: s.user.name,
      email: s.user.email,
      course: s.course ? s.course.name : "N/A",
      mode: s.mode,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params; // student id
    const studentRepo = AppDataSource.getRepository("Student");
    const { isAdmin, staffId } = await getScopeForUser(req);
    if (!isAdmin && !staffId) return res.status(404).json({ message: "Staff profile not found" });

    const student = await studentRepo.findOne({
      where: isAdmin ? { id } : { id, staff: { id: staffId } },
      relations: [
        "user",
        "course",
        "course.modules",
        "course.modules.topics",
        "progress",
        "progress.topic",
        "tasks",
        "tasks.topic",
      ],
    });

    if (!student) return res.status(404).json({ message: "Student not found" });

    // Calculate progress percentage
    const totalTopics = student.progress.length;
    const completedTopics = student.progress.filter((p) => p.status === "COMPLETED").length;
    const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    res.json({
      student: {
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        phone: student.user.phone,
        college: student.college,
        mode: student.mode,
      },
      course: student.course.name,
      progressPercent,
      syllabus: student.course.modules.map((mod) => ({
        id: mod.id,
        title: mod.title,
        topics: mod.topics.map((topic) => {
          const p = student.progress.find((prog) => prog.topicId === topic.id);
          return {
            id: topic.id,
            title: topic.title,
            status: p ? p.status : "NOT_STARTED",
          };
        }),
      })),
      tasks: student.tasks.map((task) => ({
        id: task.id,
        description: task.description,
        imageUrl: task.imageUrl,
        status: task.status,
        submissionText: task.submissionText,
        submissionUrl: task.submissionUrl,
        submittedAt: task.submittedAt,
        feedback: task.feedback,
        topicId: task.topic?.id,
        topicTitle: task.topic?.title,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { studentId, topicId, status } = req.body;
    const progressRepo = AppDataSource.getRepository("Progress");
    const { isAdmin, staffId } = await getScopeForUser(req);
    if (!isAdmin && !staffId) return res.status(404).json({ message: "Staff profile not found" });

    const progress = await progressRepo.findOne({
      where: isAdmin
        ? { student: { id: studentId }, topic: { id: topicId } }
        : { student: { id: studentId, staff: { id: staffId } }, topic: { id: topicId } },
    });

    if (!progress) return res.status(404).json({ message: "Progress record not found" });

    progress.status = status;
    await progressRepo.save(progress);

    res.json({ message: "Progress updated successfully", status: progress.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { studentId, topicId, description, imageUrl } = req.body;
    const taskRepo = AppDataSource.getRepository("Task");
    const studentRepo = AppDataSource.getRepository("Student");
    const topicRepo = AppDataSource.getRepository("Topic");

    const { isAdmin, staffId } = await getScopeForUser(req);
    if (!isAdmin && !staffId) return res.status(404).json({ message: "Staff profile not found" });

    const student = await studentRepo.findOne({
      where: isAdmin ? { id: studentId } : { id: studentId, staff: { id: staffId } },
    });
    const topic = await topicRepo.findOne({ where: { id: topicId } });

    if (!student || !topic) return res.status(404).json({ message: "Student or Topic not found" });

    const task = taskRepo.create({
      student, topic, description, status: "ASSIGNED",
      ...(imageUrl && { imageUrl }),
    });

    await taskRepo.save(task);
    res.json({ message: "Task assigned successfully", task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reviewTask = async (req, res) => {
  try {
    const { taskId, status, feedback } = req.body;
    const taskRepo = AppDataSource.getRepository("Task");

    const { isAdmin, staffId } = await getScopeForUser(req);
    if (!isAdmin && !staffId) return res.status(404).json({ message: "Staff profile not found" });

    const task = await taskRepo.findOne({
      where: isAdmin ? { id: taskId } : { id: taskId, student: { staff: { id: staffId } } },
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = status; // APPROVED / REJECTED
    task.feedback = feedback;

    await taskRepo.save(task);

    res.json({ message: "Task reviewed successfully", task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, imageUrl } = req.body;
    const taskRepo = AppDataSource.getRepository("Task");

    const { isAdmin, staffId } = await getScopeForUser(req);
    if (!isAdmin && !staffId) return res.status(404).json({ message: "Staff profile not found" });

    const task = await taskRepo.findOne({
      where: isAdmin ? { id } : { id, student: { staff: { id: staffId } } },
    });

    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.status !== "ASSIGNED" && task.status !== "REJECTED") {
      return res.status(400).json({ message: "Cannot edit a task that has been submitted or approved." });
    }

    if (description) task.description = description;
    if (imageUrl !== undefined) task.imageUrl = imageUrl || null;

    await taskRepo.save(task);
    res.json({ message: "Task updated successfully", task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const taskRepo = AppDataSource.getRepository("Task");

    const { isAdmin, staffId } = await getScopeForUser(req);
    if (!isAdmin && !staffId) return res.status(404).json({ message: "Staff profile not found" });

    const task = await taskRepo.findOne({
      where: isAdmin ? { id } : { id, student: { staff: { id: staffId } } },
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    await taskRepo.remove(task);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};