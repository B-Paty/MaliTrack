-- Fix "Remaining debt for 200kg of rice" transaction
-- Change from Bank Account (1020) to Accounts Payable (2010)
-- This will give us 26kg of rice inventory

-- Update transaction lines where description contains "Remaining debt" and "rice"
-- and the account is Bank Account (1020) to change it to Accounts Payable (2010)
UPDATE public.transaction_lines 
SET account_code = '2010'  -- Accounts Payable
WHERE account_code = '1020'  -- Bank Account
AND transaction_id IN (
  SELECT t.id 
  FROM public.transactions t 
  WHERE t.description ILIKE '%remaining debt%' 
  AND t.description ILIKE '%rice%'
);

-- Update the transaction description to reflect the change
UPDATE public.transactions 
SET description = REPLACE(description, 'Bank Account', 'Accounts Payable')
WHERE description ILIKE '%remaining debt%' 
AND description ILIKE '%rice%';

-- Update account balances to reflect the change
-- Decrease Bank Account balance by 200,000
UPDATE public.chart_of_accounts 
SET current_balance = current_balance - 200000.00
WHERE account_code = '1020' AND current_balance >= 200000.00;

-- Increase Accounts Payable balance by 200,000
UPDATE public.chart_of_accounts 
SET current_balance = current_balance + 200000.00
WHERE account_code = '2010';

-- Update Inventory balance to reflect 26kg of rice
-- Assuming rice costs 2,600 per kg, 26kg = 67,600
UPDATE public.chart_of_accounts 
SET current_balance = 67600.00
WHERE account_code = '1040' AND account_name = 'Inventory';

-- Add comment for documentation
COMMENT ON TABLE public.transaction_lines IS 'Updated rice debt transaction from Bank Account to Accounts Payable for proper accounting treatment';
