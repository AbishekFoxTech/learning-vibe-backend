const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "StudyMaterial",
  tableName: "study_materials",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid" },
    title: { type: "text" },
    type: { type: "text" }, // PDF / VIDEO / IMAGE / DOC / LINK
    fileUrl: { type: "text" },
    description: { type: "text", nullable: true },
    createdAt: { type: "timestamp", createDate: true },
  },
  relations: {
    topic: {
      type: "many-to-one",
      target: "Topic",
      joinColumn: true,
      nullable: true,
    },
    group: {
      type: "many-to-one",
      target: "Group",
      joinColumn: true,
      nullable: true,
      inverseSide: "materials",
    },
    uploadedBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: true,
    },
  },
});
