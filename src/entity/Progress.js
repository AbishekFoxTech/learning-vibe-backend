const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Progress",
  tableName: "progress",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    status: {
      type: "text", // NOT_STARTED / IN_PROGRESS / COMPLETED
      default: "NOT_STARTED",
    },
    studentId: {
      type: "uuid",
      nullable: true,
    },
    topicId: {
      type: "uuid",
      nullable: true,
    },
  },
  relations: {
  student: {
    type: "many-to-one",
    target: "Student",
    joinColumn: { name: "studentId" },
    inverseSide: "progress",
  },
  topic: {
    type: "many-to-one",
    target: "Topic",
    joinColumn: { name: "topicId" },
    inverseSide: "progress",
  },
}
});