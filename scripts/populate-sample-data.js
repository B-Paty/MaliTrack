/**
 * Populate Sample Data Script
 * This script populates the database with sample accounts for demonstration
 */

const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleAccounts = [
  // Current Assets
  { account_code: '1010', account_name: 'Cash in Hand', category: 'Current Asset', current_balance: 15000.00, normal_balance: 'debit' },
  { account_code: '1020', account_name: 'Bank Account', category: 'Current Asset', current_balance: 25000.00, normal_balance: 'debit' },
  { account_code: '1030', account_name: 'Accounts Receivable', category: 'Current Asset', current_balance: 8500.00, normal_balance: 'debit' },
  { account_code: '1040', account_name: 'Inventory', category: 'Current Asset', current_balance: 20000.00, normal_balance: 'debit' },
  { account_code: '1050', account_name: 'Prepaid Expenses', category: 'Current Asset', current_balance: 3000.00, normal_balance: 'debit' },

  // Fixed Assets
  { account_code: '1200', account_name: 'Office Equipment', category: 'Fixed Asset', current_balance: 12000.00, normal_balance: 'debit' },
  { account_code: '1210', account_name: 'Vehicles', category: 'Fixed Asset', current_balance: 25000.00, normal_balance: 'debit' },
  { account_code: '1220', account_name: 'Furniture & Fixtures', category: 'Fixed Asset', current_balance: 8000.00, normal_balance: 'debit' },
  { account_code: '1230', account_name: 'Computers & IT Equipment', category: 'Fixed Asset', current_balance: 5000.00, normal_balance: 'debit' },

  // Contra-Asset
  { account_code: '1290', account_name: 'Accumulated Depreciation', category: 'Contra-Asset', current_balance: 4200.00, normal_balance: 'credit' },

  // Current Liabilities
  { account_code: '2010', account_name: 'Accounts Payable', category: 'Current Liability', current_balance: 6500.00, normal_balance: 'credit' },
  { account_code: '2020', account_name: 'Salaries Payable', category: 'Current Liability', current_balance: 3200.00, normal_balance: 'credit' },
  { account_code: '2030', account_name: 'Taxes Payable (VAT, PAYE)', category: 'Current Liability', current_balance: 1800.00, normal_balance: 'credit' },
  { account_code: '2040', account_name: 'Short-term Loan', category: 'Current Liability', current_balance: 10000.00, normal_balance: 'credit' },

  // Long-term Liabilities
  { account_code: '2100', account_name: 'Bank Loan (Long-term)', category: 'Long-term Liability', current_balance: 25000.00, normal_balance: 'credit' },

  // Equity
  { account_code: '3010', account_name: 'Owner\'s Capital', category: 'Equity', current_balance: 50000.00, normal_balance: 'credit' },
  { account_code: '3020', account_name: 'Additional Paid-in Capital', category: 'Equity', current_balance: 10000.00, normal_balance: 'credit' },
  { account_code: '3030', account_name: 'Retained Earnings', category: 'Equity', current_balance: 12000.00, normal_balance: 'credit' },
  { account_code: '3040', account_name: 'Dividends Paid', category: 'Equity', current_balance: 0.00, normal_balance: 'debit' },

  // Revenue
  { account_code: '4010', account_name: 'Sales Revenue', category: 'Revenue', current_balance: 75000.00, normal_balance: 'credit' },
  { account_code: '4020', account_name: 'Service Revenue', category: 'Revenue', current_balance: 15000.00, normal_balance: 'credit' },
  { account_code: '4030', account_name: 'Other Income (Interest, etc.)', category: 'Revenue', current_balance: 1100.00, normal_balance: 'credit' },

  // Expenses
  { account_code: '5010', account_name: 'Cost of Goods Sold', category: 'Expense', current_balance: 30000.00, normal_balance: 'debit' },
  { account_code: '5020', account_name: 'Salaries & Wages', category: 'Expense', current_balance: 25000.00, normal_balance: 'debit' },
  { account_code: '5030', account_name: 'Rent Expense', category: 'Expense', current_balance: 4800.00, normal_balance: 'debit' },
  { account_code: '5040', account_name: 'Utilities (Water, Power, Internet)', category: 'Expense', current_balance: 2100.00, normal_balance: 'debit' },
  { account_code: '5050', account_name: 'Marketing & Advertising', category: 'Expense', current_balance: 3500.00, normal_balance: 'debit' },
  { account_code: '5060', account_name: 'Transport & Delivery', category: 'Expense', current_balance: 1200.00, normal_balance: 'debit' },
  { account_code: '5070', account_name: 'Repairs & Maintenance', category: 'Expense', current_balance: 800.00, normal_balance: 'debit' },
  { account_code: '5080', account_name: 'Office Supplies', category: 'Expense', current_balance: 1800.00, normal_balance: 'debit' },
  { account_code: '5090', account_name: 'Insurance Expense', category: 'Expense', current_balance: 1200.00, normal_balance: 'debit' },
  { account_code: '5100', account_name: 'Bank Charges & Interest', category: 'Expense', current_balance: 300.00, normal_balance: 'debit' },
  { account_code: '5110', account_name: 'Depreciation Expense', category: 'Expense', current_balance: 2400.00, normal_balance: 'debit' },
];

async function populateSampleData() {
  try {
    console.log('🔄 Starting sample data population...');

    // Get current user (this assumes user is authenticated)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('❌ No authenticated user found. Please log in first.');
      return;
    }

    console.log(`👤 User: ${user.email}`);

    // Check if accounts already exist
    const { data: existingAccounts, error: checkError } = await supabase
      .from('chart_of_accounts')
      .select('account_code')
      .eq('user_id', user.id)
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking existing accounts:', checkError);
      return;
    }

    if (existingAccounts && existingAccounts.length > 0) {
      console.log('ℹ️  Sample accounts already exist. Skipping population.');
      return;
    }

    // Insert sample accounts
    const accountsWithUserId = sampleAccounts.map(account => ({
      ...account,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('chart_of_accounts')
      .insert(accountsWithUserId)
      .select();

    if (error) {
      console.error('❌ Error inserting sample accounts:', error);
      return;
    }

    console.log(`✅ Successfully inserted ${data.length} sample accounts`);
    console.log('📊 Sample accounts added:');
    data.forEach(account => {
      console.log(`   - ${account.account_code}: ${account.account_name} (${account.category})`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
populateSampleData();
