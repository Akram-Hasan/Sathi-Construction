const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: [true, 'Please add a project ID'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{3}-[0-9]{3}$/, 'Project ID must be in format: XXX-000']
  },
  name: {
    type: String,
    required: [true, 'Please add a project name'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  clientName: {
    type: String,
    trim: true
  },
  budget: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['Planning', 'In Progress', 'On Hold', 'Completed'],
    default: 'Planning'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  startDate: {
    type: Date
  },
  expectedCompletionDate: {
    type: Date
  },
  actualCompletionDate: {
    type: Date
  },
  timeline: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    icon: {
      type: String,
      default: 'checkmark-circle'
    }
  }],
  assignedManpower: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manpower'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);


