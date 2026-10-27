import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import TransactionModal from './components/TransactionModal';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import AddExpense from './pages/AddExpense';
import Budget from './pages/Budget';
import Reports from './pages/Reports';

const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Dashboard Overview';
      case '/transactions':
        return 'All Transactions';
      case '/add-expense':
        return 'Record Expense / Income';
      case '/budget':
        return 'Monthly Budget Planning';
      case '/reports':
        return 'Financial Reports & Analytics';
      default:
        return 'Smart Expense Tracker';
    }
  };

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <ProtectedRoute>
      <div className="app-container">
        {/* Collapsible / Responsive Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="main-content">
          <Navbar
            title={getPageTitle(location.pathname)}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            onOpenAddModal={() => setQuickAddModalOpen(true)}
          />

          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/add-expense" element={<AddExpense />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Global Quick Add Transaction Modal */}
        <TransactionModal
          isOpen={quickAddModalOpen}
          onClose={() => setQuickAddModalOpen(false)}
          onSuccess={() => {
            window.dispatchEvent(new Event('transactionUpdated'));
          }}
        />
      </div>
    </ProtectedRoute>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
