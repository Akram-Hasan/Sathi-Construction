const mongoose = require('mongoose');

const FinanceSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  totalInvested: {
    type: Number,
    required: true,
    default: 0
  },
  ableToBill: {
    type: Number,
    required: true,
    default: 0
  },
  expenses: [{
    description: String,
    amount: Number,
    category: {
      type: String,
      enum: ['Material', 'Labor', 'Equipment', 'Other']
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  revenue: [{
    description: String,
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  updatedBy: {
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

FinanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for pending amount
FinanceSchema.virtual('pending').get(function() {
  return this.totalInvested - this.ableToBill;
});

FinanceSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Finance', FinanceSchema);




