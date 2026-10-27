import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  PlusCircle,
  PiggyBank,
  BarChart3,
  Moon,
  Sun,
  Wallet,
  X,
  LogOut
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ReceiptText },
    { name: 'Add Expense', path: '/add-expense', icon: PlusCircle },
    { name: 'Monthly Budget', path: '/budget', icon: PiggyBank },
    { name: 'Reports', path: '/reports', icon: BarChart3 }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 49
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transform: isOpen || window.innerWidth > 900 ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform var(--transition-smooth)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px var(--primary-glow)'
              }}
            >
              <Wallet size={22} />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  letterSpacing: '-0.02em',
                  color: 'var(--text-main)',
                  lineHeight: 1.1
                }}
              >
                Smart Expense
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}
              >
                Finance Manager
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="mobile-close-btn"
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '20px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
              letterSpacing: '0.08em',
              padding: '0 12px 6px'
            }}
          >
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth <= 900 && onClose) onClose();
                }}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
                  border: isActive ? '1px solid var(--primary-border)' : '1px solid transparent',
                  transition: 'all var(--transition-fast)'
                })}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer with Dark Mode Toggle & College Project Tag */}
        <div
          style={{
            padding: '16px 18px',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-surface-alt)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <button
            onClick={toggleTheme}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--text-main)',
              fontSize: '0.86rem',
              fontWeight: 600,
              transition: 'background var(--transition-fast)'
            }}
            title="Toggle Theme"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isDark ? <Moon size={17} color="var(--primary)" /> : <Sun size={17} color="var(--warning-amber)" />}
              <span>{isDark ? 'Dark Theme' : 'Light Theme'}</span>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-surface-alt)',
                color: 'var(--text-muted)'
              }}
            >
              {isDark ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* User Profile & Logout */}
          {user && (
            <div
              style={{
                padding: '12px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    flexShrink: 0
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem', color: 'var(--expense-red)' }}
                title="Sign out of your account"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
              Smart Expense Tracker • MERN
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
