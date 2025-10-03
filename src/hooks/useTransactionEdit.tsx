/**
 * useTransactionEdit
 * Hook to handle transaction editing and corrections
 */
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Transaction, TransactionLine } from '@/hooks/useTransactions';

export function useTransactionEdit() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const editTransaction = async (
    transactionId: string,
    updates: {
      transaction_date?: string;
      description?: string;
      lines?: TransactionLine[];
    }
  ) => {
    try {
      setLoading(true);

      // Validate balance if lines are being updated
      if (updates.lines) {
        const totalDebits = updates.lines.reduce((sum, line) => sum + line.debit_amount, 0);
        const totalCredits = updates.lines.reduce((sum, line) => sum + line.credit_amount, 0);
        
        if (Math.abs(totalDebits - totalCredits) > 0.01) {
          throw new Error('Total debits must equal total credits');
        }
      }

      // Get current edit count
      const { data: currentTx } = await supabase
        .from('transactions')
        .select('edit_count')
        .eq('id', transactionId)
        .single();

      // Update transaction header
      if (updates.transaction_date || updates.description) {
        const { error: txError } = await supabase
          .from('transactions')
          .update({
            ...(updates.transaction_date && { transaction_date: updates.transaction_date }),
            ...(updates.description && { description: updates.description }),
            edited_at: new Date().toISOString(),
            edit_count: (currentTx?.edit_count || 0) + 1,
          })
          .eq('id', transactionId);

        if (txError) throw txError;
      }

      // Update transaction lines if provided
      if (updates.lines) {
        // Delete existing lines
        const { error: deleteError } = await supabase
          .from('transaction_lines')
          .delete()
          .eq('transaction_id', transactionId);

        if (deleteError) throw deleteError;

        // Insert new lines
        const linesWithTransactionId = updates.lines.map(line => ({
          transaction_id: transactionId,
          account_code: line.account_code,
          debit_amount: line.debit_amount,
          credit_amount: line.credit_amount,
        }));

        const { error: insertError } = await supabase
          .from('transaction_lines')
          .insert(linesWithTransactionId);

        if (insertError) throw insertError;
      }

      toast({
        title: 'Success',
        description: 'Transaction updated successfully',
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit transaction';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    editTransaction,
    loading,
  };
}
