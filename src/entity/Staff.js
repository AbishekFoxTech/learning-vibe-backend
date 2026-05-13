const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Staff",
  tableName: "staff",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
  },
  relations: {
    user: {
      type: "one-to-one",
      target: "User",
      joinColumn: true,
      inverseSide: "staff",
      onDelete: "CASCADE",
    },
    students: {
      type: "one-to-many",
      target: "Student",
      inverseSide: "staff",
    },
  },
});