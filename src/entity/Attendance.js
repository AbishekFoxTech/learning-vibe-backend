const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Attendance",
  tableName: "attendances",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid" },
    date: { type: "date" },
    checkIn: { type: "timestamp", nullable: true },
    checkOut: { type: "timestamp", nullable: true },
    status: { type: "text", default: "ABSENT" }, // PRESENT / ABSENT / LATE
    wifiValidated: { type: "boolean", default: false },
    createdAt: { type: "timestamp", createDate: true },
  },
  relations: {
    student: {
      type: "many-to-one",
      target: "Student",
      joinColumn: true,
      inverseSide: "attendances",
    },
  },
});
