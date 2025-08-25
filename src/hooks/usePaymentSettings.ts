/**
 * usePaymentSettings
 * Centralized payment configuration for invoices.
 * - Reads `company_settings.payment_settings` (JSONB)
 * - Falls back to localStorage on first run or offline errors
 * - Saves to DB and caches to localStorage for resilience
 *
 * Shape:
 * {
 *   bank: { enabled, bankName, accountName, accountNumber, cardImageUrl }
 *   vodacom: { enabled, businessName, lipaNamba, vodacomImageUrl }
 * }
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export type PaymentSettings = {
  bank: {
    enabled: boolean;
    bankName: string;
    accountName: string;
    accountNumber: string;
    cardImageUrl?: string;
  };
  vodacom: {
    enabled: boolean;
    businessName: string;
    lipaNamba: string;
    vodacomImageUrl?: string;
  };
};

const STORAGE_KEY = 'qsa_payment_settings_v1';

const defaultPaymentSettings: PaymentSettings = {
  bank: {
    enabled: true,
    bankName: '',
    accountName: '',
    accountNumber: '',
    cardImageUrl: '/images/card(1).png'
  },
  vodacom: {
    enabled: true,
    businessName: '',
    lipaNamba: '',
    vodacomImageUrl: '/images/LIPA.png'
  }
};

export function usePaymentSettings() {
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(defaultPaymentSettings);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('company_settings')
          .select('id, payment_settings')
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data?.payment_settings) {
          setPaymentSettings({ ...defaultPaymentSettings, ...(data.payment_settings as PaymentSettings) });
        } else {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            setPaymentSettings({ ...defaultPaymentSettings, ...JSON.parse(raw) });
          }
        }
      } catch {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setPaymentSettings({ ...defaultPaymentSettings, ...JSON.parse(raw) });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const savePaymentSettings = async (updates: Partial<PaymentSettings>) => {
    setPaymentSettings(prev => {
      const merged: PaymentSettings = {
        bank: { ...prev.bank, ...(updates.bank || {}) },
        vodacom: { ...prev.vodacom, ...(updates.vodacom || {}) }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    });

    try {
      // Ensure singleton row exists
      const { data: existing } = await supabase
        .from('company_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        await supabase
          .from('company_settings')
          .update({ payment_settings: updates })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('company_settings')
          .insert([{ company_name: 'QSA Solutions', primary_color: '#a1052d', payment_settings: updates }]);
      }
    } catch (e) {
      // Keep localStorage as fallback, surface console warning
      console.warn('Saving payment settings failed, kept local fallback.', e);
    }
  };

  return { paymentSettings, savePaymentSettings, loading };
}
