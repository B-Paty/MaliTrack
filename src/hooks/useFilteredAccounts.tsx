import { useMemo } from 'react';
import { useAccounts, Account } from '@/hooks/useAccounts';
import { useFilteredTransactions } from '@/hooks/useFilteredTransactions';

/**
 * Hook that provides accounts with balances calculated from filtered transactions
 * instead of using the current_balance from the database
 */
export interface FilteredAccount extends Omit<Account, 'current_balance'> {
  current_balance: number;
  period_balance: number; // Balance from filtered transactions only
}

export function useFilteredAccounts() {
  const { accounts, loading, error } = useAccounts();
  const { accountBalances } = useFilteredTransactions();

  const filteredAccounts = useMemo(() => {
    return accounts.map(account => {
      // Get the net transaction balance for this account
      const transactionBalance = accountBalances[account.account_code] || 0;
      
      // Transaction balance calculation: (debits - credits)
      // Positive = net debit balance, Negative = net credit balance
      
      // For trial balance display, we show the absolute value in the correct column
      // based on the account's normal balance type and actual balance sign
      let displayBalance = transactionBalance;
      
      // The transaction balance represents the true accounting balance
      // No need to flip signs - we'll handle presentation in the trial balance component

      return {
        ...account,
        period_balance: displayBalance,
        current_balance: displayBalance // Use transaction-based balance only
      } as FilteredAccount;
    });
  }, [accounts, accountBalances]);

  return {
    accounts: filteredAccounts,
    loading,
    error
  };
}