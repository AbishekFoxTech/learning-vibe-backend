const bcrypt = require("bcryptjs");
const AppDataSource = require("../config/db");

exports.createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      college,
      address,
      mode,
      courseId,
      staffId,
      password,
    } = req.body;

    const userRepo = AppDataSource.getRepository("User");
    const studentRepo = AppDataSource.getRepository("Student");
    const courseRepo = AppDataSource.getRepository("Course");
    const staffRepo = AppDataSource.getRepository("Staff");

    // 🔍 check existing user
    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 📚 get course + staff
    const course = await courseRepo.findOne({ where: { id: courseId } });
    const staff = await staffRepo.findOne({ where: { id: staffId } });

    if (!course || !staff) {
      return res.status(404).json({ message: "Course or Staff not found" });
    }

    // 🔐 hash password and create login user only after validations pass
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepo.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "STUDENT",
    });
    await userRepo.save(user);

    // 🎓 create student profile
    const student = studentRepo.create({
      user,
      college,
      address,
      mode,
      course,
      staff,
    });

    await studentRepo.save(student);

    // 📈 AUTO-CREATE PROGRESS ROWS
    const topicRepo = AppDataSource.getRepository("Topic");
    const progressRepo = AppDataSource.getRepository("Progress");

    // Fetch all topics for the course (via modules) using QueryBuilder for reliability
    const topics = await topicRepo.createQueryBuilder("topic")
      .leftJoin("topic.module", "module")
      .leftJoin("module.course", "course")
      .where("course.id = :courseId", { courseId })
      .getMany();

    if (topics.length > 0) {
      const progressEntries = topics.map((topic) =>
        progressRepo.create({
          student,
          topic,
          status: "NOT_STARTED",
        })
      );
      await progressRepo.save(progressEntries);
    }

    res.json({
      message: "Student created successfully 🎉",
      login: {
        email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- STUDENT PORTAL APIs (Used by students themselves) ---

exports.getMyProfile = async (req, res) => {
  try {
    const studentRepo = AppDataSource.getRepository("Student");
    const student = await studentRepo.findOne({
      where: { user: { id: req.user.id } },
      relations: ["user", "course"],
    });

    if (!student) return res.status(404).json({ message: "Student profile not found" });

    res.json({
      name: student.user.name,
      email: student.user.email,
      course: student.course.name,
      mode: student.mode,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyCourse = async (req, res) => {
  try {
    const studentRepo = AppDataSource.getRepository("Student");
    const student = await studentRepo.findOne({
      where: { user: { id: req.user.id } },
      relations: [
        "course",
        "course.modules",
        "course.modules.topics",
        "progress",
        "progress.topic",
        "tasks",
        "tasks.topic",
      ],
    });

    if (!student) return res.status(404).json({ message: "Student profile not found" });

    // Calculate progress percentage
    const totalTopics = student.progress.length;
    const completedTopics = student.progress.filter((p) => p.status === "COMPLETED").length;
    const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    res.json({
      courseName: student.course.name,
      progressPercent,
      syllabus: student.course.modules.map((mod) => ({
        id: mod.id,
        title: mod.title,
        topics: mod.topics.map((topic) => {
          const p = student.progress.find((prog) => prog.topic?.id === topic.id || prog.topicId === topic.id);
          const t = student.tasks.filter((task) => task.topic?.id === topic.id);
          return {
            id: topic.id,
            title: topic.title,
            status: p ? p.status : "NOT_STARTED",
            tasks: t.map((task) => ({
              id: task.id,
              description: task.description,
              imageUrl: task.imageUrl,
              status: task.status,
              submissionText: task.submissionText,
              submissionUrl: task.submissionUrl,
              submittedAt: task.submittedAt,
              feedback: task.feedback,
            })),
          };
        }),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitTask = async (req, res) => {
  try {
    const { taskId, message, submissionUrl } = req.body;
    const taskRepo = AppDataSource.getRepository("Task");
    const studentRepo = AppDataSource.getRepository("Student");

    const student = await studentRepo.findOne({ where: { user: { id: req.user.id } } });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const task = await taskRepo.findOne({ where: { id: taskId, student: { id: student.id } } });

    if (!task) return res.status(404).json({ message: "Task not found" });

    task.submissionText = message;
    task.submissionUrl = submissionUrl;
    task.status = "SUBMITTED";
    task.submittedAt = new Date();

    await taskRepo.save(task);
    res.json({ message: "Task submitted successfully", task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};