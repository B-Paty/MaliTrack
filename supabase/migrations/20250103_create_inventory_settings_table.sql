-- Create inventory_settings table
CREATE TABLE IF NOT EXISTS inventory_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory_type TEXT NOT NULL CHECK (inventory_type IN ('single', 'multiple')),
  products JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE inventory_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own inventory settings" ON inventory_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory settings" ON inventory_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory settings" ON inventory_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory settings" ON inventory_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_settings_user_id ON inventory_settings(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_inventory_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_inventory_settings_updated_at
  BEFORE UPDATE ON inventory_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_settings_updated_at();
