-- Fix search_path security issues for functions
DROP FUNCTION IF EXISTS public.log_data_access(text, text, text, integer);
DROP FUNCTION IF EXISTS public.detect_data_leaks();

-- Recreate log_data_access function with secure search_path
CREATE OR REPLACE FUNCTION public.log_data_access(p_table_name text, p_operation text, p_record_id text DEFAULT NULL::text, p_record_count integer DEFAULT 1)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
    v_user_id UUID;
    v_risk_score INTEGER := 0;
    v_suspicious_flags JSONB := '{}';
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    
    -- Skip logging if no authenticated user (system operations)
    IF v_user_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Calculate risk score based on patterns
    IF p_record_count > 100 THEN
        v_risk_score := v_risk_score + 30;
        v_suspicious_flags := v_suspicious_flags || '{"high_volume": true}';
    END IF;
    
    -- Check for rapid successive access
    IF EXISTS (
        SELECT 1 FROM public.audit_logs 
        WHERE user_id = v_user_id 
        AND table_name = p_table_name 
        AND accessed_at > NOW() - INTERVAL '1 minute'
        AND operation = p_operation
    ) THEN
        v_risk_score := v_risk_score + 20;
        v_suspicious_flags := v_suspicious_flags || '{"rapid_access": true}';
    END IF;
    
    -- Check for unusual time access
    IF EXTRACT(HOUR FROM NOW()) < 6 OR EXTRACT(HOUR FROM NOW()) > 22 THEN
        v_risk_score := v_risk_score + 15;
        v_suspicious_flags := v_suspicious_flags || '{"unusual_time": true}';
    END IF;
    
    -- Insert audit log
    INSERT INTO public.audit_logs (
        user_id, 
        table_name, 
        operation, 
        record_id, 
        record_count,
        risk_score,
        suspicious_flags
    ) VALUES (
        v_user_id, 
        p_table_name, 
        p_operation, 
        p_record_id, 
        p_record_count,
        v_risk_score,
        v_suspicious_flags
    );
    
    -- Create alert for high-risk activities
    IF v_risk_score >= 50 THEN
        INSERT INTO public.leak_alerts (
            user_id,
            alert_type,
            severity,
            title,
            description,
            metadata
        ) VALUES (
            v_user_id,
            'SUSPICIOUS_ACCESS',
            CASE 
                WHEN v_risk_score >= 80 THEN 'CRITICAL'
                WHEN v_risk_score >= 65 THEN 'HIGH'
                ELSE 'MEDIUM'
            END,
            'Suspicious Data Access Detected',
            format('Unusual %s operation on %s with risk score %s', p_operation, p_table_name, v_risk_score),
            jsonb_build_object(
                'table_name', p_table_name,
                'operation', p_operation,
                'risk_score', v_risk_score,
                'flags', v_suspicious_flags
            )
        );
    END IF;
END;
$function$;

-- Recreate detect_data_leaks function with secure search_path
CREATE OR REPLACE FUNCTION public.detect_data_leaks()
 RETURNS TABLE(alert_id uuid, user_email text, leak_type text, severity text, description text, detected_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    RETURN QUERY
    WITH recent_activity AS (
        SELECT 
            al.user_id,
            au.email,
            al.table_name,
            al.operation,
            COUNT(*) as access_count,
            MAX(al.risk_score) as max_risk_score,
            MAX(al.accessed_at) as last_access
        FROM public.audit_logs al
        JOIN auth.users au ON al.user_id = au.id
        WHERE al.accessed_at > NOW() - INTERVAL '1 hour'
        GROUP BY al.user_id, au.email, al.table_name, al.operation
    ),
    potential_leaks AS (
        SELECT 
            gen_random_uuid() as alert_id,
            ra.user_email,
            CASE 
                WHEN ra.access_count > 500 THEN 'MASS_DATA_EXPORT'
                WHEN ra.max_risk_score > 80 THEN 'HIGH_RISK_ACCESS'
                WHEN ra.access_count > 100 AND ra.operation = 'SELECT' THEN 'BULK_DATA_ACCESS'
                ELSE 'SUSPICIOUS_PATTERN'
            END as leak_type,
            CASE 
                WHEN ra.access_count > 500 OR ra.max_risk_score > 80 THEN 'CRITICAL'
                WHEN ra.access_count > 100 OR ra.max_risk_score > 50 THEN 'HIGH'
                ELSE 'MEDIUM'
            END as severity,
            format('User accessed %s table %s times in 1 hour (max risk: %s)', 
                   ra.table_name, ra.access_count, ra.max_risk_score) as description,
            ra.last_access as detected_at
        FROM recent_activity ra
        WHERE ra.access_count > 50 OR ra.max_risk_score > 40
    )
    SELECT * FROM potential_leaks;
END;
$function$;

-- Restrict access to suspicious_patterns table to system only
DROP POLICY IF EXISTS "Authenticated users can read suspicious patterns" ON public.suspicious_patterns;

-- Create admin-only access to suspicious patterns
CREATE POLICY "System access only for suspicious patterns" 
ON public.suspicious_patterns 
FOR ALL 
USING (false); -- No user access by default

-- Create security admin role check function
CREATE OR REPLACE FUNCTION public.is_security_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only allow system operations or specific admin users
  SELECT COALESCE(
    current_setting('role', true) = 'service_role',
    false
  );
$$;