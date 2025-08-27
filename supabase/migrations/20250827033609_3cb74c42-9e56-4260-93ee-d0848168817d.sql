-- Enable leaked password protection for better security
-- This helps prevent users from using commonly leaked passwords

-- Update auth configuration to enable password protection
UPDATE auth.config 
SET password_checks = jsonb_build_object(
  'leaked_password_protection', true,
  'password_strength', true
)
WHERE true;

-- If the config doesn't exist, insert it
INSERT INTO auth.config (password_checks)
SELECT jsonb_build_object(
  'leaked_password_protection', true,
  'password_strength', true
)
WHERE NOT EXISTS (SELECT 1 FROM auth.config);