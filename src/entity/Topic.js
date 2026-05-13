const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Topic",
  tableName: "topics",
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
  module: {
    type: "many-to-one",
    target: "Module",
    joinColumn: true,
    inverseSide: "topics",
    onDelete: "CASCADE",
  },
  progress: {
    type: "one-to-many",
    target: "Progress",
    inverseSide: "topic",
  },
  tasks: {
    type: "one-to-many",
    target: "Task",
    inverseSide: "topic",
  },
}
});