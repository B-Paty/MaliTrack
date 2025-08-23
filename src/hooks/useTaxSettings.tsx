import { useState, useEffect } from "react";

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

  const updateTaxSettings = async (updates: Partial<TaxSettings>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedSettings = {
        ...taxSettings,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      setTaxSettings(updatedSettings);
      
      // Store in localStorage for persistence
      localStorage.setItem('taxSettings', JSON.stringify(updatedSettings));
      
      return updatedSettings;
    } finally {
      setIsLoading(false);
    }
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('taxSettings');
    if (stored) {
      try {
        setTaxSettings(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading tax settings:', error);
      }
    }
  }, []);

  return {
    taxSettings,
    updateTaxSettings,
    isLoading
  };
};