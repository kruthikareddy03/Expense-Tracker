import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: [true, 'Month in format YYYY-MM is required'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format']
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [1, 'Budget must be at least 1']
    },
    category: {
      type: String,
      default: 'Overall',
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Unique compound index so each month has only 1 overall budget (or category budget)
budgetSchema.index({ month: 1, category: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
