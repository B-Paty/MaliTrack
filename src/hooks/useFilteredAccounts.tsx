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
      const periodBalance = accountBalances[account.account_code] || 0;
      
      // For different account types, we need to handle the balance presentation correctly
      let displayBalance = periodBalance;
      
      // For credit normal balance accounts, we need to flip the sign for display
      if (account.normal_balance === 'credit') {
        displayBalance = -periodBalance;
      }

      return {
        ...account,
        period_balance: displayBalance,
        current_balance: displayBalance
      } as FilteredAccount;
    });
  }, [accounts, accountBalances]);

  return {
    accounts: filteredAccounts,
    loading,
    error
  };
}