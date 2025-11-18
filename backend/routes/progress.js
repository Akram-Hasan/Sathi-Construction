const express = require('express');
const { body, validationResult } = require('express-validator');
const Progress = require('../models/Progress');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/progress
// @desc    Get all progress reports
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    logger.info("Get all progress reports request", { userId: req.user.id });
    logger.database("FIND", "progress", {});
    
    const progress = await Progress.find()
      .populate('project', 'name projectId status')
      .populate('reportedBy', 'name email')
      .sort('-createdAt');

    logger.success("Progress reports retrieved", { count: progress.length, userId: req.user.id });

    res.json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (error) {
    logger.error("Get all progress reports error", error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/progress/project/:projectId
// @desc    Get progress for a project
// @access  Private
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    logger.info("Get project progress request", { 
      projectId: req.params.projectId, 
      userId: req.user.id 
    });
    logger.database("FIND", "progress", { project: req.params.projectId });
    
    const progress = await Progress.find({ project: req.params.projectId })
      .populate('reportedBy', 'name email')
      .sort('-createdAt');

    logger.success("Project progress retrieved", { 
      count: progress.length, 
      projectId: req.params.projectId,
      userId: req.user.id 
    });

    res.json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (error) {
    logger.error("Get project progress error", error, { 
      projectId: req.params.projectId, 
      userId: req.user?.id 
    });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/progress
// @desc    Create progress report
// @access  Private
router.post('/', protect, [
  body('project').notEmpty().withMessage('Project ID is required'),
  body('workCompleted').isInt({ min: 0, max: 100 }).withMessage('Work completed must be between 0 and 100'),
  body('status').isIn(['Started', 'Not Started']).withMessage('Status must be Started or Not Started')
], async (req, res) => {
  try {
    logger.info("Create progress report request", { 
      projectId: req.body.project, 
      userId: req.user.id 
    });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Create progress validation failed", { 
        errors: errors.array(), 
        userId: req.user.id 
      });
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if project exists
    logger.database("FIND", "projects", { _id: req.body.project });
    const project = await Project.findById(req.body.project);
    if (!project) {
      logger.warn("Create progress failed - project not found", { 
        projectId: req.body.project, 
        userId: req.user.id 
      });
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    logger.database("CREATE", "progress", { 
      project: req.body.project, 
      workCompleted: req.body.workCompleted 
    });
    const progress = await Progress.create({
      ...req.body,
      reportedBy: req.user.id
    });

    // Update project progress
    if (req.body.workCompleted !== undefined) {
      logger.database("UPDATE", "projects", { 
        _id: project._id, 
        progress: req.body.workCompleted 
      });
      project.progress = req.body.workCompleted;
      if (req.body.workCompleted > 0) {
        project.status = 'In Progress';
      }
      await project.save();
    }

    const populatedProgress = await Progress.findById(progress._id)
      .populate('project', 'name projectId')
      .populate('reportedBy', 'name email');

    logger.success("Progress report created successfully", { 
      progressId: progress._id, 
      projectId: project._id,
      reportedBy: req.user.id 
    });

    res.status(201).json({
      success: true,
      data: populatedProgress
    });
  } catch (error) {
    logger.error("Create progress report error", error, { userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/progress/:id
// @desc    Update progress report
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let progress = await Progress.findById(req.params.id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress report not found'
      });
    }

    // Check if user is the reporter or admin
    if (progress.reportedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    progress = await Progress.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('project', 'name projectId')
      .populate('reportedBy', 'name email');

    // Update project progress if workCompleted changed
    if (req.body.workCompleted !== undefined) {
      const project = await Project.findById(progress.project);
      if (project) {
        project.progress = req.body.workCompleted;
        await project.save();
      }
    }

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;


