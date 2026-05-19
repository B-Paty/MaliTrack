-- Create sample accounts for demonstration
-- This migration adds basic chart of accounts data for testing
-- Only creates accounts for users who don't have any accounts yet

-- Insert sample accounts if none exist (VBA Excel-style Chart of Accounts)
INSERT INTO public.chart_of_accounts (account_code, account_name, category, current_balance, normal_balance, user_id)
SELECT
  '1010', 'Cash in Hand', 'Current Asset', 15000.00, 'debit', auth.uid()
WHERE NOT EXISTS (SELECT 1 FROM public.chart_of_accounts WHERE user_id = auth.uid())
UNION ALL
SELECT
  '1020', 'Bank Account', 'Current Asset', 25000.00, 'debit', auth.uid()
UNION ALL
SELECT
  '1030', 'Accounts Receivable', 'Current Asset', 8500.00, 'debit', auth.uid()
UNION ALL
SELECT
  '1040', 'Inventory', 'Current Asset', 20000.00, 'debit', auth.uid()
UNION ALL
SELECT
  '1050', 'Prepaid Expenses', 'Current Asset', 3000.00, 'debit', auth.uid()
UNION ALL
SELECT
  '1200', 'Office Equipment', 'Fixed Asset', 12000.00, 'debit', auth.uid()
UNION ALL
SELECT
  '1210', 'Vehicles', 'Fixed Asset', 25000.00, 'debit', auth.uid()
UNION ALL
SELECT
  '1220', 'Furniture & Fixtures', 'Fixed Asset', 8000.00, 'debit', auth.uid()
UNION ALL
SELECT
  '1230', 'Computers & IT Equipment', 'Fixed Asset', 5000.00, 'debit', auth.uid()
UNION ALL
SELECT
  '1290', 'Accumulated Depreciation', 'Contra-Asset', 4200.00, 'credit', auth.uid()
UNION ALL
SELECT
  '2010', 'Accounts Payable', 'Current Liability', 6500.00, 'credit', auth.uid()
UNION ALL
SELECT
  '2020', 'Salaries Payable', 'Current Liability', 3200.00, 'credit', auth.uid()
UNION ALL
SELECT
  '2030', 'Taxes Payable (VAT, PAYE)', 'Current Liability', 1800.00, 'credit', auth.uid()
UNION ALL
SELECT
  '2040', 'Short-term Loan', 'Current Liability', 10000.00, 'credit', auth.uid()
UNION ALL
SELECT
  '2100', 'Bank Loan (Long-term)', 'Long-term Liability', 25000.00, 'credit', auth.uid()
UNION ALL
SELECT
  '3010', 'Owner''s Capital', 'Equity', 50000.00, 'credit', auth.uid()
UNION ALL
SELECT
  '3020', 'Additional Paid-in Capital', 'Equity', 10000.00, 'credit', auth.uid()
UNION ALL
SELECT
  '3030', 'Retained Earnings', 'Equity', 12000.00, 'credit', auth.uid()
UNION ALL
SELECT
  '3040', 'Dividends Paid', 'Equity', 0.00, 'debit', auth.uid()
UNION ALL
SELECT
  '4010', 'Sales Revenue', 'Revenue', 75000.00, 'credit', auth.uid()
UNION ALL
SELECT
  '4020', 'Service Revenue', 'Revenue', 15000.00, 'credit', auth.uid()
UNION ALL
SELECT
  '4030', 'Other Income (Interest, etc.)', 'Revenue', 1100.00, 'credit', auth.uid()
UNION ALL
SELECT
  '5010', 'Cost of Goods Sold', 'Expense', 30000.00, 'debit', auth.uid()
UNION ALL
SELECT
  '5020', 'Salaries & Wages', 'Expense', 25000.00, 'debit', auth.uid()
UNION ALL
SELECT
  '5030', 'Rent Expense', 'Expense', 4800.00, 'debit', auth.uid()
UNION ALL
SELECT
  '5040', 'Utilities (Water, Power, Internet)', 'Expense', 2100.00, 'debit', auth.uid()
UNION ALL
SELECT
  '5050', 'Marketing & Advertising', 'Expense', 3500.00, 'debit', auth.uid()
UNION ALL
SELECT
  '5060', 'Transport & Delivery', 'Expense', 1200.00, 'debit', auth.uid()
UNION ALL
SELECT
  '5070', 'Repairs & Maintenance', 'Expense', 800.00, 'debit', auth.uid()
UNION ALL
SELECT
  '5080', 'Office Supplies', 'Expense', 1800.00, 'debit', auth.uid()
UNION ALL
SELECT
  '5090', 'Insurance Expense', 'Expense', 1200.00, 'debit', auth.uid()
UNION ALL
SELECT
  '5100', 'Bank Charges & Interest', 'Expense', 300.00, 'debit', auth.uid()
UNION ALL
SELECT
  '5110', 'Depreciation Expense', 'Expense', 2400.00, 'debit', auth.uid()
ON CONFLICT (account_code) DO NOTHING;
