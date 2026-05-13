const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Task",
  tableName: "tasks",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    description: {
      type: "text",
    },
    imageUrl: {
      type: "text",
      nullable: true,
    },
    status: {
      type: "text",
      default: "ASSIGNED", // ASSIGNED / SUBMITTED / APPROVED / REJECTED
    },
    submissionText: {
      type: "text",
      nullable: true,
    },
    submissionUrl: {
      type: "text",
      nullable: true,
    },
    submittedAt: {
      type: "timestamp",
      nullable: true,
    },
    feedback: {
      type: "text",
      nullable: true,
    },
  },
  relations: {
    student: {
      type: "many-to-one",
      target: "Student",
      joinColumn: true,
      inverseSide: "tasks",
    },
    topic: {
      type: "many-to-one",
      target: "Topic",
      joinColumn: true,
      inverseSide: "tasks",
    },
  },
});