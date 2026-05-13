const AppDataSource = require("../config/db");

exports.getAllCourses = async (req, res) => {
  try {
    const courseRepo = AppDataSource.getRepository("Course");
    const courses = await courseRepo.find({ order: { name: "ASC" } });
    res.json(courses);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getCourseDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const courseRepo = AppDataSource.getRepository("Course");
    const course = await courseRepo.findOne({
      where: { id },
      relations: ["modules", "modules.topics"],
    });
    if (!course) return res.status(404).json({ message: "Course not found" });
    course.modules?.sort((a, b) => (a.order || 0) - (b.order || 0));
    course.modules?.forEach((m) => m.topics?.sort((a, b) => (a.order || 0) - (b.order || 0)));
    res.json({
      id: course.id, name: course.name, duration: course.duration,
      moduleCount: course.modules?.length || 0,
      topicCount: course.modules?.reduce((acc, m) => acc + (m.topics?.length || 0), 0) || 0,
      modules: course.modules,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};


exports.createCourse = async (req, res) => {
  try {
    const { name, duration } = req.body;

    const courseRepo = AppDataSource.getRepository("Course");

    const course = courseRepo.create({ name, duration });

    await courseRepo.save(course);

    res.json({ message: "Course created", course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createModule = async (req, res) => {
  try {
    const { title, order, courseId } = req.body;

    const moduleRepo = AppDataSource.getRepository("Module");
    const courseRepo = AppDataSource.getRepository("Course");

    const course = await courseRepo.findOne({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const module = moduleRepo.create({
      title,
      order,
      course,
    });

    await moduleRepo.save(module);

    res.json({ message: "Module added", module });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTopic = async (req, res) => {
  try {
    const { title, order, moduleId } = req.body;

    const topicRepo = AppDataSource.getRepository("Topic");
    const moduleRepo = AppDataSource.getRepository("Module");

    const module = await moduleRepo.findOne({
      where: { id: moduleId },
    });

    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    const topic = topicRepo.create({
      title,
      order,
      module,
    });

    await topicRepo.save(topic);

    res.json({ message: "Topic added", topic });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getCourseWithProgress = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    const studentRepo = AppDataSource.getRepository("Student");

    const courseRepo = AppDataSource.getRepository("Course");
    const student = await studentRepo.findOne({
      where: { id: studentId },
      relations: ["user", "staff", "staff.user"],
    });
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (req.user.role === "STUDENT" && student.user?.id !== req.user.id) {
      return res.status(403).json({ message: "Not allowed to access this student progress" });
    }
    if (req.user.role === "STAFF" && student.staff?.user?.id !== req.user.id) {
      return res.status(403).json({ message: "Not allowed to access this student progress" });
    }

    const course = await courseRepo.findOne({
      where: { id: courseId },
      relations: [
        "modules",
        "modules.topics",
        "modules.topics.progress",
      ],
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // filter progress only for this student
    const formatted = {
      id: course.id,
      name: course.name,
      modules: course.modules.map((mod) => ({
        id: mod.id,
        title: mod.title,
        topics: mod.topics.map((topic) => {
          const progress = topic.progress.find(
            (p) => p.studentId === studentId
          );

          return {
            id: topic.id,
            title: topic.title,
            status: progress ? progress.status : "NOT_STARTED",
          };
        }),
      })),
    };

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};