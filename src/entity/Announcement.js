const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Announcement",
  tableName: "announcements",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid" },
    title: { type: "text" },
    message: { type: "text" },
    targetType: { type: "text" }, // ALL / GROUP / STUDENT / STAFF
    targetId: { type: "uuid", nullable: true },
    createdAt: { type: "timestamp", createDate: true },
  },
  relations: {
    createdBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: true,
    },
    group: {
      type: "many-to-one",
      target: "Group",
      joinColumn: { name: "groupId" },
      nullable: true,
      inverseSide: "announcements",
    },
  },
});
