import api from './api';

export const register = async (userData) => {
  return await api.post('/auth/register', userData);
};

export const login = async (credentials) => {
  return await api.post('/auth/login', credentials);
};

export const getMe = async () => {
  return await api.get('/auth/me');
};
