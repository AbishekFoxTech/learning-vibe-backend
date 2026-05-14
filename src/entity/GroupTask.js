const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "GroupTask",
  tableName: "group_tasks",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid" },
    title: { type: "text" },
    description: { type: "text", nullable: true },
    orderIndex: { type: "int", default: 0 },
    dueDate: { type: "timestamp", nullable: true },
    createdAt: { type: "timestamp", createDate: true },
  },
  relations: {
    group: {
      type: "many-to-one",
      target: "Group",
      joinColumn: true,
      inverseSide: "groupTasks",
      onDelete: "CASCADE",
    },
    topic: {
      type: "many-to-one",
      target: "Topic",
      joinColumn: true,
      nullable: true,
    },
    createdBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: true,
    },
    submissions: {
      type: "one-to-many",
      target: "TaskSubmission",
      inverseSide: "groupTask",
    },
  },
});
