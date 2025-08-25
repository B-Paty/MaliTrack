/**
 * useTransactions
 * Reads and writes accounting transactions with lines from Supabase.
 * - Fetches transactions with joined lines and account names
 * - Validates that debits equal credits when creating
 * - Generates reference numbers using DB RPC
 *
 * Returns:
 * - transactions: Transaction[]
 * - loading, error flags
 * - fetchTransactions(): Promise<void>
 * - createTransaction(tx): Promise<Transaction>
 * - deleteTransaction(id): Promise<void>
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';

export interface TransactionLine {
  id?: string;
  account_code: string;
  account_name?: string;
  debit_amount: number;
  credit_amount: number;
}

export interface Transaction {
  id?: string;
  reference_number?: string;
  transaction_date: string;
  description: string;
  lines: TransactionLine[];
  created_at?: string;
  updated_at?: string;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: transactionsData, error: fetchError } = await supabase
        .from('transactions')
        .select(`
          *,
          transaction_lines (
            *,
            chart_of_accounts!inner (
              account_name
            )
          )
        `)
        .order('transaction_date', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const formattedTransactions = transactionsData?.map(transaction => ({
        ...transaction,
        lines: transaction.transaction_lines.map((line: any) => ({
          ...line,
          account_name: line.chart_of_accounts?.account_name || 'Unknown Account',
        })),
      })) || [];

      setTransactions(formattedTransactions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transactionData: Transaction) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to create transactions');
      }

      // Validate that debits equal credits
      const totalDebits = transactionData.lines.reduce((sum, line) => sum + line.debit_amount, 0);
      const totalCredits = transactionData.lines.reduce((sum, line) => sum + line.credit_amount, 0);
      
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        throw new Error('Total debits must equal total credits');
      }

      // Generate reference number
      const { data: refNumber, error: refError } = await supabase
        .rpc('generate_reference_number');

      if (refError) throw refError;

      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          reference_number: refNumber,
          transaction_date: transactionData.transaction_date,
          description: transactionData.description,
          user_id: user.id,
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create transaction lines
      const linesWithTransactionId = transactionData.lines.map(line => ({
        transaction_id: transaction.id,
        account_code: line.account_code,
        debit_amount: line.debit_amount,
        credit_amount: line.credit_amount,
      }));

      const { error: linesError } = await supabase
        .from('transaction_lines')
        .insert(linesWithTransactionId);

      if (linesError) throw linesError;

      toast({
        title: 'Success',
        description: `Transaction ${refNumber} created successfully`,
      });

      await fetchTransactions(); // Refresh the list
      return transaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create transaction';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      throw err;
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete transaction';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    createTransaction,
    deleteTransaction,
  };
}