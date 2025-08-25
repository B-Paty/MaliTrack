-- Secure Financial Tables - Restrict to Authenticated Users Only
-- This migration fixes the security vulnerability where financial data was publicly accessible

-- Enable RLS on all financial tables (if not already enabled)
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing public policies (these made data publicly accessible)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Enable update for all users" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.chart_of_accounts;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.transactions;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.transactions;
DROP POLICY IF EXISTS "Enable update for all users" ON public.transactions;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.transactions;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.transaction_lines;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.transaction_lines;
DROP POLICY IF EXISTS "Enable update for all users" ON public.transaction_lines;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.transaction_lines;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.company_settings;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.company_settings;
DROP POLICY IF EXISTS "Enable update for all users" ON public.company_settings;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.company_settings;

-- Create secure policies that require authentication
-- Chart of Accounts - Authenticated users only
CREATE POLICY "Authenticated users can read chart_of_accounts" ON public.chart_of_accounts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert chart_of_accounts" ON public.chart_of_accounts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update chart_of_accounts" ON public.chart_of_accounts
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete chart_of_accounts" ON public.chart_of_accounts
    FOR DELETE USING (auth.role() = 'authenticated');

-- Transactions - Authenticated users only
CREATE POLICY "Authenticated users can read transactions" ON public.transactions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update transactions" ON public.transactions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete transactions" ON public.transactions
    FOR DELETE USING (auth.role() = 'authenticated');

-- Transaction Lines - Authenticated users only
CREATE POLICY "Authenticated users can read transaction_lines" ON public.transaction_lines
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert transaction_lines" ON public.transaction_lines
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update transaction_lines" ON public.transaction_lines
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete transaction_lines" ON public.transaction_lines
    FOR DELETE USING (auth.role() = 'authenticated');

-- Company Settings - Authenticated users only
CREATE POLICY "Authenticated users can read company_settings" ON public.company_settings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert company_settings" ON public.company_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update company_settings" ON public.company_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete company_settings" ON public.company_settings
    FOR DELETE USING (auth.role() = 'authenticated');

-- Add comment for documentation
COMMENT ON TABLE public.chart_of_accounts IS 'Financial account data - restricted to authenticated users only';
COMMENT ON TABLE public.transactions IS 'Financial transaction data - restricted to authenticated users only';
COMMENT ON TABLE public.transaction_lines IS 'Transaction line items - restricted to authenticated users only';
COMMENT ON TABLE public.company_settings IS 'Company configuration - restricted to authenticated users only';
