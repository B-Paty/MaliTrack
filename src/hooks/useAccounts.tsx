import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .order('account_code');

      if (fetchError) {
        throw fetchError;
      }

      setAccounts(data as Account[] || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch accounts';
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
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .insert([accountData])
        .select()
        .single();

      if (error) throw error;

      setAccounts(prev => [...prev, data as Account]);
      toast({
        title: 'Success',
        description: 'Account created successfully',
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
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