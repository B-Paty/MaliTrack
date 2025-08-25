# Scripts

This directory contains utility scripts for the QSA Ledger application.

## Populate Sample Data

The `populate-sample-data.js` script adds sample accounts to your database for testing and demonstration purposes.

### Prerequisites

1. Make sure you have Node.js installed
2. Install dependencies: `npm install`
3. Set up your Supabase environment variables

### Environment Variables

Create a `.env.local` file in the root directory with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the Script

1. Make sure you're logged into your Supabase account
2. Run the script:

```bash
node scripts/populate-sample-data.js
```

### What it does

The script will:
- Check if you're authenticated
- Verify that no sample accounts already exist
- Insert 20 sample accounts across all major categories:
  - Current Assets (Cash, AR, Inventory)
  - Fixed Assets (Office Equipment)
  - Current Liabilities (AP, Loans)
  - Equity (Common Stock, Retained Earnings)
  - Revenue (Sales, Interest, Misc Income)
  - Expenses (COGS, Rent, Utilities, Salaries, etc.)

### Sample Accounts Added

| Code | Account Name | Category | Balance | Normal Balance |
|------|--------------|----------|---------|----------------|
| 1000 | Cash | Current Asset | 15,000 | Debit |
| 1100 | Accounts Receivable | Current Asset | 8,500 | Debit |
| 1200 | Inventory | Current Asset | 25,000 | Debit |
| 1500 | Office Equipment | Fixed Asset | 12,000 | Debit |
| 2000 | Accounts Payable | Current Liability | 6,500 | Credit |
| 2100 | Loans Payable | Current Liability | 25,000 | Credit |
| 3000 | Common Stock | Equity | 50,000 | Credit |
| 3100 | Retained Earnings | Equity | 12,000 | Credit |
| 4000 | Sales Revenue | Revenue | 75,000 | Credit |
| 5000 | Cost of Goods Sold | Expense | 30,000 | Debit |
| ...and more | | | | |

### After Running

Once the script completes successfully:
- Your Chart of Accounts will show all sample accounts organized by category
- Your Trial Balance will display properly balanced debits and credits
- You can use the export functionality to generate branded reports

### Troubleshooting

- **"No authenticated user found"**: Make sure you're logged into the application first
- **"Sample accounts already exist"**: The script won't overwrite existing data
- **Permission errors**: Check your Supabase RLS policies
