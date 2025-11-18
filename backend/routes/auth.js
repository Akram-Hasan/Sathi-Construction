const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please include a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["admin", "user"])
      .withMessage("Role must be admin or user"),
  ],
  async (req, res) => {
    try {
      logger.info("Registration attempt", { email: req.body.email });
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn("Registration validation failed", { errors: errors.array(), email: req.body.email });
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { name, email, password, role, phone, employeeId } = req.body;

      // Check if user exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        logger.warn("Registration failed - user already exists", { email });
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Create user
      logger.database("CREATE", "users", { email, role: role || "user" });
      const user = await User.create({
        name,
        email,
        password,
        role: role || "user",
        phone,
        employeeId,
      });

      const token = user.getSignedJwtToken();

      logger.auth("REGISTER", user._id, email, true);
      logger.success("User registered successfully", { userId: user._id, email, role: user.role });

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      logger.error("Registration error", error, { email: req.body.email });
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please include a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      logger.info("Login attempt", { email: req.body.email });
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn("Login validation failed", { errors: errors.array(), email: req.body.email });
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Check for user
      logger.database("FIND", "users", { email });
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        logger.auth("LOGIN", null, email, false);
        logger.warn("Login failed - user not found", { email });
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check if password matches
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        logger.auth("LOGIN", user._id, email, false);
        logger.warn("Login failed - invalid password", { userId: user._id, email });
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check if user is active
      if (!user.isActive) {
        logger.auth("LOGIN", user._id, email, false);
        logger.warn("Login failed - account deactivated", { userId: user._id, email });
        return res.status(401).json({
          success: false,
          message: "Account is deactivated",
        });
      }

      const token = user.getSignedJwtToken();

      logger.auth("LOGIN", user._id, email, true);
      logger.success("User logged in successfully", { userId: user._id, email, role: user.role });

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
        },
      });
    } catch (error) {
      logger.error("Login error", error, { email: req.body.email });
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    logger.debug("Get current user request", { userId: req.user.id });
    logger.database("FIND", "users", { _id: req.user.id });
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      logger.warn("User not found for /me endpoint", { userId: req.user.id });
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    logger.info("Current user retrieved", { userId: user._id, email: user.email });
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        phone: user.phone,
      },
    });
  } catch (error) {
    logger.error("Get current user error", error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PUT /api/auth/update-location
// @desc    Update user location
// @access  Private
router.put(
  "/update-location",
  protect,
  [
    body("latitude").isFloat().withMessage("Valid latitude is required"),
    body("longitude").isFloat().withMessage("Valid longitude is required"),
    body("address").optional().trim(),
  ],
  async (req, res) => {
    try {
      logger.info("Update location request", { userId: req.user.id });
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn("Update location validation failed", { errors: errors.array(), userId: req.user.id });
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { latitude, longitude, address } = req.body;

      logger.database("UPDATE", "users", { userId: req.user.id, location: { latitude, longitude } });
      const user = await User.findByIdAndUpdate(
        req.user.id,
        {
          location: {
            latitude,
            longitude,
            address,
            lastUpdated: new Date(),
          },
        },
        { new: true }
      );

      logger.success("User location updated", { userId: user._id, latitude, longitude });
      
      res.json({
        success: true,
        location: user.location,
      });
    } catch (error) {
      logger.error("Update location error", error, { userId: req.user?.id });
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

module.exports = router;

