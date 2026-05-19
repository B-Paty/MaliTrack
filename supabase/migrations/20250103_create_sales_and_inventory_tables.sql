-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sale_number TEXT NOT NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'credit', 'bank_transfer')),
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_unit TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_movements table
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('sale', 'purchase', 'adjustment', 'return')),
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(15,2),
  total_value DECIMAL(15,2),
  reference_id UUID, -- Links to sale_id, purchase_id, etc.
  reference_type TEXT, -- 'sale', 'purchase', 'adjustment', etc.
  notes TEXT,
  movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_levels table
CREATE TABLE IF NOT EXISTS inventory_levels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_unit TEXT NOT NULL,
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  reserved_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  available_stock DECIMAL(10,2) GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
  last_movement_date DATE,
  last_movement_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on all tables
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_levels ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sales
CREATE POLICY "Users can view their own sales" ON sales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales" ON sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales" ON sales
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales" ON sales
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for sale_items
CREATE POLICY "Users can view their own sale items" ON sale_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own sale items" ON sale_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own sale items" ON sale_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own sale items" ON sale_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND sales.user_id = auth.uid()
    )
  );

-- Create RLS policies for inventory_movements
CREATE POLICY "Users can view their own inventory movements" ON inventory_movements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory movements" ON inventory_movements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory movements" ON inventory_movements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory movements" ON inventory_movements
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for inventory_levels
CREATE POLICY "Users can view their own inventory levels" ON inventory_levels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory levels" ON inventory_levels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory levels" ON inventory_levels
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory levels" ON inventory_levels
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_user_id ON inventory_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_levels_user_id ON inventory_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_levels_product_id ON inventory_levels(product_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_inventory_levels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_updated_at();

CREATE TRIGGER update_inventory_levels_updated_at
  BEFORE UPDATE ON inventory_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_levels_updated_at();

-- Create function to generate sale numbers
CREATE OR REPLACE FUNCTION generate_sale_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  month_part TEXT;
  sequence_num INTEGER;
  sale_number TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  month_part := LPAD(EXTRACT(MONTH FROM CURRENT_DATE)::TEXT, 2, '0');
  
  -- Get the next sequence number for this month
  SELECT COALESCE(MAX(CAST(SUBSTRING(sale_number FROM 8) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM sales
  WHERE sale_number LIKE 'SALE-' || year_part || month_part || '-%';
  
  sale_number := 'SALE-' || year_part || month_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN sale_number;
END;
$$ LANGUAGE plpgsql;
