/**
 * formatters.ts
 * Helpers for money and date formatting used across UI and exports.
 * - Currency: Tsh whole numbers (no decimals)
 * - parseNumber: sanitize user input for calculations
 * - Date display + input helpers
 */
/**
 * Format currency in Tanzanian Shilling (TZS) - Whole numbers only
 */
export const formatCurrency = (amount: number): string => {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('sw-TZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
  return `Tsh ${formatted}`;
};

/**
 * Format number for input fields - Whole numbers only, supports large amounts
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));
};

/**
 * Parse string to number for calculations - Supports large whole numbers
 */
export const parseNumber = (value: string): number => {
  // Remove all non-numeric characters except commas
  const cleanValue = value.replace(/[^0-9,]/g, '');
  // Remove commas and parse
  const numberString = cleanValue.replace(/,/g, '');
  const parsed = parseInt(numberString, 10);
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