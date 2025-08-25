-- Migration: tighten RLS and storage policies
-- Date: 2025-08-25

-- 1) Remove overly-permissive public policies if they exist
DROP POLICY IF EXISTS "Allow public access to company settings" ON public.company_settings;
DROP POLICY IF EXISTS "Allow public access to chart of accounts" ON public.chart_of_accounts;
DROP POLICY IF EXISTS "Allow public access to transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow public access to transaction lines" ON public.transaction_lines;

DROP POLICY IF EXISTS "Company logos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload company logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update company logos" ON storage.objects;

-- 2) Company settings: allow public read, require authenticated users for writes
CREATE POLICY IF NOT EXISTS "public_select_company_settings"
  ON public.company_settings
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "authenticated_modify_company_settings"
  ON public.company_settings
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 3) Chart of accounts: allow public read (used by client UI), require auth for writes
CREATE POLICY IF NOT EXISTS "public_select_chart_of_accounts"
  ON public.chart_of_accounts
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "authenticated_modify_chart_of_accounts"
  ON public.chart_of_accounts
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 4) Transactions: require authenticated users for all access (sensitive financial data)
CREATE POLICY IF NOT EXISTS "authenticated_access_transactions"
  ON public.transactions
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 5) Transaction lines: require authenticated users for all access
CREATE POLICY IF NOT EXISTS "authenticated_access_transaction_lines"
  ON public.transaction_lines
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 6) Storage: keep company-logos readable by public, but require authentication for uploads/changes
CREATE POLICY IF NOT EXISTS "public_select_company_logos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'company-logos');

CREATE POLICY IF NOT EXISTS "authenticated_insert_company_logos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "authenticated_update_company_logos"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "authenticated_delete_company_logos"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'company-logos' AND auth.role() = 'authenticated');

-- 7) Safety: ensure RLS is enabled (no-op if already enabled)
ALTER TABLE IF EXISTS public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transaction_lines ENABLE ROW LEVEL SECURITY;

-- 8) Notes for operators
COMMENT ON TABLE public.transactions IS 'RLS now requires authenticated access. Consider adding an owner/user id column (created_by) to enforce per-user access if needed.';
COMMENT ON TABLE public.transaction_lines IS 'RLS now requires authenticated access. Consider adding created_by or linking policies to transactions.created_by for finer-grained control.';
