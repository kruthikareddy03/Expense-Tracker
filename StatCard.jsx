import React from 'react';

const StatCard = ({ title, amount, type = 'balance', subtext, icon: Icon, isCurrency = true }) => {
  const formattedAmount = isCurrency
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
      }).format(amount || 0)
    : (amount || 0).toLocaleString('en-IN');

  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-content">
        <span className="stat-label">{title}</span>
        <span className="stat-value">{formattedAmount}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>

      {Icon && (
        <div className="stat-icon-wrapper">
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
