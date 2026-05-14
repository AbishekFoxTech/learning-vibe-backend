const AppDataSource = require("../config/db");

// GET /api/chat/group/:groupId/messages
const getGroupMessages = async (req, res) => {
  try {
    const messageRepo = AppDataSource.getRepository("Message");
    const messages = await messageRepo.find({
      where: { group: { id: req.params.groupId } },
      relations: ["sender"],
      order: { createdAt: "ASC" },
      take: 100,
    });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// GET /api/chat/direct/:userId - Direct message history with a user
const getDirectMessages = async (req, res) => {
  try {
    const messageRepo = AppDataSource.getRepository("Message");
    const myId = req.user.id;
    const otherId = req.params.userId;

    const messages = await messageRepo
      .createQueryBuilder("msg")
      .leftJoinAndSelect("msg.sender", "sender")
      .leftJoinAndSelect("msg.recipientUser", "recipient")
      .where(
        "(msg.senderId = :myId AND msg.recipientUserId = :otherId) OR (msg.senderId = :otherId AND msg.recipientUserId = :myId)",
        { myId, otherId }
      )
      .orderBy("msg.createdAt", "ASC")
      .take(100)
      .getMany();

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// GET /api/chat/contacts - Get list of people student can chat with (staff)
const getChatContacts = async (req, res) => {
  try {
    const studentRepo = AppDataSource.getRepository("Student");
    const staffRepo = AppDataSource.getRepository("Staff");

    if (req.user.role === "STUDENT") {
      const student = await studentRepo.findOne({
        where: { user: { id: req.user.id } },
        relations: ["staff", "staff.user"],
      });
      return res.json(student?.staff ? [{ ...student.staff.user, staffId: student.staff.id }] : []);
    }

    if (req.user.role === "STAFF") {
      const staff = await staffRepo.findOne({
        where: { user: { id: req.user.id } },
        relations: ["students", "students.user"],
      });
      return res.json(staff?.students?.map((s) => ({ ...s.user, studentId: s.id })) || []);
    }

    res.json([]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

module.exports = { getGroupMessages, getDirectMessages, getChatContacts };
