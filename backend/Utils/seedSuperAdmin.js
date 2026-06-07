const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../Models/UserModel");

const seedSuperAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URL);

  const existing = await User.findOne({ email: "admin@wearly.com" });
  if (existing) {
    console.log("Super admin already exists — skipping seed.");
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash("Admin_1", 10);
  await User.create({
    name: "Super Admin",
    email: "admin@wearly.com",
    password: hashedPassword,
    role: "super-admin",
    status: "approved",
  });

  console.log("Super admin seeded: admin@wearly.com / Admin_1");
  await mongoose.disconnect();
};

seedSuperAdmin().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
