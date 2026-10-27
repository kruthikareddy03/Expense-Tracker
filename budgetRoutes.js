import express from 'express';
import {
  getBudgets,
  getBudgetStatus,
  setBudget
} from '../controllers/budgetController.js';

const router = express.Router();

router.get('/', getBudgets);
router.get('/status', getBudgetStatus);
router.post('/', setBudget);

export default router;
