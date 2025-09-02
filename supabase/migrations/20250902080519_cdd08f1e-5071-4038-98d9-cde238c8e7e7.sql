-- Fix critical security vulnerability: Remove public access to security detection patterns
-- This prevents attackers from studying detection logic to evade security systems

-- Drop the overly permissive policy that exposes patterns to all users
DROP POLICY IF EXISTS "Users can read pattern metadata" ON public.suspicious_patterns;

-- Restrict read access to security managers and service role only
-- This ensures only authorized personnel can view detection patterns
CREATE POLICY "Security managers can read patterns"
ON public.suspicious_patterns
FOR SELECT
TO authenticated
USING (public.is_security_manager());

-- Ensure service role always has full access for automated security functions
-- (This policy already exists but let's make it explicit for security auditing)
DROP POLICY IF EXISTS "Service role can manage suspicious patterns" ON public.suspicious_patterns;
CREATE POLICY "Service role has full access to patterns"
ON public.suspicious_patterns
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Update the security manager function to be more restrictive
-- Only service role should be considered a security manager by default
CREATE OR REPLACE FUNCTION public.is_security_manager()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only service role has security management privileges
  -- In production, this could be extended to check specific user roles from a roles table
  RETURN current_setting('role', true) = 'service_role';
END;
$$;

-- Create a function that security monitoring can use to check patterns
-- This allows the system to function without exposing patterns to users
CREATE OR REPLACE FUNCTION public.get_active_pattern_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return count of active patterns for monitoring dashboard
  -- Without exposing the actual pattern details
  RETURN (SELECT COUNT(*) FROM public.suspicious_patterns WHERE is_active = true);
END;
$$;

-- Update comments for security documentation
COMMENT ON POLICY "Security managers can read patterns" ON public.suspicious_patterns 
IS 'SECURITY: Restricts read access to detection patterns to prevent attackers from studying evasion techniques';

COMMENT ON POLICY "Service role has full access to patterns" ON public.suspicious_patterns 
IS 'SECURITY: Allows automated security systems to manage threat detection patterns';

COMMENT ON FUNCTION public.is_security_manager 
IS 'SECURITY: Strict access control - only service role has security management privileges';

COMMENT ON FUNCTION public.get_active_pattern_count 
IS 'SECURITY: Safe function to get pattern count without exposing sensitive detection logic';