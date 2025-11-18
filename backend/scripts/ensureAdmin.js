const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const User = require("../models/User");

dotenv.config({ path: path.join(__dirname, "../.env") });

const ensureAdmin = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/sarthi-constructions"
    );

    console.log("🔍 Checking for admin user...");

    // Check if admin exists
    let admin = await User.findOne({ email: "admin@sathi.com" });

    if (!admin) {
      console.log("📝 Creating admin user...");
      admin = await User.create({
        name: "Admin User",
        email: "admin@sathi.com",
        password: "admin123",
        role: "admin",
        employeeId: "ADM-001",
      });
      console.log("✅ Admin user created successfully!");
    } else {
      console.log("✅ Admin user already exists!");
      // Reset password by deleting and recreating
      console.log("🔄 Resetting admin password...");
      await User.deleteOne({ email: "admin@sathi.com" });
      admin = await User.create({
        name: "Admin User",
        email: "admin@sathi.com",
        password: "admin123",
        role: "admin",
        employeeId: "ADM-001",
      });
      console.log("✅ Admin password reset to: admin123");
    }

    console.log("📧 Admin credentials: admin@sathi.com / admin123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error ensuring admin user:", error);
    process.exit(1);
  }
};

ensureAdmin();

