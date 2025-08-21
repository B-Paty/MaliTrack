import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setSettings(data || {
        company_name: 'QSA Solutions',
        primary_color: '#a1052d',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch company settings';
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

  const updateSettings = async (updates: Partial<CompanySettings>) => {
    try {
      if (!settings?.id) {
        // Create new settings
        const { data, error } = await supabase
          .from('company_settings')
          .insert([{
            company_name: 'QSA Solutions',
            primary_color: '#a1052d',
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
  }, []);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
  };
}