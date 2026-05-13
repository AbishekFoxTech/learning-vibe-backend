require("dotenv").config();
const bcrypt = require("bcryptjs");
const AppDataSource = require("./config/db");

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected for seeding");

    const userRepo = AppDataSource.getRepository("User");

    const email = "admin@learningvibe.com";
    const hashedPassword = await bcrypt.hash("learn.123", 10);

    // Upsert admin (create if missing, otherwise update name/password)
    const existing = await userRepo.findOne({ where: { email } });

    if (existing) {
      existing.name = "Learning-vibe";
      existing.password = hashedPassword;
      existing.role = "ADMIN";
      await userRepo.save(existing);
      console.log("✅ Admin updated successfully");
      process.exit(0);
    }

    const admin = userRepo.create({
      name: "Learning-vibe",
      email,
      phone: "9999999999",
      password: hashedPassword,
      role: "ADMIN",
      photoUrl: null,
    });

    await userRepo.save(admin);
    console.log("✅ Admin created successfully");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
