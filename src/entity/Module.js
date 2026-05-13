const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Module",
  tableName: "modules",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    title: {
      type: "text",
    },
    order: {
      type: "int",
    },
  },
  relations: {
  course: {
    type: "many-to-one",
    target: "Course",
    joinColumn: true,
    inverseSide: "modules",
    onDelete: "CASCADE",
  },
  topics: {
    type: "one-to-many",
    target: "Topic",
    inverseSide: "module",
  },
}
});