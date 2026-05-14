const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Group",
  tableName: "groups",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid" },
    name: { type: "text" },
    description: { type: "text", nullable: true },
    createdAt: { type: "timestamp", createDate: true },
  },
  relations: {
    course: {
      type: "many-to-one",
      target: "Course",
      joinColumn: true,
      nullable: true,
    },
    createdBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: true,
    },
    members: {
      type: "one-to-many",
      target: "GroupMember",
      inverseSide: "group",
    },
    groupTasks: {
      type: "one-to-many",
      target: "GroupTask",
      inverseSide: "group",
    },
    messages: {
      type: "one-to-many",
      target: "Message",
      inverseSide: "group",
    },
    announcements: {
      type: "one-to-many",
      target: "Announcement",
      inverseSide: "group",
    },
    materials: {
      type: "one-to-many",
      target: "StudyMaterial",
      inverseSide: "group",
    },
  },
});
