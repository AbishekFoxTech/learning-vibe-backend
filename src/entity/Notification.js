const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Notification",
  tableName: "notifications",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid" },
    title: { type: "text" },
    body: { type: "text" },
    type: { type: "text" }, // TASK / ANNOUNCEMENT / SUBMISSION / CHAT
    isRead: { type: "boolean", default: false },
    data: { type: "jsonb", nullable: true },
    createdAt: { type: "timestamp", createDate: true },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: true,
      onDelete: "CASCADE",
    },
  },
});
