const bcrypt = require("bcryptjs");
const AppDataSource = require("../config/db");

exports.getDashboardStats = async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository("User");
    const courseRepo = AppDataSource.getRepository("Course");
    const [staffCount, studentCount, courseCount] = await Promise.all([
      userRepo.count({ where: { role: "STAFF" } }),
      userRepo.count({ where: { role: "STUDENT" } }),
      courseRepo.count(),
    ]);
    res.json({ staffCount, studentCount, courseCount });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getStaffList = async (req, res) => {
  try {
    const staffRepo = AppDataSource.getRepository("Staff");
    const list = await staffRepo.find({ relations: ["user"] });
    res.json(list.map((s) => ({ id: s.id, name: s.user.name, email: s.user.email })));
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAllStudents = async (req, res) => {
  try {
    const studentRepo = AppDataSource.getRepository("Student");
    const students = await studentRepo.find({
      relations: ["user", "course", "staff", "staff.user"],
    });
    res.json(students.map((s) => ({
      id: s.id,
      name: s.user?.name,
      email: s.user?.email,
      phone: s.user?.phone,
      college: s.college,
      mode: s.mode,
      course: s.course?.name || "N/A",
      staff: s.staff?.user?.name || "Unassigned",
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getStudentDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const studentRepo = AppDataSource.getRepository("Student");
    const s = await studentRepo.findOne({
      where: { id },
      relations: ["user", "course", "course.modules", "course.modules.topics", "staff", "staff.user", "progress", "progress.topic"],
    });
    if (!s) return res.status(404).json({ message: "Student not found" });
    const total = s.progress?.length || 0;
    const done = s.progress?.filter((p) => p.status === "COMPLETED").length || 0;
    res.json({
      id: s.id, name: s.user?.name, email: s.user?.email, phone: s.user?.phone,
      college: s.college, mode: s.mode,
      staffName: s.staff?.user?.name || "Unassigned",
      course: s.course?.name || "N/A",
      progressPercent: total > 0 ? Math.round((done / total) * 100) : 0,
      syllabus: s.course?.modules?.map((mod) => ({
        id: mod.id, title: mod.title,
        topics: mod.topics?.map((topic) => {
          const p = s.progress?.find((pr) => pr.topicId === topic.id);
          return { id: topic.id, title: topic.title, status: p?.status || "NOT_STARTED" };
        }) || [],
      })) || [],
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAllStaff = async (req, res) => {
  try {
    const staffRepo = AppDataSource.getRepository("Staff");
    const list = await staffRepo.find({ relations: ["user", "students"] });
    res.json(list.map((s) => ({
      id: s.id, name: s.user?.name, email: s.user?.email,
      phone: s.user?.phone, studentCount: s.students?.length || 0,
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getStaffDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const staffRepo = AppDataSource.getRepository("Staff");
    const staff = await staffRepo.findOne({
      where: { id },
      relations: ["user", "students", "students.user", "students.course"],
    });
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json({
      id: staff.id, name: staff.user?.name, email: staff.user?.email, phone: staff.user?.phone,
      students: staff.students?.map((s) => ({
        id: s.id, name: s.user?.name, email: s.user?.email, course: s.course?.name || "N/A",
      })) || [],
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createStaff = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const userRepo = AppDataSource.getRepository("User");
    const staffRepo = AppDataSource.getRepository("Staff");
    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepo.create({ name, email, phone, password: hashedPassword, role: "STAFF" });
    await userRepo.save(user);
    const staffProfile = staffRepo.create({ user });
    await staffRepo.save(staffProfile);
    res.json({ message: "Staff created successfully", staff: { id: user.id, profileId: staffProfile.id, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
};