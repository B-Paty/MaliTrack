/**
 * Format currency in Tanzanian Shilling (TZS)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('sw-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format number for input fields
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Parse string to number for calculations
 */
export const parseNumber = (value: string): number => {
  const cleanValue = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date for input fields
 */
export const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

/**
 * Get category order for sorting
 */
export const getCategoryOrder = (category: string): number => {
  const order: { [key: string]: number } = {
    'Current Asset': 1,
    'Fixed Asset': 2,
    'Contra-Asset': 3,
    'Current Liability': 4,
    'Long-term Liability': 5,
    'Equity': 6,
    'Revenue': 7,
    'Expense': 8
  };
  return order[category] || 999;
};