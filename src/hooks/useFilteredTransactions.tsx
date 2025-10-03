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
    const accountTypes = new Map(); // Cache account normal balance types

    // First pass: get account types from first transaction that uses each account
    filteredTransactions.forEach(transaction => {
      transaction.lines.forEach(line => {
        if (!accountTypes.has(line.account_code) && line.account_name) {
          // Determine account type from the first character of account code
          const accountCode = line.account_code;
          const firstDigit = parseInt(accountCode[0]);
          
          // Standard accounting code structure:
          // 1: Assets (debit)
          // 2: Liabilities (credit)
          // 3: Equity (credit)
          // 4: Revenue (credit)
          // 5: Expenses (debit)
          const normalBalance = firstDigit === 1 || firstDigit === 5 ? 'debit' : 'credit';
          accountTypes.set(line.account_code, normalBalance);
        }
      });
    });

    // Second pass: calculate balances correctly for each account type
    filteredTransactions.forEach(transaction => {
      transaction.lines.forEach(line => {
        if (!balances[line.account_code]) {
          balances[line.account_code] = 0;
        }

        const normalBalance = accountTypes.get(line.account_code) || 'debit';
        
        // Standard accounting equation:
        // Assets = Liabilities + Equity
        // Debits increase: Assets (1xxx), Expenses (5xxx)
        // Credits increase: Liabilities (2xxx), Equity (3xxx), Revenue (4xxx)
        
        if (normalBalance === 'debit') {
          // For debit-normal accounts (Assets, Expenses)
          // Debits increase (+), Credits decrease (-)
          balances[line.account_code] += (line.debit_amount || 0) - (line.credit_amount || 0);
        } else {
          // For credit-normal accounts (Liabilities, Equity, Revenue)
          // Credits increase (+), Debits decrease (-)
          balances[line.account_code] += (line.credit_amount || 0) - (line.debit_amount || 0);
        }
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