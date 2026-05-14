const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "TaskSubmission",
  tableName: "task_submissions",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid" },
    fileUrl: { type: "text", nullable: true },
    message: { type: "text", nullable: true },
    status: { type: "text", default: "PENDING" }, // PENDING / SUBMITTED / APPROVED / REJECTED
    feedback: { type: "text", nullable: true },
    submittedAt: { type: "timestamp", nullable: true },
    reviewedAt: { type: "timestamp", nullable: true },
    createdAt: { type: "timestamp", createDate: true },
  },
  relations: {
    groupTask: {
      type: "many-to-one",
      target: "GroupTask",
      joinColumn: true,
      inverseSide: "submissions",
      onDelete: "CASCADE",
    },
    student: {
      type: "many-to-one",
      target: "Student",
      joinColumn: true,
      inverseSide: "taskSubmissions",
    },
    reviewedBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: true,
      nullable: true,
    },
  },
});
