-- Add tables for period closings and COGS tracking

-- Table to track accounting period closings
CREATE TABLE IF NOT EXISTS public.period_closings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  closing_date DATE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  net_income NUMERIC(15,2) NOT NULL DEFAULT 0,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  closed_by UUID,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_end, period_type)
);

-- RLS policies for period_closings
ALTER TABLE public.period_closings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own period closings"
  ON public.period_closings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own period closings"
  ON public.period_closings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own period closings"
  ON public.period_closings FOR UPDATE
  USING (auth.uid() = user_id);

-- Add inventory costing method to inventory_levels
ALTER TABLE public.inventory_levels 
ADD COLUMN IF NOT EXISTS costing_method TEXT DEFAULT 'FIFO' CHECK (costing_method IN ('FIFO', 'WEIGHTED_AVERAGE'));

-- Create table for tracking inventory layers (for FIFO)
CREATE TABLE IF NOT EXISTS public.inventory_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  quantity_remaining NUMERIC(15,2) NOT NULL DEFAULT 0,
  unit_cost NUMERIC(15,2) NOT NULL,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies for inventory_layers
ALTER TABLE public.inventory_layers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inventory layers"
  ON public.inventory_layers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own inventory layers"
  ON public.inventory_layers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to calculate FIFO COGS
CREATE OR REPLACE FUNCTION public.calculate_fifo_cogs(
  p_user_id UUID,
  p_product_id TEXT,
  p_quantity NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  v_remaining NUMERIC := p_quantity;
  v_total_cogs NUMERIC := 0;
  v_layer RECORD;
BEGIN
  -- Process layers in FIFO order (oldest first)
  FOR v_layer IN 
    SELECT * FROM public.inventory_layers
    WHERE user_id = p_user_id 
      AND product_id = p_product_id 
      AND quantity_remaining > 0
    ORDER BY purchase_date ASC, created_at ASC
  LOOP
    IF v_remaining <= 0 THEN
      EXIT;
    END IF;
    
    -- Take from this layer
    DECLARE
      v_qty_from_layer NUMERIC;
    BEGIN
      v_qty_from_layer := LEAST(v_layer.quantity_remaining, v_remaining);
      v_total_cogs := v_total_cogs + (v_qty_from_layer * v_layer.unit_cost);
      v_remaining := v_remaining - v_qty_from_layer;
      
      -- Update layer
      UPDATE public.inventory_layers
      SET quantity_remaining = quantity_remaining - v_qty_from_layer,
          updated_at = NOW()
      WHERE id = v_layer.id;
    END;
  END LOOP;
  
  RETURN v_total_cogs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add transaction edit history tracking
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_layers_product ON public.inventory_layers(user_id, product_id, purchase_date);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_period_closings_date ON public.period_closings(user_id, period_end);