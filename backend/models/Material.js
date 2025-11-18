const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a material name'],
    trim: true
  },
  quantity: {
    type: String,
    required: [true, 'Please add quantity'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Available', 'Required'],
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  neededBy: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'Ordered', 'Delivered', 'In Stock'],
    default: 'Pending'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

MaterialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Material', MaterialSchema);




