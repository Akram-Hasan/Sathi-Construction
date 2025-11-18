const express = require('express');
const { body, validationResult } = require('express-validator');
const Material = require('../models/Material');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/materials
// @desc    Get all materials
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, project } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (project) query.project = project;

    const materials = await Material.find(query)
      .populate('project', 'name projectId')
      .populate('reportedBy', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      count: materials.length,
      data: materials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/materials/available
// @desc    Get available materials
// @access  Private
router.get('/available', protect, async (req, res) => {
  try {
    logger.info("Get available materials request", { userId: req.user.id });
    logger.database("FIND", "materials", { type: 'Available' });
    
    const materials = await Material.find({ type: 'Available' })
      .populate('project', 'name projectId')
      .sort('-createdAt');

    logger.success("Available materials retrieved", { count: materials.length, userId: req.user.id });

    res.json({
      success: true,
      count: materials.length,
      data: materials
    });
  } catch (error) {
    logger.error("Get available materials error", error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/materials/required
// @desc    Get required materials
// @access  Private
router.get('/required', protect, async (req, res) => {
  try {
    logger.info("Get required materials request", { userId: req.user.id });
    logger.database("FIND", "materials", { type: 'Required' });
    
    const materials = await Material.find({ type: 'Required' })
      .populate('project', 'name projectId')
      .sort('priority');

    logger.success("Required materials retrieved", { count: materials.length, userId: req.user.id });

    res.json({
      success: true,
      count: materials.length,
      data: materials
    });
  } catch (error) {
    logger.error("Get required materials error", error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/materials
// @desc    Create material entry
// @access  Private
router.post('/', protect, [
  body('project').notEmpty().withMessage('Project ID is required'),
  body('name').trim().notEmpty().withMessage('Material name is required'),
  body('quantity').trim().notEmpty().withMessage('Quantity is required'),
  body('type').isIn(['Available', 'Required']).withMessage('Type must be Available or Required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const material = await Material.create({
      ...req.body,
      reportedBy: req.user.id
    });

    const populatedMaterial = await Material.findById(material._id)
      .populate('project', 'name projectId')
      .populate('reportedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedMaterial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/materials/:id
// @desc    Update material
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    material = await Material.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('project', 'name projectId')
      .populate('reportedBy', 'name email');

    res.json({
      success: true,
      data: material
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/materials/:id
// @desc    Delete material
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    await material.deleteOne();

    res.json({
      success: true,
      message: 'Material deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;


