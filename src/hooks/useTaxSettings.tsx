import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export interface TaxSettings {
  id: string;
  taxType: 'inclusive' | 'exclusive';
  taxRate: number;
  taxName: string;
  taxDescription: string;
  createdAt: string;
  updatedAt: string;
}

// Default tax settings for Tanzania (VAT)
const defaultTaxSettings: TaxSettings = {
  id: '1',
  taxType: 'exclusive',
  taxRate: 18,
  taxName: 'VAT',
  taxDescription: 'Value Added Tax',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const useTaxSettings = () => {
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(defaultTaxSettings);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const updateTaxSettings = async (updates: Partial<TaxSettings>) => {
    setIsLoading(true);
    try {
      const updatedSettings = {
        ...taxSettings,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      setTaxSettings(updatedSettings);
      
      // Store in localStorage for persistence
      localStorage.setItem('taxSettings', JSON.stringify(updatedSettings));
      
      // Persist to database inside company_settings.payment_settings.tax
      if (user) {
        // Ensure a singleton company_settings row exists
        const { data: existing } = await (supabase as any)
          .from('company_settings')
          .select('id, payment_settings')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (existing?.id) {
          const mergedPayment = {
            ...(existing.payment_settings || {}),
            tax: updatedSettings,
          };
          await (supabase as any)
            .from('company_settings')
            .update({ payment_settings: mergedPayment })
            .eq('id', existing.id);
        } else {
          await (supabase as any)
            .from('company_settings')
            .insert([{
              company_name: 'QSA Solutions',
              primary_color: '#a1052d',
              payment_settings: { tax: updatedSettings },
              user_id: user.id,
            }]);
        }
      }
      
      return updatedSettings;
    } finally {
      setIsLoading(false);
    }
  };

  // Load settings from DB (fallback to localStorage/default)
  useEffect(() => {
    const load = async () => {
      try {
        if (user) {
          const { data: existing } = await (supabase as any)
            .from('company_settings')
            .select('payment_settings')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle();
          const dbTax = existing?.payment_settings?.tax;
          if (dbTax) {
            setTaxSettings(dbTax as TaxSettings);
            localStorage.setItem('taxSettings', JSON.stringify(dbTax));
            return;
          }
        }
        const stored = localStorage.getItem('taxSettings');
        if (stored) {
          setTaxSettings(JSON.parse(stored));
        } else {
          setTaxSettings(defaultTaxSettings);
        }
      } catch (error) {
        console.error('Error loading tax settings:', error);
        const stored = localStorage.getItem('taxSettings');
        if (stored) setTaxSettings(JSON.parse(stored));
      }
    };
    void load();
  }, [user]);

  return {
    taxSettings,
    updateTaxSettings,
    isLoading
  };
};