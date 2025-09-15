import { useMemo } from 'react';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { useDateRange } from '@/contexts/DateRangeContext';

/**
 * Hook that provides transactions filtered by the current date range
 * and computes account balances from those filtered transactions
 */
export function useFilteredTransactions() {
  const { transactions, loading, error } = useTransactions();
  const { dateRange } = useDateRange();

  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [transactions, dateRange]);

  const accountBalances = useMemo(() => {
    const balances: Record<string, number> = {};

    filteredTransactions.forEach(transaction => {
      transaction.lines.forEach(line => {
        if (!balances[line.account_code]) {
          balances[line.account_code] = 0;
        }
        // Add net effect of each line (debit increases, credit decreases for debit accounts)
        balances[line.account_code] += (line.debit_amount || 0) - (line.credit_amount || 0);
      });
    });

    return balances;
  }, [filteredTransactions]);

  return {
    transactions: filteredTransactions,
    accountBalances,
    allTransactions: transactions,
    loading,
    error
  };
}