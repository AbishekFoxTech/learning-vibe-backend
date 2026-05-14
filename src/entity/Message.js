const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Message",
  tableName: "messages",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid" },
    content: { type: "text", nullable: true },
    fileUrl: { type: "text", nullable: true },
    fileType: { type: "text", nullable: true }, // image / file
    createdAt: { type: "timestamp", createDate: true },
  },
  relations: {
    sender: {
      type: "many-to-one",
      target: "User",
      joinColumn: true,
    },
    group: {
      type: "many-to-one",
      target: "Group",
      joinColumn: true,
      nullable: true,
      inverseSide: "messages",
      onDelete: "CASCADE",
    },
    // For direct messages
    recipientUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "recipientUserId" },
      nullable: true,
    },
  },
});
