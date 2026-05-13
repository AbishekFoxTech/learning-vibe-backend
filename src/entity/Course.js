const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Course",
  tableName: "courses",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    name: {
      type: "text",
    },
    duration: {
      type: "int",
    },
  },
  relations: {
    modules: {
      type: "one-to-many",
      target: "Module",
      inverseSide: "course",
    },
    students: {
      type: "one-to-many",
      target: "Student",
      inverseSide: "course",
    },
  },
});