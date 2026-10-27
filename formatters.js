// Indian Rupee currency formatting utility
export const formatINR = (amount, includeFractions = true) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeFractions ? 2 : 0,
    maximumFractionDigits: 2
  }).format(num);
};

// Compact Indian format for charts (e.g. ₹1.5k, ₹25k, ₹1L)
export const formatCompactINR = (amount) => {
  const num = Number(amount) || 0;
  if (Math.abs(num) >= 10000000) {
    return `₹${(num / 10000000).toFixed(1)}Cr`;
  }
  if (Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  }
  if (Math.abs(num) >= 1000) {
    return `₹${(num / 1000).toFixed(1)}k`;
  }
  return `₹${num}`;
};
