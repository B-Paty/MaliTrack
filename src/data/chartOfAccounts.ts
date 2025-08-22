export interface Account {
  accountCode: string;
  accountName: string;
  category: string;
  currentBalance: number;
  normalBalance: 'debit' | 'credit';
}

export interface Transaction {
  id: string;
  referenceNumber: string;
  transactionDate: string;
  description: string;
  lines: TransactionLine[];
}

export interface TransactionLine {
  id: string;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  logoFilename?: string;
  logoPath?: string;
  primaryColor: string;
}

export const chartOfAccounts: Account[] = [
  // Current Assets
  { accountCode: '1010', accountName: 'Cash in Hand', category: 'Current Asset', currentBalance: 15000.00, normalBalance: 'debit' },
  { accountCode: '1020', accountName: 'Bank Account', category: 'Current Asset', currentBalance: 125000.00, normalBalance: 'debit' },
  { accountCode: '1030', accountName: 'Accounts Receivable', category: 'Current Asset', currentBalance: 45000.00, normalBalance: 'debit' },
  { accountCode: '1040', accountName: 'Inventory', category: 'Current Asset', currentBalance: 30000.00, normalBalance: 'debit' },
  { accountCode: '1050', accountName: 'Prepaid Expenses', category: 'Current Asset', currentBalance: 8000.00, normalBalance: 'debit' },
  
  // Fixed Assets
  { accountCode: '1200', accountName: 'Office Equipment', category: 'Fixed Asset', currentBalance: 25000.00, normalBalance: 'debit' },
  { accountCode: '1210', accountName: 'Vehicles', category: 'Fixed Asset', currentBalance: 75000.00, normalBalance: 'debit' },
  { accountCode: '1220', accountName: 'Furniture & Fixtures', category: 'Fixed Asset', currentBalance: 18000.00, normalBalance: 'debit' },
  { accountCode: '1230', accountName: 'Computers & IT Equipment', category: 'Fixed Asset', currentBalance: 35000.00, normalBalance: 'debit' },
  { accountCode: '1290', accountName: 'Accumulated Depreciation', category: 'Contra-Asset', currentBalance: 15000.00, normalBalance: 'credit' },
  
  // Current Liabilities
  { accountCode: '2010', accountName: 'Accounts Payable', category: 'Current Liability', currentBalance: 22000.00, normalBalance: 'credit' },
  { accountCode: '2020', accountName: 'Salaries Payable', category: 'Current Liability', currentBalance: 8500.00, normalBalance: 'credit' },
  { accountCode: '2030', accountName: 'Taxes Payable (VAT, PAYE)', category: 'Current Liability', currentBalance: 12000.00, normalBalance: 'credit' },
  { accountCode: '2040', accountName: 'Short-term Loan', category: 'Current Liability', currentBalance: 25000.00, normalBalance: 'credit' },
  
  // Long-term Liabilities
  { accountCode: '2100', accountName: 'Bank Loan (Long-term)', category: 'Long-term Liability', currentBalance: 150000.00, normalBalance: 'credit' },
  
  // Equity
  { accountCode: '3010', accountName: 'Owner\'s Capital', category: 'Equity', currentBalance: 200000.00, normalBalance: 'credit' },
  { accountCode: '3020', accountName: 'Additional Paid-in Capital', category: 'Equity', currentBalance: 50000.00, normalBalance: 'credit' },
  { accountCode: '3030', accountName: 'Retained Earnings', category: 'Equity', currentBalance: 45000.00, normalBalance: 'credit' },
  { accountCode: '3040', accountName: 'Dividends Paid', category: 'Equity', currentBalance: 15000.00, normalBalance: 'debit' },
  
  // Revenue
  { accountCode: '4010', accountName: 'Sales Revenue', category: 'Revenue', currentBalance: 285000.00, normalBalance: 'credit' },
  { accountCode: '4020', accountName: 'Service Revenue', category: 'Revenue', currentBalance: 125000.00, normalBalance: 'credit' },
  { accountCode: '4030', accountName: 'Other Income (Interest, etc.)', category: 'Revenue', currentBalance: 8500.00, normalBalance: 'credit' },
  
  // Expenses
  { accountCode: '5010', accountName: 'Cost of Goods Sold', category: 'Expense', currentBalance: 145000.00, normalBalance: 'debit' },
  { accountCode: '5020', accountName: 'Salaries & Wages', category: 'Expense', currentBalance: 85000.00, normalBalance: 'debit' },
  { accountCode: '5030', accountName: 'Rent Expense', category: 'Expense', currentBalance: 24000.00, normalBalance: 'debit' },
  { accountCode: '5040', accountName: 'Utilities (Water, Power, Internet)', category: 'Expense', currentBalance: 15000.00, normalBalance: 'debit' },
  { accountCode: '5050', accountName: 'Marketing & Advertising', category: 'Expense', currentBalance: 18000.00, normalBalance: 'debit' },
  { accountCode: '5060', accountName: 'Transport & Delivery', category: 'Expense', currentBalance: 12000.00, normalBalance: 'debit' },
  { accountCode: '5070', accountName: 'Repairs & Maintenance', category: 'Expense', currentBalance: 8500.00, normalBalance: 'debit' },
  { accountCode: '5080', accountName: 'Office Supplies', category: 'Expense', currentBalance: 6000.00, normalBalance: 'debit' },
  { accountCode: '5090', accountName: 'Insurance Expense', category: 'Expense', currentBalance: 9500.00, normalBalance: 'debit' },
  { accountCode: '5100', accountName: 'Bank Charges & Interest', category: 'Expense', currentBalance: 3500.00, normalBalance: 'debit' },
  { accountCode: '5110', accountName: 'Depreciation Expense', category: 'Expense', currentBalance: 15000.00, normalBalance: 'debit' },
];

export const defaultCompanySettings: CompanySettings = {
  id: '1',
  companyName: 'QSA Solutions',
  primaryColor: '#a1052d',
};

// Note: Sample data removed as requested - all transactions now come from database

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

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('sw-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 2
  }).format(amount);
};