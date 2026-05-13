const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    name: {
      type: "text",
    },
    email: {
      type: "text",
      unique: true,
    },
    phone: {
      type: "text",
    },
    password: {
      type: "text",
    },
    role: {
      type: "text",
    },
    refreshToken: { type: "text", nullable: true },
    photoUrl: { type: "text", nullable: true },
    createdAt: { type: "timestamp", createDate: true },
  },
  relations: {
    student: {
      type: "one-to-one",
      target: "Student",
      inverseSide: "user",
    },
    staff: {
      type: "one-to-one",
      target: "Staff",
      inverseSide: "user",
    },
  },
});