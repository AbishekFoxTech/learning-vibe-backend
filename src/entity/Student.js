const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Student",
  tableName: "students",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid" },
    college: { type: "text" },
    address: { type: "text" },
    mode: { type: "text" }, // ONLINE / OFFLINE / HYBRID
  },
  relations: {
    user: {
      type: "one-to-one",
      target: "User",
      joinColumn: true,
      inverseSide: "student",
      onDelete: "CASCADE",
    },
    course: {
      type: "many-to-one",
      target: "Course",
      joinColumn: true,
      inverseSide: "students",
    },
    staff: {
      type: "many-to-one",
      target: "Staff",
      joinColumn: true,
      inverseSide: "students",
    },
    progress: {
      type: "one-to-many",
      target: "Progress",
      inverseSide: "student",
    },
    tasks: {
      type: "one-to-many",
      target: "Task",
      inverseSide: "student",
    },
    attendances: {
      type: "one-to-many",
      target: "Attendance",
      inverseSide: "student",
    },
    groupMemberships: {
      type: "one-to-many",
      target: "GroupMember",
      inverseSide: "student",
    },
    taskSubmissions: {
      type: "one-to-many",
      target: "TaskSubmission",
      inverseSide: "student",
    },
  },
});