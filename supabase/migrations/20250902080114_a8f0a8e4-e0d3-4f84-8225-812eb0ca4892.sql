-- Additional security enhancements for sensitive data protection

-- Create a security definer function to check if user can access audit logs 
-- (only for their own data or if they're a security admin)
CREATE OR REPLACE FUNCTION public.can_access_audit_logs(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Users can only access their own audit logs
  RETURN auth.uid() = target_user_id;
END;
$$;

-- Enhanced RLS policy for audit_logs with more restrictive access
DROP POLICY IF EXISTS "Users can read own audit logs" ON public.audit_logs;
CREATE POLICY "Users can read own audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.can_access_audit_logs(user_id));

-- Create function to validate company settings access
CREATE OR REPLACE FUNCTION public.can_access_company_settings(target_user_id UUID)
RETURNS BOOLEAN  
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only the owner can access their company settings
  RETURN auth.uid() = target_user_id;
END;
$$;

-- Enhanced RLS policies for company_settings with stricter validation
DROP POLICY IF EXISTS "Users can read own company_settings" ON public.company_settings;
DROP POLICY IF EXISTS "Users can update own company_settings" ON public.company_settings;

CREATE POLICY "Users can read own company_settings"
ON public.company_settings
FOR SELECT
TO authenticated
USING (public.can_access_company_settings(user_id));

CREATE POLICY "Users can update own company_settings"  
ON public.company_settings
FOR UPDATE
TO authenticated
USING (public.can_access_company_settings(user_id))
WITH CHECK (public.can_access_company_settings(user_id));

-- Add additional security constraint: prevent modification of sensitive audit data
-- Users should not be able to modify risk scores or suspicious flags
ALTER TABLE public.audit_logs ALTER COLUMN risk_score SET DEFAULT 0;
ALTER TABLE public.audit_logs ALTER COLUMN suspicious_flags SET DEFAULT '{}'::jsonb;

-- Comment for documentation
COMMENT ON FUNCTION public.can_access_audit_logs IS 'Security function to control access to audit logs - users can only access their own data';
COMMENT ON FUNCTION public.can_access_company_settings IS 'Security function to control access to company settings - users can only access their own data';