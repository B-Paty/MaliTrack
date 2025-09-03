-- Create major_clients table for client management
CREATE TABLE public.major_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  client_contact_person TEXT,
  client_tax_id TEXT,
  credit_limit DECIMAL(15,2) DEFAULT 0.00,
  current_balance DECIMAL(15,2) DEFAULT 0.00,
  payment_terms INTEGER DEFAULT 30, -- days
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.major_clients ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own major clients" 
ON public.major_clients 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own major clients" 
ON public.major_clients 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own major clients" 
ON public.major_clients 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own major clients" 
ON public.major_clients 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create client_transactions table for tracking client-specific transactions
CREATE TABLE public.client_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.major_clients(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_number TEXT NOT NULL,
  description TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('invoice', 'payment', 'adjustment', 'credit_note')),
  amount DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  invoice_id TEXT, -- Reference to invoice if applicable
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.client_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for client transactions
CREATE POLICY "Users can view their own client transactions" 
ON public.client_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own client transactions" 
ON public.client_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client transactions" 
ON public.client_transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client transactions" 
ON public.client_transactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_major_clients_updated_at
BEFORE UPDATE ON public.major_clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_transactions_updated_at
BEFORE UPDATE ON public.client_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_major_clients_user_id ON public.major_clients(user_id);
CREATE INDEX idx_major_clients_active ON public.major_clients(user_id, is_active);
CREATE INDEX idx_client_transactions_user_id ON public.client_transactions(user_id);
CREATE INDEX idx_client_transactions_client_id ON public.client_transactions(client_id);
CREATE INDEX idx_client_transactions_date ON public.client_transactions(user_id, transaction_date DESC);