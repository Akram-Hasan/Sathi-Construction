const express = require('express');
const { body, validationResult } = require('express-validator');
const Manpower = require('../models/Manpower');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/manpower
// @desc    Get all manpower
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    logger.info("Get all manpower request", { userId: req.user.id });
    logger.database("FIND", "manpower", {});
    
    const manpower = await Manpower.find()
      .populate('assignedProject', 'name projectId')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    logger.success("Manpower retrieved", { count: manpower.length, userId: req.user.id });

    res.json({
      success: true,
      count: manpower.length,
      data: manpower
    });
  } catch (error) {
    logger.error("Get all manpower error", error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/manpower/available
// @desc    Get available manpower
// @access  Private
router.get('/available', protect, async (req, res) => {
  try {
    logger.info("Get available manpower request", { userId: req.user.id });
    logger.database("FIND", "manpower", { isAvailable: true });
    
    const manpower = await Manpower.find({
      $or: [
        { isAvailable: true },
        { assignedProject: null }
      ]
    })
      .populate('assignedProject', 'name projectId')
      .sort('role');

    // Group by role
    const grouped = manpower.reduce((acc, person) => {
      const role = person.role;
      if (!acc[role]) {
        acc[role] = [];
      }
      acc[role].push(person);
      return acc;
    }, {});

    logger.success("Available manpower retrieved", { count: manpower.length, userId: req.user.id });

    res.json({
      success: true,
      count: manpower.length,
      data: manpower,
      grouped
    });
  } catch (error) {
    logger.error("Get available manpower error", error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/manpower
// @desc    Create new manpower
// @access  Private/Admin
router.post('/', protect, authorize('admin'), [
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('role').trim().notEmpty().withMessage('Role is required')
], async (req, res) => {
  try {
    logger.info("Create manpower request", { 
      employeeId: req.body.employeeId, 
      userId: req.user.id 
    });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Create manpower validation failed", { 
        errors: errors.array(), 
        userId: req.user.id 
      });
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if employee ID exists
    logger.database("FIND", "manpower", { employeeId: req.body.employeeId });
    const existing = await Manpower.findOne({ employeeId: req.body.employeeId });
    if (existing) {
      logger.warn("Create manpower failed - employee ID exists", { 
        employeeId: req.body.employeeId, 
        userId: req.user.id 
      });
      return res.status(400).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }

    logger.database("CREATE", "manpower", { employeeId: req.body.employeeId, name: req.body.name });
    const manpower = await Manpower.create({
      ...req.body,
      createdBy: req.user.id
    });

    logger.success("Manpower created successfully", { 
      manpowerId: manpower._id, 
      employeeId: manpower.employeeId,
      createdBy: req.user.id 
    });

    res.status(201).json({
      success: true,
      data: manpower
    });
  } catch (error) {
    if (error.code === 11000) {
      logger.warn("Create manpower failed - duplicate key", { 
        error: error.message, 
        userId: req.user.id 
      });
      return res.status(400).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }
    logger.error("Create manpower error", error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/manpower/:id
// @desc    Update manpower
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    let manpower = await Manpower.findById(req.params.id);

    if (!manpower) {
      return res.status(404).json({
        success: false,
        message: 'Manpower not found'
      });
    }

    // Auto-update isAvailable based on assignedProject
    const updateData = { ...req.body };
    
    // If assignedProject is being set, make unavailable
    if (updateData.assignedProject && updateData.assignedProject !== null && updateData.assignedProject !== '') {
      updateData.isAvailable = false;
    } 
    // If assignedProject is being removed (null or empty), make available
    else if (updateData.assignedProject === null || updateData.assignedProject === '') {
      updateData.isAvailable = true;
      updateData.assignedProject = null;
    }
    // If assignedProject is not in update but exists in current record, sync isAvailable
    else if (!updateData.hasOwnProperty('assignedProject')) {
      // Keep existing assignedProject, but ensure isAvailable matches
      if (manpower.assignedProject) {
        updateData.isAvailable = false;
      } else {
        updateData.isAvailable = true;
      }
    }
    // If isAvailable is manually set, ensure it matches assignedProject
    else if (updateData.hasOwnProperty('isAvailable') && !updateData.hasOwnProperty('assignedProject')) {
      // Don't allow manual override - sync with assignedProject
      if (manpower.assignedProject) {
        updateData.isAvailable = false;
      } else {
        updateData.isAvailable = true;
      }
    }

    manpower = await Manpower.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('assignedProject', 'name projectId');

    res.json({
      success: true,
      data: manpower
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/manpower/:id
// @desc    Delete manpower
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const manpower = await Manpower.findById(req.params.id);

    if (!manpower) {
      return res.status(404).json({
        success: false,
        message: 'Manpower not found'
      });
    }

    await manpower.deleteOne();

    res.json({
      success: true,
      message: 'Manpower deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;


