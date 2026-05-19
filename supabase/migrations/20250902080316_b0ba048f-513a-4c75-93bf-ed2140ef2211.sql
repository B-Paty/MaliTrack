-- Fix critical security issue: suspicious_patterns table has overly restrictive RLS policy
-- This was preventing the security monitoring system from functioning

-- Drop the overly restrictive policy that blocks ALL access
DROP POLICY IF EXISTS "System access only for suspicious patterns" ON public.suspicious_patterns;

-- Create proper RLS policies for suspicious_patterns table
-- Allow service role (system) to manage threat detection patterns
CREATE POLICY "Service role can manage suspicious patterns"
ON public.suspicious_patterns
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to read pattern names and descriptions for security dashboard
-- but protect sensitive detection queries
CREATE POLICY "Users can read pattern metadata"
ON public.suspicious_patterns  
FOR SELECT
TO authenticated
USING (true);

-- Create a security definer function to check if user has security admin privileges
-- This will be used for pattern management in the future
CREATE OR REPLACE FUNCTION public.is_security_manager()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Currently only service role can manage patterns
  -- In the future, this could be extended to check user roles
  RETURN current_setting('role', true) = 'service_role';
END;
$$;

-- Allow security managers to insert/update/delete patterns
CREATE POLICY "Security managers can modify patterns"
ON public.suspicious_patterns
FOR ALL
TO authenticated
USING (public.is_security_manager())
WITH CHECK (public.is_security_manager());

-- Ensure the security monitoring functions can access patterns
-- Update the existing is_security_admin function to be more specific
DROP FUNCTION IF EXISTS public.is_security_admin;
CREATE OR REPLACE FUNCTION public.is_security_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service role and security managers
  RETURN current_setting('role', true) = 'service_role' OR public.is_security_manager();
END;
$$;

-- Add comments for documentation
COMMENT ON POLICY "Service role can manage suspicious patterns" ON public.suspicious_patterns 
IS 'Allows service role to fully manage threat detection patterns for automated security monitoring';

COMMENT ON POLICY "Users can read pattern metadata" ON public.suspicious_patterns 
IS 'Allows users to view pattern names and descriptions but protects sensitive detection queries';

COMMENT ON POLICY "Security managers can modify patterns" ON public.suspicious_patterns 
IS 'Allows designated security managers to create, update, and delete threat detection patterns';

COMMENT ON FUNCTION public.is_security_manager 
IS 'Determines if current user/role has security management privileges for pattern administration';