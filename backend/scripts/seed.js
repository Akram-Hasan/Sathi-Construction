const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const User = require("../models/User");
const Project = require("../models/Project");
const Manpower = require("../models/Manpower");

dotenv.config({ path: path.join(__dirname, "../.env") });

const seedData = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/sarthi-constructions"
    );

    console.log("🌱 Seeding database...");

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Manpower.deleteMany();

    // Create Admin User
    const admin = await User.create({
      name: "Admin User",
      email: "admin@sathi.com",
      password: "admin123",
      role: "admin",
      employeeId: "ADM-001",
    });

    // Create Regular User
    const user = await User.create({
      name: "Staff Member",
      email: "user@sathi.com",
      password: "user123",
      role: "user",
      employeeId: "USR-001",
      phone: "9876543210",
    });

    // Create Projects
    const project1 = await Project.create({
      projectId: "PJT-001",
      name: "Site A - Foundation",
      location: "Block A, Zakir Nagar",
      description:
        "Excavation complete; rebar placement underway. Material delivery on schedule.",
      status: "In Progress",
      progress: 45,
      startDate: new Date("2024-01-01"),
      createdBy: admin._id,
    });

    const project2 = await Project.create({
      projectId: "PJT-002",
      name: "Site B - Planning",
      location: "Block B, Zakir Nagar",
      description:
        "Architectural drawings under review; vendor quotes being finalized.",
      status: "Planning",
      progress: 10,
      createdBy: admin._id,
    });

    const project3 = await Project.create({
      projectId: "PJT-003",
      name: "Site C - Finishing",
      location: "Block C, Zakir Nagar",
      description:
        "Internal plastering started; electrical rough-ins 70% done.",
      status: "In Progress",
      progress: 85,
      startDate: new Date("2023-12-15"),
      createdBy: admin._id,
    });

    // Create Manpower
    await Manpower.create([
      {
        employeeId: "MP-01",
        name: "Rahul Verma",
        role: "Masons",
        phone: "9876543211",
        assignedProject: project1._id,
        experience: "5+ years",
        isAvailable: true,
        createdBy: admin._id,
      },
      {
        employeeId: "MP-02",
        name: "Neha Singh",
        role: "Carpenters",
        phone: "9876543212",
        assignedProject: project3._id,
        experience: "3+ years",
        isAvailable: true,
        createdBy: admin._id,
      },
      {
        employeeId: "MP-03",
        name: "Arun Kumar",
        role: "Electricians",
        phone: "9876543213",
        experience: "4+ years",
        isAvailable: true,
        createdBy: admin._id,
      },
    ]);

    console.log("✅ Database seeded successfully!");
    console.log("📧 Admin: admin@sathi.com / admin123");
    console.log("📧 User: user@sathi.com / user123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
