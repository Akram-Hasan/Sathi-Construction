const express = require('express');
const { body, validationResult } = require('express-validator');
const Finance = require('../models/Finance');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/finance
// @desc    Get all finance records
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const finances = await Finance.find()
      .populate('project', 'name projectId')
      .populate('updatedBy', 'name email')
      .sort('-updatedAt');

    res.json({
      success: true,
      count: finances.length,
      data: finances
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/finance/summary
// @desc    Get finance summary
// @access  Private/Admin
router.get('/summary', protect, authorize('admin'), async (req, res) => {
  try {
    logger.info("Get finance summary request", { userId: req.user.id });
    logger.database("FIND", "finance", {});
    
    const finances = await Finance.find().populate('project', 'name projectId');

    const totalInvested = finances.reduce((sum, f) => sum + (f.totalInvested || 0), 0);
    const totalAbleToBill = finances.reduce((sum, f) => sum + (f.ableToBill || 0), 0);
    const pending = totalInvested - totalAbleToBill;
    const efficiency = totalInvested > 0 ? (totalAbleToBill / totalInvested) * 100 : 0;

    logger.success("Finance summary retrieved", { 
      totalInvested, 
      totalAbleToBill, 
      userId: req.user.id 
    });

    res.json({
      success: true,
      summary: {
        totalInvested,
        ableToBill: totalAbleToBill,
        pending,
        efficiency: efficiency.toFixed(2),
        projectCount: finances.length
      },
      data: finances
    });
  } catch (error) {
    logger.error("Get finance summary error", error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/finance/project/:projectId
// @desc    Get finance for a project
// @access  Private
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    let finance = await Finance.findOne({ project: req.params.projectId })
      .populate('project', 'name projectId')
      .populate('updatedBy', 'name email');

    if (!finance) {
      // Create default finance record if doesn't exist
      finance = await Finance.create({
        project: req.params.projectId,
        updatedBy: req.user.id
      });
    }

    res.json({
      success: true,
      data: finance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/finance
// @desc    Create finance record
// @access  Private/Admin
router.post('/', protect, authorize('admin'), [
  body('project').notEmpty().withMessage('Project ID is required'),
  body('totalInvested').isFloat({ min: 0 }).withMessage('Total invested must be a positive number'),
  body('ableToBill').isFloat({ min: 0 }).withMessage('Able to bill must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const finance = await Finance.create({
      ...req.body,
      updatedBy: req.user.id
    });

    const populatedFinance = await Finance.findById(finance._id)
      .populate('project', 'name projectId')
      .populate('updatedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedFinance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/finance/:id
// @desc    Update finance record
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    let finance = await Finance.findById(req.params.id);

    if (!finance) {
      return res.status(404).json({
        success: false,
        message: 'Finance record not found'
      });
    }

    finance = await Finance.findByIdAndUpdate(req.params.id, {
      ...req.body,
      updatedBy: req.user.id
    }, {
      new: true,
      runValidators: true
    }).populate('project', 'name projectId')
      .populate('updatedBy', 'name email');

    res.json({
      success: true,
      data: finance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;


