const AppDataSource = require("../config/db");
const { createNotification } = require("../utils/notification.util");

let _io = null;
const setIo = (io) => { _io = io; };

// POST /api/group-tasks - Create group task
const createGroupTask = async (req, res) => {
  try {
    const { groupId, topicId, title, description, dueDate, orderIndex } = req.body;
    const groupTaskRepo = AppDataSource.getRepository("GroupTask");
    const groupMemberRepo = AppDataSource.getRepository("GroupMember");
    const submissionRepo = AppDataSource.getRepository("TaskSubmission");

    const task = await groupTaskRepo.save(
      groupTaskRepo.create({
        group: { id: groupId },
        topic: topicId ? { id: topicId } : null,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        orderIndex: orderIndex || 0,
        createdBy: { id: req.user.id },
      })
    );

    // Auto-create a pending submission slot for every student in the group
    const members = await groupMemberRepo.find({
      where: { group: { id: groupId }, role: "STUDENT" },
      relations: ["student"],
    });

    for (const member of members) {
      if (member.student) {
        await submissionRepo.save(
          submissionRepo.create({
            groupTask: { id: task.id },
            student: { id: member.student.id },
            status: "PENDING",
          })
        );

        // Notify student
        if (_io) {
          await createNotification(
            member.student.user?.id,
            { title: "New Task", body: `New task assigned: ${title}`, type: "TASK", data: { taskId: task.id } },
            _io
          );
        }
      }
    }

    res.status(201).json({ message: "Group task created", task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create group task" });
  }
};

// GET /api/group-tasks/group/:groupId
const getGroupTasks = async (req, res) => {
  try {
    const groupTaskRepo = AppDataSource.getRepository("GroupTask");
    const tasks = await groupTaskRepo.find({
      where: { group: { id: req.params.groupId } },
      relations: ["topic", "createdBy", "submissions", "submissions.student", "submissions.student.user"],
      order: { orderIndex: "ASC", createdAt: "ASC" },
    });

    const enriched = tasks.map((t) => ({
      ...t,
      submissionStats: {
        total: t.submissions?.length || 0,
        submitted: t.submissions?.filter((s) => s.status !== "PENDING").length || 0,
        approved: t.submissions?.filter((s) => s.status === "APPROVED").length || 0,
        rejected: t.submissions?.filter((s) => s.status === "REJECTED").length || 0,
        pending: t.submissions?.filter((s) => s.status === "PENDING").length || 0,
      },
    }));

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch group tasks" });
  }
};

// GET /api/group-tasks/my - Student's tasks across all groups
const getMyGroupTasks = async (req, res) => {
  try {
    const studentRepo = AppDataSource.getRepository("Student");
    const submissionRepo = AppDataSource.getRepository("TaskSubmission");

    const student = await studentRepo.findOne({ where: { user: { id: req.user.id } } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const submissions = await submissionRepo.find({
      where: { student: { id: student.id } },
      relations: ["groupTask", "groupTask.group", "groupTask.topic", "reviewedBy"],
      order: { createdAt: "DESC" },
    });

    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// POST /api/group-tasks/submit/:submissionId - Student submits
const submitTask = async (req, res) => {
  try {
    const { message } = req.body;
    const fileUrl = req.file?.path || null;
    const submissionRepo = AppDataSource.getRepository("TaskSubmission");
    const studentRepo = AppDataSource.getRepository("Student");

    const student = await studentRepo.findOne({ where: { user: { id: req.user.id } } });
    const submission = await submissionRepo.findOne({
      where: { id: req.params.submissionId, student: { id: student.id } },
      relations: ["groupTask"],
    });

    if (!submission) return res.status(404).json({ error: "Submission not found" });

    submission.message = message;
    submission.fileUrl = fileUrl;
    submission.status = "SUBMITTED";
    submission.submittedAt = new Date();

    await submissionRepo.save(submission);

    res.json({ message: "Task submitted successfully", submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit task" });
  }
};

// PATCH /api/group-tasks/review/:submissionId - Staff reviews
const reviewSubmission = async (req, res) => {
  try {
    const { status, feedback } = req.body; // APPROVED / REJECTED
    const submissionRepo = AppDataSource.getRepository("TaskSubmission");

    const submission = await submissionRepo.findOne({
      where: { id: req.params.submissionId },
      relations: ["student", "student.user", "groupTask"],
    });

    if (!submission) return res.status(404).json({ error: "Submission not found" });

    submission.status = status;
    submission.feedback = feedback;
    submission.reviewedAt = new Date();
    submission.reviewedBy = { id: req.user.id };

    await submissionRepo.save(submission);

    // Notify student
    if (_io && submission.student?.user?.id) {
      await createNotification(
        submission.student.user.id,
        {
          title: `Task ${status}`,
          body: `Your submission for "${submission.groupTask?.title}" was ${status.toLowerCase()}.`,
          type: "SUBMISSION",
          data: { submissionId: submission.id },
        },
        _io
      );
    }

    res.json({ message: "Submission reviewed", submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to review submission" });
  }
};

// DELETE /api/group-tasks/:id
const deleteGroupTask = async (req, res) => {
  try {
    const groupTaskRepo = AppDataSource.getRepository("GroupTask");
    await groupTaskRepo.delete({ id: req.params.id });
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
};

module.exports = { createGroupTask, getGroupTasks, getMyGroupTasks, submitTask, reviewSubmission, deleteGroupTask, setIo };
