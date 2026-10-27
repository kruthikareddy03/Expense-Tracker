import mongoose from 'mongoose';

export const EXPENSE_CATEGORIES = [
  'Food',
  'Shopping',
  'Transport',
  'Education',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Other'
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Allowance',
  'Scholarship',
  'Freelancing',
  'Other'
];

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Transaction title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero']
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: ['income', 'expense'],
        message: 'Type must be either income or expense'
      },
      lowercase: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes for optimized querying and aggregation
transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
