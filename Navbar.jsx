import React from 'react';
import { Menu, Plus, Calendar, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onToggleSidebar, onOpenAddModal, title = 'Dashboard' }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-light)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Left: Mobile hamburger & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-sm)'
          }}
          className="mobile-hamburger-btn"
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            {title}
          </h2>
        </div>
      </div>

      {/* Right: Date badge, Quick Add CTA, and Theme Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Date badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-surface-alt)',
            padding: '7px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-light)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            fontWeight: 500
          }}
          className="date-pill"
        >
          <Calendar size={14} color="var(--primary)" />
          <span>{formattedDate}</span>
        </div>

        {/* Theme toggle icon button */}
        <button
          onClick={toggleTheme}
          className="btn-icon btn-secondary"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {isDark ? <Sun size={18} color="var(--warning-amber)" /> : <Moon size={18} color="var(--text-muted)" />}
        </button>

        {/* User Pill */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px 4px 6px',
              backgroundColor: 'var(--bg-surface-alt)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-light)'
            }}
            className="user-pill"
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.76rem',
                fontWeight: 700
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {user.name}
            </span>
          </div>
        )}

        {/* Add Transaction Button */}
        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.86rem' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Transaction</span>
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .mobile-hamburger-btn {
            display: flex !important;
          }
          header {
            padding: 0 16px !important;
          }
          .date-pill {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
