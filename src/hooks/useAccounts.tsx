/**
 * useAccounts
 * High-level hook to read and manage the Chart of Accounts from Supabase.
 * - Fetches accounts on mount
 * - Exposes CRUD helpers that update local state optimistically and show toasts
 *
 * Returns:
 * - accounts: Account[] current list
 * - loading: boolean loading flag
 * - error: string | null last fetch error
 * - fetchAccounts(): Promise<void> refetch all accounts
 * - createAccount(account): Promise<Account> insert and append
 * - updateAccount(code, updates): Promise<Account> update and merge
 * - deleteAccount(code): Promise<void> remove by primary key
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLeakDetection } from '@/hooks/useLeakDetection';

export interface Account {
  account_code: string;
  account_name: string;
  category: string;
  current_balance: number;
  normal_balance: 'debit' | 'credit';
  created_at?: string;
  updated_at?: string;
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { logDataAccess } = useLeakDetection();

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        console.warn('No authenticated user found');
        setAccounts([]);
        return;
      }

      console.log('Fetching accounts for user:', user.id);

      const { data, error: fetchError } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('account_code');

      if (fetchError) {
        console.error('Database error:', fetchError);
        throw fetchError;
      }

      console.log('Fetched accounts:', data?.length || 0, 'accounts');

      // Log data access for leak detection
      await logDataAccess('chart_of_accounts', 'SELECT', undefined, data?.length || 0);

      setAccounts(data as Account[] || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch accounts';
      console.error('fetchAccounts error:', err);
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

  const createAccount = async (accountData: Omit<Account, 'created_at' | 'updated_at'>) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to create accounts');
      }

      console.log('Creating account for user:', user.id, accountData);

      const { data, error } = await supabase
        .from('chart_of_accounts')
        .insert([{ ...accountData, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Create account error:', error);
        throw error;
      }

      console.log('Account created:', data);

      // Log data access for leak detection
      await logDataAccess('chart_of_accounts', 'INSERT', data.account_code);

      setAccounts(prev => [...prev, data as Account]);
      toast({
        title: 'Success',
        description: 'Account created successfully',
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
      console.error('createAccount error:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      throw err;
    }
  };

  const updateAccount = async (accountCode: string, updates: Partial<Account>) => {
    try {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .update(updates)
        .eq('account_code', accountCode)
        .select()
        .single();

      if (error) throw error;

      setAccounts(prev => prev.map(acc => 
        acc.account_code === accountCode ? { ...acc, ...data as Account } : acc
      ));

      toast({
        title: 'Success',
        description: 'Account updated successfully',
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update account';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      throw err;
    }
  };

  const deleteAccount = async (accountCode: string) => {
    try {
      const { error } = await supabase
        .from('chart_of_accounts')
        .delete()
        .eq('account_code', accountCode);

      if (error) throw error;

      setAccounts(prev => prev.filter(acc => acc.account_code !== accountCode));
      toast({
        title: 'Success',
        description: 'Account deleted successfully',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete account';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  };
}