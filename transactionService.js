import api from './api';

export const getTransactions = async (params = {}) => {
  return await api.get('/transactions', { params });
};

export const getTransactionById = async (id) => {
  return await api.get(`/transactions/${id}`);
};

export const createTransaction = async (transactionData) => {
  return await api.post('/transactions', transactionData);
};

export const updateTransaction = async (id, transactionData) => {
  return await api.put(`/transactions/${id}`, transactionData);
};

export const deleteTransaction = async (id) => {
  return await api.delete(`/transactions/${id}`);
};

export const getCategories = async () => {
  return await api.get('/transactions/categories');
};
