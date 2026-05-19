/**
 * useCompanySettings
 * Reads and updates the single `company_settings` row.
 * - Fetches one row (or creates defaults on first save)
 * - Provides updateSettings that either inserts or updates
 * - Used by Company Settings page and exports/invoices for branding
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';

export interface CompanySettings {
  id?: string;
  company_name: string;
  logo_filename?: string;
  logo_path?: string;
  primary_color: string;
  created_at?: string;
  updated_at?: string;
}

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      setSettings(data || {
        company_name: 'QSA Solutions',
        primary_color: '#a1052d',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch company settings';
      setError(errorMessage);
      console.error('Company settings fetch error:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateSettings = async (updates: Partial<CompanySettings>) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to update settings');
      }

      if (!settings?.id) {
        // Create new settings
        const { data, error } = await supabase
          .from('company_settings')
          .insert([{
            company_name: 'QSA Solutions',
            primary_color: '#a1052d',
            user_id: user.id,
            ...updates,
          }])
          .select()
          .single();

        if (error) throw error;
        setSettings(data);
      } else {
        // Update existing settings
        const { data, error } = await supabase
          .from('company_settings')
          .update(updates)
          .eq('id', settings.id)
          .select()
          .single();

        if (error) throw error;
        setSettings(data);
      }

      toast({
        title: 'Success',
        description: 'Company settings updated successfully',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
  };
}