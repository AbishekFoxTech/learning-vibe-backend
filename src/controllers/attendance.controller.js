const AppDataSource = require("../config/db");

// POST /api/attendance/checkin
const checkIn = async (req, res) => {
  try {
    const { wifiValidated, ssid } = req.body;
    const studentRepo = AppDataSource.getRepository("Student");
    const attendanceRepo = AppDataSource.getRepository("Attendance");

    const student = await studentRepo.findOne({ where: { user: { id: req.user.id } } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    // For OFFLINE students, require WiFi validation
    if (student.mode === "OFFLINE" && !wifiValidated) {
      return res.status(403).json({
        error: "Attendance blocked. Please connect to the office WiFi to check in.",
        blocked: true,
      });
    }

    const today = new Date().toISOString().split("T")[0];

    // Check if already checked in today
    const existing = await attendanceRepo.findOne({
      where: { student: { id: student.id }, date: today },
    });
    if (existing && existing.checkIn) {
      return res.status(400).json({ error: "Already checked in today", attendance: existing });
    }

    const now = new Date();
    const hour = now.getHours();
    // Consider late if after 9:30 AM
    const status = hour < 9 || (hour === 9 && now.getMinutes() <= 30) ? "PRESENT" : "LATE";

    let attendance;
    if (existing) {
      existing.checkIn = now;
      existing.status = status;
      existing.wifiValidated = !!wifiValidated;
      attendance = await attendanceRepo.save(existing);
    } else {
      attendance = await attendanceRepo.save(
        attendanceRepo.create({
          student: { id: student.id },
          date: today,
          checkIn: now,
          status,
          wifiValidated: !!wifiValidated,
        })
      );
    }

    res.json({ message: "Checked in successfully", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Check-in failed" });
  }
};

// POST /api/attendance/checkout
const checkOut = async (req, res) => {
  try {
    const studentRepo = AppDataSource.getRepository("Student");
    const attendanceRepo = AppDataSource.getRepository("Attendance");

    const student = await studentRepo.findOne({ where: { user: { id: req.user.id } } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const today = new Date().toISOString().split("T")[0];
    const attendance = await attendanceRepo.findOne({
      where: { student: { id: student.id }, date: today },
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ error: "You have not checked in yet" });
    }
    if (attendance.checkOut) {
      return res.status(400).json({ error: "Already checked out today" });
    }

    attendance.checkOut = new Date();
    await attendanceRepo.save(attendance);

    res.json({ message: "Checked out successfully", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Check-out failed" });
  }
};

// GET /api/attendance/my - Student's own attendance
const getMyAttendance = async (req, res) => {
  try {
    const studentRepo = AppDataSource.getRepository("Student");
    const attendanceRepo = AppDataSource.getRepository("Attendance");

    const student = await studentRepo.findOne({ where: { user: { id: req.user.id } } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const records = await attendanceRepo.find({
      where: { student: { id: student.id } },
      order: { date: "DESC" },
    });

    const total = records.length;
    const present = records.filter((r) => r.status === "PRESENT").length;
    const late = records.filter((r) => r.status === "LATE").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    res.json({ records, stats: { total, present, late, absent, percentage } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};

// GET /api/attendance/student/:studentId - Staff views student attendance
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const attendanceRepo = AppDataSource.getRepository("Attendance");

    const records = await attendanceRepo.find({
      where: { student: { id: studentId } },
      order: { date: "DESC" },
    });

    const total = records.length;
    const present = records.filter((r) => r.status === "PRESENT").length;
    const late = records.filter((r) => r.status === "LATE").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    res.json({ records, stats: { total, present, late, absent, percentage } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};

// POST /api/attendance/mark - Staff manually marks attendance
const markAttendance = async (req, res) => {
  try {
    const { studentId, date, status } = req.body;
    const attendanceRepo = AppDataSource.getRepository("Attendance");

    let attendance = await attendanceRepo.findOne({
      where: { student: { id: studentId }, date },
    });

    if (attendance) {
      attendance.status = status;
      await attendanceRepo.save(attendance);
    } else {
      attendance = await attendanceRepo.save(
        attendanceRepo.create({
          student: { id: studentId },
          date,
          status,
        })
      );
    }

    res.json({ message: "Attendance marked", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark attendance" });
  }
};

// GET /api/attendance/today - Get today's status for current student
const getTodayStatus = async (req, res) => {
  try {
    const studentRepo = AppDataSource.getRepository("Student");
    const attendanceRepo = AppDataSource.getRepository("Attendance");

    const student = await studentRepo.findOne({ where: { user: { id: req.user.id } } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const today = new Date().toISOString().split("T")[0];
    const attendance = await attendanceRepo.findOne({
      where: { student: { id: student.id }, date: today },
    });

    res.json({ attendance: attendance || null, mode: student.mode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch today's status" });
  }
};

module.exports = { checkIn, checkOut, getMyAttendance, getStudentAttendance, markAttendance, getTodayStatus };
