-- Add missing columns to company_settings table
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS secondary_color text,
ADD COLUMN IF NOT EXISTS accent_color text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS tax_id text,
ADD COLUMN IF NOT EXISTS logo_position text DEFAULT 'left',
ADD COLUMN IF NOT EXISTS payment_settings jsonb,
ADD COLUMN IF NOT EXISTS logo_base64 text;