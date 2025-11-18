const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
const logger = require("./utils/logger");
const User = require("./models/User");

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const userId = req.user?.id || null;
    logger.request(req.method, req.path, res.statusCode, duration, userId);
  });

  next();
});

// Morgan for HTTP request logging (complementary to our logger)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
logger.info("Setting up API routes...");
app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/manpower", require("./routes/manpower"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/materials", require("./routes/materials"));
app.use("/api/finance", require("./routes/finance"));
app.use("/api/location", require("./routes/location"));
logger.success("API routes configured successfully");

// Health check
app.get("/api/health", (req, res) => {
  logger.debug("Health check requested");
  res.json({
    status: "OK",
    message: "Sathi Constructions API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error on ${req.method} ${req.path}`, err, {
    method: req.method,
    path: req.path,
    userId: req.user?.id || null,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.status(404).json({ success: false, message: "Route not found" });
});

// Function to ensure admin user exists
const ensureAdminUser = async () => {
  try {
    logger.info("Checking for admin user...");

    const adminEmail = "admin@sathi.com";
    const adminPassword = "admin123";

    // Check if admin exists
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      logger.success("Admin user already exists", {
        userId: admin._id,
        email: adminEmail,
      });

      // Verify password is correct - need to select password field
      const adminWithPassword = await User.findOne({
        email: adminEmail,
      }).select("+password");
      const isPasswordCorrect = await adminWithPassword.matchPassword(
        adminPassword
      );

      if (isPasswordCorrect) {
        logger.debug("Admin password is correct");
      } else {
        logger.info("Resetting admin password to default...");
        adminWithPassword.password = adminPassword;
        await adminWithPassword.save();
        logger.success("Admin password reset to: admin123");
      }
    } else {
      logger.info("Admin user not found. Creating admin user...");
      logger.database("CREATE", "users", { email: adminEmail, role: "admin" });

      admin = await User.create({
        name: "Admin User",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        employeeId: "ADM-001",
      });

      logger.success("Admin user created successfully", {
        userId: admin._id,
        email: adminEmail,
        employeeId: "ADM-001",
      });
      logger.info("Admin credentials: admin@sathi.com / admin123");
    }
  } catch (error) {
    logger.error("Error ensuring admin user", error);
    // Don't exit - let server start even if admin creation fails
    // Admin can be created manually later
  }
};

// Connect to MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sarthi-constructions";

logger.info("Attempting to connect to MongoDB...", {
  uri: MONGODB_URI.replace(/\/\/.*@/, "//***:***@"), // Hide credentials in logs
});

(async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.success("MongoDB connected successfully", {
      host: mongoose.connection.host,
      database: mongoose.connection.name,
    });

    // Ensure admin user exists
    await ensureAdminUser();

    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || "0.0.0.0";

    app.listen(PORT, HOST, () => {
      logger.success("Server started successfully", {
        host: HOST,
        port: PORT,
        environment: process.env.NODE_ENV || "development",
        apiUrl: `http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}/api`,
      });

      if (HOST === "0.0.0.0") {
        logger.info("Server is accessible from network", {
          mobileUrl: `http://192.168.1.16:${PORT}/api`,
        });
      }
    });
  } catch (err) {
    logger.error("MongoDB connection failed", err, {
      uri: MONGODB_URI.replace(/\/\/.*@/, "//***:***@"),
    });
    process.exit(1);
  }
})();

// MongoDB connection event listeners
mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB connection error", err);
});

mongoose.connection.on("reconnected", () => {
  logger.success("MongoDB reconnected");
});

module.exports = app;
