const AppDataSource = require("../config/db");
const { createNotification } = require("../utils/notification.util");

let _io = null;
const setIo = (io) => { _io = io; };

// POST /api/groups - Create group
const createGroup = async (req, res) => {
  try {
    const { name, description, courseId } = req.body;
    const groupRepo = AppDataSource.getRepository("Group");

    const group = await groupRepo.save(
      groupRepo.create({
        name,
        description,
        course: courseId ? { id: courseId } : null,
        createdBy: { id: req.user.id },
      })
    );

    res.status(201).json({ message: "Group created", group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create group" });
  }
};

// GET /api/groups - List all groups (admin/staff)
const getGroups = async (req, res) => {
  try {
    const groupRepo = AppDataSource.getRepository("Group");
    const groups = await groupRepo.find({
      relations: ["createdBy", "course", "members", "members.student", "members.student.user"],
      order: { createdAt: "DESC" },
    });

    const result = groups.map((g) => ({
      ...g,
      memberCount: g.members?.length || 0,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

// GET /api/groups/my - Student's groups
const getMyGroups = async (req, res) => {
  try {
    const studentRepo = AppDataSource.getRepository("Student");
    const groupMemberRepo = AppDataSource.getRepository("GroupMember");

    const student = await studentRepo.findOne({ where: { user: { id: req.user.id } } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const memberships = await groupMemberRepo.find({
      where: { student: { id: student.id } },
      relations: ["group", "group.course", "group.createdBy"],
    });

    res.json(memberships.map((m) => m.group));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

// GET /api/groups/:id - Group detail
const getGroupById = async (req, res) => {
  try {
    const groupRepo = AppDataSource.getRepository("Group");
    const group = await groupRepo.findOne({
      where: { id: req.params.id },
      relations: [
        "createdBy", "course",
        "members", "members.student", "members.student.user",
        "members.staff", "members.staff.user",
        "groupTasks", "groupTasks.topic",
        "materials", "materials.uploadedBy",
        "announcements", "announcements.createdBy",
      ],
    });

    if (!group) return res.status(404).json({ error: "Group not found" });
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch group" });
  }
};

// POST /api/groups/:id/members - Add member(s)
const addMembers = async (req, res) => {
  try {
    const { studentIds, staffIds } = req.body;
    const groupMemberRepo = AppDataSource.getRepository("GroupMember");

    const created = [];

    if (studentIds?.length) {
      for (const sId of studentIds) {
        const exists = await groupMemberRepo.findOne({
          where: { group: { id: req.params.id }, student: { id: sId } },
        });
        if (!exists) {
          const m = await groupMemberRepo.save(
            groupMemberRepo.create({
              group: { id: req.params.id },
              student: { id: sId },
              role: "STUDENT",
            })
          );
          created.push(m);
        }
      }
    }

    if (staffIds?.length) {
      for (const stId of staffIds) {
        const exists = await groupMemberRepo.findOne({
          where: { group: { id: req.params.id }, staff: { id: stId } },
        });
        if (!exists) {
          const m = await groupMemberRepo.save(
            groupMemberRepo.create({
              group: { id: req.params.id },
              staff: { id: stId },
              role: "STAFF",
            })
          );
          created.push(m);
        }
      }
    }

    res.json({ message: "Members added", created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add members" });
  }
};

// DELETE /api/groups/:id/members/:memberId - Remove member
const removeMember = async (req, res) => {
  try {
    const groupMemberRepo = AppDataSource.getRepository("GroupMember");
    await groupMemberRepo.delete({ id: req.params.memberId });
    res.json({ message: "Member removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove member" });
  }
};

// DELETE /api/groups/:id
const deleteGroup = async (req, res) => {
  try {
    const groupRepo = AppDataSource.getRepository("Group");
    await groupRepo.delete({ id: req.params.id });
    res.json({ message: "Group deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete group" });
  }
};

module.exports = { createGroup, getGroups, getMyGroups, getGroupById, addMembers, removeMember, deleteGroup, setIo };
