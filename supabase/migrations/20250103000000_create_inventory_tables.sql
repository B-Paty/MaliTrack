-- Create inventory management tables
-- This migration creates tables for automated inventory management system

-- Add inventory settings to company_settings table
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS inventory_type TEXT DEFAULT 'single' CHECK (inventory_type IN ('single', 'multiple')),
ADD COLUMN IF NOT EXISTS inventory_products JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sales_module_enabled BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.company_settings.inventory_type IS 'Type of inventory system: single (one product) or multiple (multiple products)';
COMMENT ON COLUMN public.company_settings.inventory_products IS 'JSON array of product configurations for multiple inventory system';
COMMENT ON COLUMN public.company_settings.sales_module_enabled IS 'Whether sales module integration is enabled for multiple inventory';

-- Create inventory_products table
CREATE TABLE IF NOT EXISTS public.inventory_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit_of_measure TEXT NOT NULL,
  cost_per_unit DECIMAL(15,2) NOT NULL DEFAULT 0,
  selling_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  current_stock DECIMAL(15,2) NOT NULL DEFAULT 0,
  minimum_stock DECIMAL(15,2) NOT NULL DEFAULT 0,
  maximum_stock DECIMAL(15,2) NOT NULL DEFAULT 0,
  inventory_account_code TEXT NOT NULL,
  cogs_account_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create inventory_transactions table
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.inventory_products(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'purchase', 'adjustment')),
  quantity DECIMAL(15,2) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  reference_number TEXT,
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create inventory_reports table (for caching reports)
CREATE TABLE IF NOT EXISTS public.inventory_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.inventory_products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  opening_stock DECIMAL(15,2) NOT NULL DEFAULT 0,
  purchases DECIMAL(15,2) NOT NULL DEFAULT 0,
  sales DECIMAL(15,2) NOT NULL DEFAULT 0,
  adjustments DECIMAL(15,2) NOT NULL DEFAULT 0,
  closing_stock DECIMAL(15,2) NOT NULL DEFAULT 0,
  stock_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  cogs_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  report_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create low_stock_alerts table
CREATE TABLE IF NOT EXISTS public.low_stock_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.inventory_products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  current_stock DECIMAL(15,2) NOT NULL,
  minimum_stock DECIMAL(15,2) NOT NULL,
  days_remaining INTEGER NOT NULL DEFAULT 0,
  alert_level TEXT NOT NULL CHECK (alert_level IN ('low', 'critical', 'out_of_stock')),
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_products_user_id ON public.inventory_products(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_products_category ON public.inventory_products(category);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_user_id ON public.inventory_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_id ON public.inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON public.inventory_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_inventory_reports_user_id ON public.inventory_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reports_date ON public.inventory_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_user_id ON public.low_stock_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_resolved ON public.low_stock_alerts(is_resolved);

-- Enable Row Level Security (RLS)
ALTER TABLE public.inventory_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.low_stock_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory_products
CREATE POLICY "Users can view their own inventory products" ON public.inventory_products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory products" ON public.inventory_products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory products" ON public.inventory_products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory products" ON public.inventory_products
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for inventory_transactions
CREATE POLICY "Users can view their own inventory transactions" ON public.inventory_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory transactions" ON public.inventory_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory transactions" ON public.inventory_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory transactions" ON public.inventory_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for inventory_reports
CREATE POLICY "Users can view their own inventory reports" ON public.inventory_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory reports" ON public.inventory_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory reports" ON public.inventory_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory reports" ON public.inventory_reports
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for low_stock_alerts
CREATE POLICY "Users can view their own low stock alerts" ON public.low_stock_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own low stock alerts" ON public.low_stock_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own low stock alerts" ON public.low_stock_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own low stock alerts" ON public.low_stock_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_inventory_products_updated_at 
  BEFORE UPDATE ON public.inventory_products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update stock levels
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update stock based on transaction type
    IF NEW.transaction_type = 'sale' THEN
      UPDATE public.inventory_products 
      SET current_stock = current_stock - NEW.quantity,
          updated_at = NOW()
      WHERE id = NEW.product_id;
    ELSIF NEW.transaction_type = 'purchase' THEN
      UPDATE public.inventory_products 
      SET current_stock = current_stock + NEW.quantity,
          updated_at = NOW()
      WHERE id = NEW.product_id;
    ELSIF NEW.transaction_type = 'adjustment' THEN
      UPDATE public.inventory_products 
      SET current_stock = current_stock + NEW.quantity,
          updated_at = NOW()
      WHERE id = NEW.product_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle updates by reversing old transaction and applying new one
    IF OLD.transaction_type = 'sale' THEN
      UPDATE public.inventory_products 
      SET current_stock = current_stock + OLD.quantity,
          updated_at = NOW()
      WHERE id = OLD.product_id;
    ELSIF OLD.transaction_type = 'purchase' THEN
      UPDATE public.inventory_products 
      SET current_stock = current_stock - OLD.quantity,
          updated_at = NOW()
      WHERE id = OLD.product_id;
    ELSIF OLD.transaction_type = 'adjustment' THEN
      UPDATE public.inventory_products 
      SET current_stock = current_stock - OLD.quantity,
          updated_at = NOW()
      WHERE id = OLD.product_id;
    END IF;
    
    -- Apply new transaction
    IF NEW.transaction_type = 'sale' THEN
      UPDATE public.inventory_products 
      SET current_stock = current_stock - NEW.quantity,
          updated_at = NOW()
      WHERE id = NEW.product_id;
    ELSIF NEW.transaction_type = 'purchase' THEN
      UPDATE public.inventory_products 
      SET current_stock = current_stock + NEW.quantity,
          updated_at = NOW()
      WHERE id = NEW.product_id;
    ELSIF NEW.transaction_type = 'adjustment' THEN
      UPDATE public.inventory_products 
      SET current_stock = current_stock + NEW.quantity,
          updated_at = NOW()
      WHERE id = NEW.product_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Reverse the transaction
    IF OLD.transaction_type = 'sale' THEN
      UPDATE public.inventory_products 
      SET current_stock = current_stock + OLD.quantity,
          updated_at = NOW()
      WHERE id = OLD.product_id;
    ELSIF OLD.transaction_type = 'purchase' THEN
      UPDATE public.inventory_products 
      SET current_stock = current_stock - OLD.quantity,
          updated_at = NOW()
      WHERE id = OLD.product_id;
    ELSIF OLD.transaction_type = 'adjustment' THEN
      UPDATE public.inventory_products 
      SET current_stock = current_stock - OLD.quantity,
          updated_at = NOW()
      WHERE id = OLD.product_id;
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic stock updates
CREATE TRIGGER inventory_stock_update_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.inventory_transactions
  FOR EACH ROW EXECUTE FUNCTION update_inventory_stock();

-- Create function to generate low stock alerts
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
DECLARE
  alert_level TEXT;
BEGIN
  -- Determine alert level
  IF NEW.current_stock <= 0 THEN
    alert_level := 'out_of_stock';
  ELSIF NEW.current_stock <= NEW.minimum_stock THEN
    alert_level := 'low';
  ELSE
    alert_level := 'critical';
  END IF;
  
  -- Only create alert if stock is low or out
  IF alert_level IN ('low', 'critical', 'out_of_stock') THEN
    INSERT INTO public.low_stock_alerts (
      product_id,
      product_name,
      current_stock,
      minimum_stock,
      days_remaining,
      alert_level,
      user_id
    ) VALUES (
      NEW.id,
      NEW.name,
      NEW.current_stock,
      NEW.minimum_stock,
      CASE 
        WHEN NEW.current_stock <= 0 THEN 0
        ELSE GREATEST(1, CEIL((NEW.minimum_stock - NEW.current_stock) / GREATEST(NEW.current_stock, 1)))
      END,
      alert_level,
      NEW.user_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for low stock alerts
CREATE TRIGGER low_stock_alert_trigger
  AFTER INSERT OR UPDATE ON public.inventory_products
  FOR EACH ROW EXECUTE FUNCTION check_low_stock();

-- Update existing company_settings records to have default single inventory
UPDATE public.company_settings 
SET inventory_type = 'single', sales_module_enabled = false 
WHERE inventory_type IS NULL;
