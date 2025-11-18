const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/location
// @desc    Get all staff locations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    logger.info("Get all staff locations request", { userId: req.user.id });
    logger.database("FIND", "users", { role: 'user', hasLocation: true });
    
    const users = await User.find({
      role: 'user',
      'location.latitude': { $exists: true },
      'location.longitude': { $exists: true }
    })
      .select('name email employeeId location')
      .sort('-location.lastUpdated');

    logger.success("Staff locations retrieved", { count: users.length, userId: req.user.id });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    logger.error("Get staff locations error", error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/location/user/:userId
// @desc    Get specific user location
// @access  Private
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name email employeeId location');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;


