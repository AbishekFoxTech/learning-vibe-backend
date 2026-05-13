require("reflect-metadata");
const { DataSource } = require("typeorm");
const entities = require("../entity");

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.DB_SYNC !== "false", // Auto-sync schema
  logging: process.env.NODE_ENV === "development",
  entities: Object.values(entities),
  migrations: [],
  subscribers: [],
});

module.exports = AppDataSource;