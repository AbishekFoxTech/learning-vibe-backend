const AppDataSource = require("../config/db");
const { createNotification } = require("../utils/notification.util");

let _io = null;
const setIo = (io) => { _io = io; };

// POST /api/announcements
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, targetType, groupId } = req.body;
    const announcementRepo = AppDataSource.getRepository("Announcement");
    const userRepo = AppDataSource.getRepository("User");
    const groupMemberRepo = AppDataSource.getRepository("GroupMember");

    const announcement = await announcementRepo.save(
      announcementRepo.create({
        title,
        message,
        targetType, // ALL / GROUP / STUDENT / STAFF
        group: groupId ? { id: groupId } : null,
        createdBy: { id: req.user.id },
      })
    );

    // Broadcast via Socket.IO
    if (_io) {
      if (targetType === "ALL") {
        _io.emit("announcement", { title, message });
        // Notify all users
        const users = await userRepo.find({ select: ["id"] });
        for (const u of users) {
          await createNotification(u.id, { title, body: message, type: "ANNOUNCEMENT" }, null);
        }
      } else if (targetType === "GROUP" && groupId) {
        _io.to(`group:${groupId}`).emit("announcement", { title, message });
        const members = await groupMemberRepo.find({
          where: { group: { id: groupId } },
          relations: ["student", "student.user"],
        });
        for (const m of members) {
          if (m.student?.user?.id) {
            await createNotification(
              m.student.user.id,
              { title, body: message, type: "ANNOUNCEMENT" },
              _io
            );
          }
        }
      }
    }

    res.status(201).json({ message: "Announcement sent", announcement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create announcement" });
  }
};

// GET /api/announcements - All announcements (admin/staff)
const getAnnouncements = async (req, res) => {
  try {
    const announcementRepo = AppDataSource.getRepository("Announcement");
    const announcements = await announcementRepo.find({
      relations: ["createdBy", "group"],
      order: { createdAt: "DESC" },
    });
    res.json(announcements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
};

// GET /api/announcements/my - Student's relevant announcements
const getMyAnnouncements = async (req, res) => {
  try {
    const announcementRepo = AppDataSource.getRepository("Announcement");
    const studentRepo = AppDataSource.getRepository("Student");
    const groupMemberRepo = AppDataSource.getRepository("GroupMember");

    const student = await studentRepo.findOne({ where: { user: { id: req.user.id } } });

    // Get groups student belongs to
    const memberships = await groupMemberRepo.find({
      where: { student: { id: student?.id } },
      relations: ["group"],
    });
    const groupIds = memberships.map((m) => m.group?.id).filter(Boolean);

    const all = await announcementRepo.find({
      relations: ["createdBy", "group"],
      order: { createdAt: "DESC" },
    });

    const relevant = all.filter(
      (a) =>
        a.targetType === "ALL" ||
        (a.targetType === "GROUP" && a.group && groupIds.includes(a.group.id))
    );

    res.json(relevant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
};

// DELETE /api/announcements/:id
const deleteAnnouncement = async (req, res) => {
  try {
    const announcementRepo = AppDataSource.getRepository("Announcement");
    await announcementRepo.delete({ id: req.params.id });
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
};

module.exports = { createAnnouncement, getAnnouncements, getMyAnnouncements, deleteAnnouncement, setIo };
