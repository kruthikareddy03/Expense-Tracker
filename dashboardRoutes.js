import express from 'express';
import {
  getDashboardSummary,
  getMonthlyReport
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/summary', getDashboardSummary);
router.get('/reports/monthly', getMonthlyReport);

export default router;
