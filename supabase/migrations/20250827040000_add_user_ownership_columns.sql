-- ============================================================================
-- MIGRATION: Add User Ownership for Data Isolation
-- VERSION: 20250827040000
-- PURPOSE: Implement multi-tenancy by adding user_id columns to financial tables
-- DEPLOYMENT: Run after initial schema setup, before user authentication
-- CLIENT IMPACT: Enables per-user data isolation for security and compliance
-- ============================================================================

-- Add user_id columns to financial tables for proper data isolation
-- This migration ensures each user can only access their own financial data
-- SECURITY: Prevents data leakage between different client users

-- Add user_id to company_settings table
ALTER TABLE public.company_settings
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to chart_of_accounts table
ALTER TABLE public.chart_of_accounts
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to transactions table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to transaction_lines table (through transactions relationship)
-- Note: transaction_lines inherits user_id through transactions.user_id

-- ============================================================================
-- DATA MIGRATION: Assign Existing Data to Users
-- CUSTOMIZATION: Modify based on your data migration strategy
-- ============================================================================

-- Update existing records to be owned by the first user (for migration)
-- STRATEGY: Assign all existing data to the first created user
-- CUSTOMIZATION: Modify this logic based on your client data requirements
-- NOTE: For multi-client deployments, you may need different assignment logic

UPDATE public.company_settings
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

UPDATE public.chart_of_accounts
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

UPDATE public.transactions
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_settings_user_id ON public.company_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_user_id ON public.chart_of_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);

-- Update RLS policies to enforce user ownership
DROP POLICY IF EXISTS "Authenticated users can read company_settings" ON public.company_settings;
DROP POLICY IF EXISTS "Authenticated users can insert company_settings" ON public.company_settings;
DROP POLICY IF EXISTS "Authenticated users can update company_settings" ON public.company_settings;
DROP POLICY IF EXISTS "Authenticated users can delete company_settings" ON public.company_settings;

-- Company Settings - User-specific access
CREATE POLICY "Users can read own company_settings" ON public.company_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own company_settings" ON public.company_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company_settings" ON public.company_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own company_settings" ON public.company_settings
    FOR DELETE USING (auth.uid() = user_id);

-- Chart of Accounts - User-specific access
DROP POLICY IF EXISTS "Authenticated users can read chart_of_accounts" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Authenticated users can insert chart_of_accounts" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Authenticated users can update chart_of_accounts" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Authenticated users can delete chart_of_accounts" ON public.chart_of_accounts;

CREATE POLICY "Users can read own chart_of_accounts" ON public.chart_of_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chart_of_accounts" ON public.chart_of_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chart_of_accounts" ON public.chart_of_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chart_of_accounts" ON public.chart_of_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Transactions - User-specific access
DROP POLICY IF EXISTS "Authenticated users can read transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can delete transactions" ON public.transactions;

CREATE POLICY "Users can read own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Transaction Lines - User-specific access (through transactions)
DROP POLICY IF EXISTS "Authenticated users can read transaction_lines" ON public.transaction_lines;
DROP POLICY IF EXISTS "Authenticated users can insert transaction_lines" ON public.transaction_lines;
DROP POLICY IF EXISTS "Authenticated users can update transaction_lines" ON public.transaction_lines;
DROP POLICY IF EXISTS "Authenticated users can delete transaction_lines" ON public.transaction_lines;

CREATE POLICY "Users can read own transaction_lines" ON public.transaction_lines
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_lines.transaction_id
            AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own transaction_lines" ON public.transaction_lines
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_lines.transaction_id
            AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own transaction_lines" ON public.transaction_lines
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_lines.transaction_id
            AND t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own transaction_lines" ON public.transaction_lines
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_lines.transaction_id
            AND t.user_id = auth.uid()
        )
    );

-- Add comments for documentation
COMMENT ON COLUMN public.company_settings.user_id IS 'Owner of the company settings - enforces data isolation';
COMMENT ON COLUMN public.chart_of_accounts.user_id IS 'Owner of the account - enforces data isolation';
COMMENT ON COLUMN public.transactions.user_id IS 'Owner of the transaction - enforces data isolation';

