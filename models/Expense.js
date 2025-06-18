const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be positive']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  paid_by: {
    type: String,
    required: [true, 'Paid by field is required'],
    trim: true
  },
  participants: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    share: {
      type: Number,
      default: 0
    },
    shareType: {
      type: String,
      enum: ['equal', 'percentage', 'exact'],
      default: 'equal'
    }
  }],
  category: {
    type: String,
    enum: ['Food', 'Travel', 'Utilities', 'Entertainment', 'Other'],
    default: 'Other'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    required: function() {
      return this.isRecurring;
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to set default participants
expenseSchema.pre('save', function(next) {
  if (this.participants.length === 0) {
    // If no participants specified, add the payer as sole participant
    this.participants = [{
      name: this.paid_by,
      share: this.amount,
      shareType: 'exact'
    }];
  }
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);