const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "GroupMember",
  tableName: "group_members",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid" },
    role: { type: "text", default: "STUDENT" }, // STUDENT / STAFF
    joinedAt: { type: "timestamp", createDate: true },
  },
  relations: {
    group: {
      type: "many-to-one",
      target: "Group",
      joinColumn: true,
      inverseSide: "members",
      onDelete: "CASCADE",
    },
    student: {
      type: "many-to-one",
      target: "Student",
      joinColumn: true,
      nullable: true,
      inverseSide: "groupMemberships",
    },
    staff: {
      type: "many-to-one",
      target: "Staff",
      joinColumn: true,
      nullable: true,
    },
  },
});
