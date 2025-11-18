const mongoose = require('mongoose');

const ManpowerSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Please add an employee ID'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Please add a role'],
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number']
  },
  email: {
    type: String,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  assignedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  experience: {
    type: String,
    trim: true
  },
  skills: {
    type: String,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
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

ManpowerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Auto-set isAvailable based on assignedProject
  if (this.assignedProject) {
    this.isAvailable = false;
  } else {
    this.isAvailable = true;
  }
  next();
});

module.exports = mongoose.model('Manpower', ManpowerSchema);


