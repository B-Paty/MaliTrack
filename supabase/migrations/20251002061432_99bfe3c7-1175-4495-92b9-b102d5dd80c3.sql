-- Create function to generate sale numbers
CREATE OR REPLACE FUNCTION public.generate_sale_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    year_suffix TEXT;
    next_number INTEGER;
BEGIN
    -- Get current year
    year_suffix := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Get next sequential number for this year
    SELECT COALESCE(MAX(
        CASE 
            WHEN sale_number ~ ('^SALE-' || year_suffix || '-[0-9]+$')
            THEN (regexp_match(sale_number, '^SALE-' || year_suffix || '-([0-9]+)$'))[1]::INTEGER
            ELSE 0
        END
    ), 0) + 1 INTO next_number
    FROM public.sales;
    
    RETURN 'SALE-' || year_suffix || '-' || LPAD(next_number::TEXT, 4, '0');
END;
$$;