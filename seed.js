import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Transaction from './models/Transaction.js';
import Budget from './models/Budget.js';
import { getCurrentMonthString } from './controllers/budgetController.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding (Indian Rupee - INR)...');
    await connectDB();

    // Clear existing data
    await Transaction.deleteMany({});
    await Budget.deleteMany({});
    console.log('🧹 Cleared existing transactions and budgets.');

    const currentMonth = getCurrentMonthString();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth();

    // 1. Create a Budget for the current month in INR
    await Budget.create({
      month: currentMonth,
      amount: 40000,
      category: 'Overall',
      notes: 'Monthly student living and study budget in Indian Rupees (INR)'
    });
    console.log(`🎯 Created budget of ₹40,000 for ${currentMonth}`);

    // Helper for relative dates
    const makeDate = (daysAgo) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d;
    };

    // Helper for previous months
    const makePastMonthDate = (monthsAgo, day) => {
      return new Date(currentYear, currentMonthNum - monthsAgo, day, 12, 0, 0);
    };

    // Sample Transactions in INR (Indian Rupee)
    const sampleTransactions = [
      // Current Month Income
      {
        title: 'Monthly Software Engineering Stipend',
        amount: 55000,
        type: 'income',
        category: 'Salary',
        date: makeDate(16),
        description: 'Direct deposit monthly tech stipend & salary'
      },
      {
        title: 'Frontend Web Freelance Project',
        amount: 14000,
        type: 'income',
        category: 'Freelancing',
        date: makeDate(8),
        description: 'Landing page development for client'
      },
      {
        title: 'Merit Academic Scholarship',
        amount: 10000,
        type: 'income',
        category: 'Scholarship',
        date: makeDate(17),
        description: 'Semester academic achievement award'
      },

      // Current Month Expenses
      {
        title: 'Supermarket Grocery Restock',
        amount: 3450.00,
        type: 'expense',
        category: 'Food',
        date: makeDate(1),
        description: 'Weekly fresh vegetables, fruits, dairy, and grains'
      },
      {
        title: 'Fiber Internet Broadband Bill',
        amount: 999.00,
        type: 'expense',
        category: 'Bills',
        date: makeDate(3),
        description: 'Monthly unlimited home broadband bill'
      },
      {
        title: 'Campus Bookstore Course Textbook',
        amount: 1850.00,
        type: 'expense',
        category: 'Education',
        date: makeDate(5),
        description: 'Database Systems & Algorithms handbook'
      },
      {
        title: 'Metro Pass & City Transit',
        amount: 1200.00,
        type: 'expense',
        category: 'Transport',
        date: makeDate(7),
        description: 'Monthly student metro and bus transit pass'
      },
      {
        title: 'Weekend Dining with College Friends',
        amount: 1650.00,
        type: 'expense',
        category: 'Food',
        date: makeDate(9),
        description: 'Dinner and pizza celebration'
      },
      {
        title: 'Sports Shoes & Apparel',
        amount: 2499.00,
        type: 'expense',
        category: 'Shopping',
        date: makeDate(11),
        description: 'Sports footwear discount sale'
      },
      {
        title: 'Cinema Movie Night & Popcorn',
        amount: 650.00,
        type: 'expense',
        category: 'Entertainment',
        date: makeDate(12),
        description: 'Weekend multiplex cinema tickets'
      },
      {
        title: 'Pharmacy Medicines & Vitamins',
        amount: 820.00,
        type: 'expense',
        category: 'Healthcare',
        date: makeDate(14),
        description: 'Prescription refill and multivitamins'
      },
      {
        title: 'Electricity & Utility Bill',
        amount: 1850.00,
        type: 'expense',
        category: 'Bills',
        date: makeDate(15),
        description: 'Monthly apartment electricity usage'
      },

      // Previous Month (1 month ago) for trend comparison
      {
        title: 'Previous Month Salary',
        amount: 55000,
        type: 'income',
        category: 'Salary',
        date: makePastMonthDate(1, 1),
        description: 'Monthly base pay'
      },
      {
        title: 'Apartment Rent Share',
        amount: 12000,
        type: 'expense',
        category: 'Bills',
        date: makePastMonthDate(1, 3),
        description: 'Monthly student housing rent'
      },
      {
        title: 'Monthly Grocery Essentials',
        amount: 6500,
        type: 'expense',
        category: 'Food',
        date: makePastMonthDate(1, 10),
        description: 'Full month grocery purchase'
      },
      {
        title: 'Online Full Stack Certification',
        amount: 2499,
        type: 'expense',
        category: 'Education',
        date: makePastMonthDate(1, 15),
        description: 'MERN stack course enrollment'
      },
      {
        title: 'Fuel & Two-Wheeler Maintenance',
        amount: 1800,
        type: 'expense',
        category: 'Transport',
        date: makePastMonthDate(1, 20),
        description: 'Fuel refill and vehicle servicing'
      },

      // 2 Months ago
      {
        title: 'Past Salary',
        amount: 55000,
        type: 'income',
        category: 'Salary',
        date: makePastMonthDate(2, 1),
        description: 'Regular monthly salary'
      },
      {
        title: 'Bluetooth Wireless Headphones',
        amount: 3200,
        type: 'expense',
        category: 'Shopping',
        date: makePastMonthDate(2, 12),
        description: 'Noise cancelling headphones for studies'
      },
      {
        title: 'Dining Out & Cafe Visits',
        amount: 4100,
        type: 'expense',
        category: 'Food',
        date: makePastMonthDate(2, 18),
        description: 'Monthly cafe and canteen meals'
      }
    ];

    await Transaction.insertMany(sampleTransactions);
    console.log(`✅ Successfully seeded ${sampleTransactions.length} sample transactions in INR (₹)!`);

    await mongoose.connection.close();
    console.log('🎉 Seeding completed successfully. Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
