import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClientTransaction {
  id: string;
  user_id: string;
  client_id: string;
  transaction_date: string;
  reference_number: string;
  description?: string;
  transaction_type: 'invoice' | 'payment' | 'adjustment' | 'credit_note';
  amount: number;
  balance_after: number;
  invoice_id?: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientTransactionData {
  client_id: string;
  transaction_date?: string;
  reference_number: string;
  description?: string;
  transaction_type: 'invoice' | 'payment' | 'adjustment' | 'credit_note';
  amount: number;
  balance_after: number;
  invoice_id?: string;
  payment_method?: string;
  notes?: string;
}

export function useClientTransactions() {
  const [transactions, setTransactions] = useState<ClientTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setTransactions((data || []) as ClientTransaction[]);
    } catch (error) {
      console.error('Error fetching client transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch client transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData: CreateClientTransactionData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('client_transactions')
        .insert([
          {
            ...transactionData,
            user_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setTransactions(prev => [data as ClientTransaction, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding client transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<CreateClientTransactionData>) => {
    try {
      const { data, error } = await supabase
        .from('client_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setTransactions(prev => prev.map(transaction => 
        transaction.id === id ? data as ClientTransaction : transaction
      ));
      return data;
    } catch (error) {
      console.error('Error updating client transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('client_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    } catch (error) {
      console.error('Error deleting client transaction:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
}