import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('expense_tracker_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('expense_tracker_token') || null;
  });

  const [loading, setLoading] = useState(false);

  // Sync state to localStorage
  const setAuthData = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    if (userData && userToken) {
      localStorage.setItem('expense_tracker_user', JSON.stringify(userData));
      localStorage.setItem('expense_tracker_token', userToken);
    } else {
      localStorage.removeItem('expense_tracker_user');
      localStorage.removeItem('expense_tracker_token');
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiLogin({ email, password });
      if (res.success && res.data) {
        setAuthData(res.data, res.data.token);
        return res.data;
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await apiRegister({ name, email, password });
      if (res.success && res.data) {
        setAuthData(res.data, res.data.token);
        return res.data;
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthData(null, null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
