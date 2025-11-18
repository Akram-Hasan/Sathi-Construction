const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    logger.info("Get all projects request", { userId: req.user.id });
    logger.database("FIND", "projects", {});
    
    const projects = await Project.find()
      .populate('createdBy', 'name email')
      .populate('assignedManpower', 'name role')
      .sort('-createdAt');

    logger.success("Projects retrieved", { count: projects.length, userId: req.user.id });

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    logger.error("Get all projects error", error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    logger.info("Get project by ID request", { projectId: req.params.id, userId: req.user.id });
    logger.database("FIND", "projects", { _id: req.params.id });
    
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedManpower', 'name role employeeId');

    if (!project) {
      logger.warn("Project not found", { projectId: req.params.id, userId: req.user.id });
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    logger.success("Project retrieved", { projectId: project._id, name: project.name });

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    logger.error("Get project by ID error", error, { projectId: req.params.id, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private/Admin
router.post('/', protect, authorize('admin'), [
  body('projectId').matches(/^[A-Z]{3}-[0-9]{3}$/).withMessage('Project ID must be in format: XXX-000'),
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('location').trim().notEmpty().withMessage('Location is required')
], async (req, res) => {
  try {
    logger.info("Create project request", { 
      projectId: req.body.projectId, 
      userId: req.user.id,
      name: req.body.name 
    });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Create project validation failed", { 
        errors: errors.array(), 
        userId: req.user.id 
      });
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if project ID exists
    const projectIdUpper = req.body.projectId.toUpperCase();
    logger.database("FIND", "projects", { projectId: projectIdUpper });
    const existingProject = await Project.findOne({ projectId: projectIdUpper });
    if (existingProject) {
      logger.warn("Create project failed - ID already exists", { 
        projectId: projectIdUpper, 
        userId: req.user.id 
      });
      return res.status(400).json({
        success: false,
        message: 'Project ID already exists'
      });
    }

    logger.database("CREATE", "projects", { projectId: projectIdUpper, name: req.body.name });
    const project = await Project.create({
      ...req.body,
      projectId: projectIdUpper,
      createdBy: req.user.id
    });

    logger.success("Project created successfully", { 
      projectId: project._id, 
      name: project.name,
      createdBy: req.user.id 
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    if (error.code === 11000) {
      logger.warn("Create project failed - duplicate key", { 
        error: error.message, 
        userId: req.user.id 
      });
      return res.status(400).json({
        success: false,
        message: 'Project ID already exists'
      });
    }
    logger.error("Create project error", error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    logger.info("Update project request", { 
      projectId: req.params.id, 
      userId: req.user.id 
    });
    
    logger.database("FIND", "projects", { _id: req.params.id });
    let project = await Project.findById(req.params.id);

    if (!project) {
      logger.warn("Update project failed - not found", { 
        projectId: req.params.id, 
        userId: req.user.id 
      });
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Handle timeline updates - clean and convert dates
    const updateData = { ...req.body };
    if (updateData.timeline && Array.isArray(updateData.timeline)) {
      updateData.timeline = updateData.timeline.map(item => {
        const cleanedItem = {
          title: item.title,
          description: item.description || '',
          icon: item.icon || 'checkmark-circle'
        };
        
        // Convert date string to Date object
        if (item.date) {
          cleanedItem.date = new Date(item.date);
        }
        
        // Remove any custom _id fields - let Mongoose generate them
        return cleanedItem;
      });
    }

    // Convert date strings to Date objects for other date fields
    if (updateData.startDate && typeof updateData.startDate === 'string') {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.expectedCompletionDate && typeof updateData.expectedCompletionDate === 'string') {
      updateData.expectedCompletionDate = new Date(updateData.expectedCompletionDate);
    }
    if (updateData.actualCompletionDate && typeof updateData.actualCompletionDate === 'string') {
      updateData.actualCompletionDate = new Date(updateData.actualCompletionDate);
    }

    logger.database("UPDATE", "projects", { _id: req.params.id, updates: Object.keys(updateData) });
    project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    logger.success("Project updated successfully", { 
      projectId: project._id, 
      name: project.name,
      updatedBy: req.user.id 
    });

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    logger.error("Update project error", error, { 
      projectId: req.params.id, 
      userId: req.user?.id 
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    logger.info("Delete project request", { 
      projectId: req.params.id, 
      userId: req.user.id 
    });
    
    logger.database("FIND", "projects", { _id: req.params.id });
    const project = await Project.findById(req.params.id);

    if (!project) {
      logger.warn("Delete project failed - not found", { 
        projectId: req.params.id, 
        userId: req.user.id 
      });
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    logger.database("DELETE", "projects", { _id: req.params.id });
    await project.deleteOne();

    logger.success("Project deleted successfully", { 
      projectId: req.params.id, 
      name: project.name,
      deletedBy: req.user.id 
    });

    res.json({
      success: true,
      message: 'Project deleted'
    });
  } catch (error) {
    logger.error("Delete project error", error, { 
      projectId: req.params.id, 
      userId: req.user?.id 
    });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/projects/status/started
// @desc    Get started projects
// @access  Private
router.get('/status/started', protect, async (req, res) => {
  try {
    logger.info("Get started projects request", { userId: req.user.id });
    logger.database("FIND", "projects", { status: { $in: ['In Progress', 'Planning'] } });
    
    const projects = await Project.find({
      status: { $in: ['In Progress', 'Planning'] },
      progress: { $gt: 0 }
    })
      .populate('createdBy', 'name email')
      .sort('-updatedAt');

    logger.success("Started projects retrieved", { count: projects.length, userId: req.user.id });

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    logger.error("Get started projects error", error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/projects/status/not-started
// @desc    Get not started projects
// @access  Private
router.get('/status/not-started', protect, async (req, res) => {
  try {
    logger.info("Get not-started projects request", { userId: req.user.id });
    logger.database("FIND", "projects", { status: 'Planning' });
    
    const projects = await Project.find({
      $or: [
        { status: 'Planning' },
        { progress: 0 }
      ]
    })
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    logger.success("Not-started projects retrieved", { count: projects.length, userId: req.user.id });

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    logger.error("Get not-started projects error", error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;


