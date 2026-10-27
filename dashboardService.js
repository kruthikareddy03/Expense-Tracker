import api from './api';

export const getDashboardSummary = async () => {
  return await api.get('/dashboard/summary');
};

export const getMonthlyReport = async (month) => {
  return await api.get('/dashboard/reports/monthly', {
    params: month ? { month } : {}
  });
};
