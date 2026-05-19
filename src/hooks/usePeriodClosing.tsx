/**
 * usePeriodClosing
 * Hook for managing monthly/quarterly period closings
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';

export interface PeriodClosing {
  id: string;
  user_id: string;
  closing_date: string;
  period_type: 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  net_income: number;
  is_closed: boolean;
  closed_by?: string;
  closed_at?: string;
  created_at: string;
}

export function usePeriodClosing() {
  const [closings, setClosings] = useState<PeriodClosing[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchClosings = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('period_closings')
        .select('*')
        .eq('user_id', user.id)
        .order('period_end', { ascending: false });

      if (error) throw error;
      setClosings(data || []);
    } catch (err) {
      console.error('Error fetching closings:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchClosings();
  }, [fetchClosings]);

  const closePeriod = async (
    periodType: 'monthly' | 'quarterly',
    periodStart: string,
    periodEnd: string,
    netIncome: number
  ) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to close a period',
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await (supabase as any)
        .from('period_closings')
        .insert({
          user_id: user.id,
          closing_date: new Date().toISOString().split('T')[0],
          period_type: periodType,
          period_start: periodStart,
          period_end: periodEnd,
          net_income: netIncome,
          is_closed: true,
          closed_by: user.id,
          closed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Period Closed',
        description: `${periodType.charAt(0).toUpperCase() + periodType.slice(1)} period has been closed successfully`,
      });

      await fetchClosings();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to close period';
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
    closings,
    loading,
    closePeriod,
    fetchClosings,
  };
}
