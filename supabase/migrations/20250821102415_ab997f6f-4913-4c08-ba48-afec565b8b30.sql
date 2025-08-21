-- Create company settings table
CREATE TABLE public.company_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL DEFAULT 'QSA Solutions',
    logo_filename TEXT,
    logo_path TEXT,
    primary_color TEXT NOT NULL DEFAULT '#a1052d',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chart of accounts table
CREATE TABLE public.chart_of_accounts (
    account_code TEXT NOT NULL PRIMARY KEY,
    account_name TEXT NOT NULL,
    category TEXT NOT NULL,
    current_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    normal_balance TEXT NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_number TEXT NOT NULL UNIQUE,
    transaction_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transaction lines table
CREATE TABLE public.transaction_lines (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    account_code TEXT NOT NULL REFERENCES public.chart_of_accounts(account_code),
    debit_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    credit_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CHECK (debit_amount >= 0 AND credit_amount >= 0),
    CHECK ((debit_amount > 0 AND credit_amount = 0) OR (debit_amount = 0 AND credit_amount > 0))
);

-- Enable Row Level Security
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_lines ENABLE ROW LEVEL SECURITY;

-- Create policies (public access for now since no auth is implemented)
CREATE POLICY "Allow public access to company settings" 
ON public.company_settings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to chart of accounts" 
ON public.chart_of_accounts FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to transactions" 
ON public.transactions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to transaction lines" 
ON public.transaction_lines FOR ALL USING (true) WITH CHECK (true);

-- Insert default company settings
INSERT INTO public.company_settings (company_name, primary_color) 
VALUES ('QSA Solutions', '#a1052d');

-- Insert chart of accounts data
INSERT INTO public.chart_of_accounts (account_code, account_name, category, current_balance, normal_balance) VALUES
('1010', 'Cash in Hand', 'Current Asset', 15000.00, 'debit'),
('1020', 'Bank Account', 'Current Asset', 125000.00, 'debit'),
('1030', 'Accounts Receivable', 'Current Asset', 45000.00, 'debit'),
('1040', 'Inventory', 'Current Asset', 30000.00, 'debit'),
('1050', 'Prepaid Expenses', 'Current Asset', 8000.00, 'debit'),
('1200', 'Office Equipment', 'Fixed Asset', 25000.00, 'debit'),
('1210', 'Vehicles', 'Fixed Asset', 75000.00, 'debit'),
('1220', 'Furniture & Fixtures', 'Fixed Asset', 18000.00, 'debit'),
('1230', 'Computers & IT Equipment', 'Fixed Asset', 35000.00, 'debit'),
('1290', 'Accumulated Depreciation', 'Contra-Asset', 15000.00, 'credit'),
('2010', 'Accounts Payable', 'Current Liability', 22000.00, 'credit'),
('2020', 'Salaries Payable', 'Current Liability', 8500.00, 'credit'),
('2030', 'Taxes Payable (VAT, PAYE)', 'Current Liability', 12000.00, 'credit'),
('2040', 'Short-term Loan', 'Current Liability', 25000.00, 'credit'),
('2100', 'Bank Loan (Long-term)', 'Long-term Liability', 150000.00, 'credit'),
('3010', 'Owner''s Capital', 'Equity', 200000.00, 'credit'),
('3020', 'Additional Paid-in Capital', 'Equity', 50000.00, 'credit'),
('3030', 'Retained Earnings', 'Equity', 45000.00, 'credit'),
('3040', 'Dividends Paid', 'Equity', 15000.00, 'debit'),
('4010', 'Sales Revenue', 'Revenue', 285000.00, 'credit'),
('4020', 'Service Revenue', 'Revenue', 125000.00, 'credit'),
('4030', 'Other Income (Interest, etc.)', 'Revenue', 8500.00, 'credit'),
('5010', 'Cost of Goods Sold', 'Expense', 145000.00, 'debit'),
('5020', 'Salaries & Wages', 'Expense', 85000.00, 'debit'),
('5030', 'Rent Expense', 'Expense', 24000.00, 'debit'),
('5040', 'Utilities (Water, Power, Internet)', 'Expense', 15000.00, 'debit'),
('5050', 'Marketing & Advertising', 'Expense', 18000.00, 'debit'),
('5060', 'Transport & Delivery', 'Expense', 12000.00, 'debit'),
('5070', 'Repairs & Maintenance', 'Expense', 8500.00, 'debit'),
('5080', 'Office Supplies', 'Expense', 6000.00, 'debit'),
('5090', 'Insurance Expense', 'Expense', 9500.00, 'debit'),
('5100', 'Bank Charges & Interest', 'Expense', 3500.00, 'debit'),
('5110', 'Depreciation Expense', 'Expense', 15000.00, 'debit');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_company_settings_updated_at
    BEFORE UPDATE ON public.company_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chart_of_accounts_updated_at
    BEFORE UPDATE ON public.chart_of_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update account balances when transaction lines change
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for account balance updates
CREATE TRIGGER update_account_balance_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.transaction_lines
    FOR EACH ROW
    EXECUTE FUNCTION public.update_account_balance();

-- Create function to generate reference numbers
CREATE OR REPLACE FUNCTION public.generate_reference_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;