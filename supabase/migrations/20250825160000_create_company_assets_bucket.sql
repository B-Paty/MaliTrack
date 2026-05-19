-- Create company assets storage bucket for logos and branding
-- This migration creates a storage bucket for company assets like logos

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-assets',
  'company-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
);

-- Create RLS policies for the bucket
CREATE POLICY "Authenticated users can upload company assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'company-assets' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can view company assets" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'company-assets' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own company assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'company-assets' AND
    auth.role() = 'authenticated' AND
    owner = auth.uid()
  );

CREATE POLICY "Users can delete their own company assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'company-assets' AND
    auth.role() = 'authenticated' AND
    owner = auth.uid()
  );
