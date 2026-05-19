-- Enhance company_settings table with additional branding fields
-- This migration adds comprehensive branding support to the company_settings table

-- Add new branding columns to company_settings table
ALTER TABLE public.company_settings
ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7),
ADD COLUMN IF NOT EXISTS accent_color VARCHAR(7),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS logo_position VARCHAR(10) DEFAULT 'left',
ADD COLUMN IF NOT EXISTS logo_base64 TEXT;

-- Add check constraints for color values (hex format)
ALTER TABLE public.company_settings
ADD CONSTRAINT check_primary_color_format CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
ADD CONSTRAINT check_secondary_color_format CHECK (secondary_color IS NULL OR secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
ADD CONSTRAINT check_accent_color_format CHECK (accent_color IS NULL OR accent_color ~ '^#[0-9A-Fa-f]{6}$');

-- Add check constraint for logo position
ALTER TABLE public.company_settings
ADD CONSTRAINT check_logo_position CHECK (logo_position IN ('left', 'center', 'right'));

-- Add check constraint for email format
ALTER TABLE public.company_settings
ADD CONSTRAINT check_email_format CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add check constraint for website format
ALTER TABLE public.company_settings
ADD CONSTRAINT check_website_format CHECK (website IS NULL OR website ~ '^https?://');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_settings_user_id ON public.company_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_company_name ON public.company_settings(company_name);

-- Add comments for documentation
COMMENT ON COLUMN public.company_settings.secondary_color IS 'Secondary brand color in hex format (#RRGGBB)';
COMMENT ON COLUMN public.company_settings.accent_color IS 'Accent brand color in hex format (#RRGGBB)';
COMMENT ON COLUMN public.company_settings.address IS 'Company business address';
COMMENT ON COLUMN public.company_settings.phone IS 'Company phone number';
COMMENT ON COLUMN public.company_settings.email IS 'Company email address';
COMMENT ON COLUMN public.company_settings.website IS 'Company website URL';
COMMENT ON COLUMN public.company_settings.tax_id IS 'Tax identification number or business registration number';
COMMENT ON COLUMN public.company_settings.logo_position IS 'Logo alignment position (left, center, right)';
COMMENT ON COLUMN public.company_settings.logo_base64 IS 'Base64 encoded logo for embedding in exports';
