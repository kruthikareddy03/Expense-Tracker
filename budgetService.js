import api from './api';

export const getBudgets = async () => {
  return await api.get('/budgets');
};

export const getBudgetStatus = async (month) => {
  return await api.get('/budgets/status', {
    params: month ? { month } : {}
  });
};

export const setBudget = async (budgetData) => {
  return await api.post('/budgets', budgetData);
};
