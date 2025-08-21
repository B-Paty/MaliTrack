-- Fix security warnings by setting secure search paths for functions

-- Update the update_updated_at_column function with secure search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Update the update_account_balance function with secure search path
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    account_normal_balance TEXT;
    balance_change DECIMAL(15,2);
BEGIN
    -- Get the normal balance for the account
    SELECT normal_balance INTO account_normal_balance
    FROM public.chart_of_accounts
    WHERE account_code = COALESCE(NEW.account_code, OLD.account_code);

    IF TG_OP = 'INSERT' THEN
        -- Calculate balance change based on normal balance type
        IF account_normal_balance = 'debit' THEN
            balance_change = NEW.debit_amount - NEW.credit_amount;
        ELSE
            balance_change = NEW.credit_amount - NEW.debit_amount;
        END IF;
        
        -- Update account balance
        UPDATE public.chart_of_accounts
        SET current_balance = current_balance + balance_change
        WHERE account_code = NEW.account_code;
        
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Reverse old balance change
        IF account_normal_balance = 'debit' THEN
            balance_change = -(OLD.debit_amount - OLD.credit_amount);
        ELSE
            balance_change = -(OLD.credit_amount - OLD.debit_amount);
        END IF;
        
        UPDATE public.chart_of_accounts
        SET current_balance = current_balance + balance_change
        WHERE account_code = OLD.account_code;
        
        -- Apply new balance change
        IF account_normal_balance = 'debit' THEN
            balance_change = NEW.debit_amount - NEW.credit_amount;
        ELSE
            balance_change = NEW.credit_amount - NEW.debit_amount;
        END IF;
        
        UPDATE public.chart_of_accounts
        SET current_balance = current_balance + balance_change
        WHERE account_code = NEW.account_code;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Reverse balance change
        IF account_normal_balance = 'debit' THEN
            balance_change = -(OLD.debit_amount - OLD.credit_amount);
        ELSE
            balance_change = -(OLD.credit_amount - OLD.debit_amount);
        END IF;
        
        UPDATE public.chart_of_accounts
        SET current_balance = current_balance + balance_change
        WHERE account_code = OLD.account_code;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Update the generate_reference_number function with secure search path
CREATE OR REPLACE FUNCTION public.generate_reference_number()
RETURNS TEXT 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    year_suffix TEXT;
    next_number INTEGER;
BEGIN
    -- Get current year
    year_suffix := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Get next sequential number for this year
    SELECT COALESCE(MAX(
        CASE 
            WHEN reference_number ~ ('^REF-' || year_suffix || '-[0-9]+$')
            THEN (regexp_match(reference_number, '^REF-' || year_suffix || '-([0-9]+)$'))[1]::INTEGER
            ELSE 0
        END
    ), 0) + 1 INTO next_number
    FROM public.transactions;
    
    RETURN 'REF-' || year_suffix || '-' || LPAD(next_number::TEXT, 4, '0');
END;
$$;