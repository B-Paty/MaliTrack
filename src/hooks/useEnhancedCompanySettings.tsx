/**
 * Enhanced Company Settings Hook
 * Comprehensive branding and company settings management
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { CompanySettings, LogoSettings, BrandingPreset } from '@/types/branding';
import { 
  fileToBase64, 
  validateImageFile, 
  applyBrandingTheme,
  calculateLogoDimensions 
} from '@/lib/brandingUtils';
import { getLogoPath, getFallbackLogoPaths } from '@/config/logoConfig';

export interface EnhancedCompanySettings {
  id?: string;
  company_name: string;
  logo_filename?: string;
  logo_path?: string;
  logo_base64?: string;
  primary_color: string;
  secondary_color?: string;
  accent_color?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  tax_id?: string;
  logo_position?: 'left' | 'center' | 'right';
  payment_settings?: any;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export const brandingPresets: BrandingPreset[] = [
  { name: 'MaliTrack Orange', primaryColor: '#FF371E', description: 'Bold and energetic' },
  { name: 'Deep Red', primaryColor: '#A01504', description: 'Professional deep red' },
  { name: 'Ocean Blue', primaryColor: '#0ea5e9', description: 'Trustworthy blue' },
  { name: 'Forest Green', primaryColor: '#059669', description: 'Growth and stability' },
  { name: 'Royal Purple', primaryColor: '#7c3aed', description: 'Premium and elegant' },
  { name: 'Charcoal Gray', primaryColor: '#374151', description: 'Professional neutral' },
  { name: 'Emerald', primaryColor: '#10b981', description: 'Fresh and vibrant' },
  { name: 'Indigo', primaryColor: '#6366f1', description: 'Creative and innovative' },
];

export function useEnhancedCompanySettings() {
  const [settings, setSettings] = useState<EnhancedCompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    position: 'left',
    maxWidth: 200,
    maxHeight: 80
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  /**
   * Get logo from static file system with theme support
   * Logo files are placed manually in /public/images/logo/ folder
   * This replaces the dynamic upload system with static file loading
   */
  const getStaticLogo = useCallback((theme?: 'light' | 'dark'): string => {
    try {
      // Get the configured logo path for the specified theme
      const logoPath = getLogoPath(theme);
      return logoPath;
    } catch (error) {
      // Fallback to default logo if config fails
      const fallbackLogos = ['/images/contactless.png', '/images/card (1).png', '/images/LIPA.png'];
      return fallbackLogos[0];
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        // User not available yet, try to fetch any existing company settings for login screen

        try {
          const { data: publicSettings, error: publicError } = await supabase
            .from('company_settings')
            .select('*')
            .limit(1)
            .order('created_at', { ascending: false })
            .maybeSingle();

          if (!publicError && publicSettings) {

            const finalSettings = {
              ...publicSettings,
              logo_position: (publicSettings.logo_position as 'left' | 'center' | 'right') || 'left',
              payment_settings: publicSettings.payment_settings || {}
            };
            setSettings(finalSettings as EnhancedCompanySettings);
            setLoading(false);
            return;
          }
        } catch (publicFetchError) {
          // Silently handle public settings fetch error
        }

        // If no public settings found, use default settings with static logo

        const staticLogoPath = getStaticLogo();
        const defaultSettings: EnhancedCompanySettings = {
          company_name: 'MaliTrack',
          primary_color: '#FF371E',
          secondary_color: '#E1E1E1',
          accent_color: '#323131',
          logo_position: 'left',
          logo_path: staticLogoPath, // Use static logo from configuration
          logo_base64: null, // Not needed for static files
          address: '',
          phone: '',
          email: '',
          website: '',
          tax_id: '',
        };
        setSettings(defaultSettings);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      const defaultSettings: EnhancedCompanySettings = {
        company_name: 'MaliTrack',
        primary_color: '#FF371E',
        secondary_color: '#E1E1E1',
        accent_color: '#323131',
        logo_position: 'left',
        address: '',
        phone: '',
        email: '',
        website: '',
        tax_id: '',
      };

      const finalSettings = data ? {
        ...defaultSettings,
        ...data,
        logo_position: (data.logo_position as 'left' | 'center' | 'right') || 'left',
        payment_settings: data.payment_settings || {}
      } : defaultSettings;

      setSettings(finalSettings as EnhancedCompanySettings);

      // Company settings loaded successfully

      // Apply branding theme
      if (data?.primary_color) {
        applyBrandingTheme(
          data.primary_color,
          data.secondary_color,
          data.accent_color
        );
      }

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
  }, [toast, user, getStaticLogo]);

  /**
   * Update company settings
   * Note: Logo is now handled by static file system, not dynamic uploads
   */
  const updateSettings = useCallback(async (updates: Partial<EnhancedCompanySettings>, logoFile?: File) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to update settings');
      }

      // Get the static logo path (ignore any uploaded files)
      const staticLogoPath = getStaticLogo();

      const settingsUpdate = {
        ...updates,
        // Use static logo path instead of uploaded file
        logo_path: staticLogoPath,
        logo_base64: null, // Not needed for static files
        logo_filename: null, // Not needed for static files
      };

      // Update settings with static logo path

      if (!settings?.id) {
        // Create new settings
        const insertData = {
          company_name: 'MaliTrack',
          primary_color: '#FF371E',
          user_id: user.id,
          ...settingsUpdate,
          payment_settings: settingsUpdate.payment_settings || {}
        };

        const { data, error } = await supabase
          .from('company_settings')
          .insert([insertData])
          .select()
          .single();

        if (error) throw error;
        setSettings(prev => ({
          ...prev,
          ...data,
          logo_position: (data.logo_position as 'left' | 'center' | 'right') || 'left',
          payment_settings: data.payment_settings || {}
        } as EnhancedCompanySettings));
      } else {
        // Update existing settings
        const updateData = {
          ...settingsUpdate,
          payment_settings: settingsUpdate.payment_settings || {}
        };

        const { data, error } = await supabase
          .from('company_settings')
          .update(updateData)
          .eq('id', settings.id)
          .select()
          .single();

        if (error) throw error;
        setSettings(prev => ({
          ...prev,
          ...data,
          logo_position: (data.logo_position as 'left' | 'center' | 'right') || 'left',
          payment_settings: data.payment_settings || {}
        } as EnhancedCompanySettings));
      }

      // Apply new branding theme
      if (settingsUpdate.primary_color) {
        applyBrandingTheme(
          settingsUpdate.primary_color,
          settingsUpdate.secondary_color,
          settingsUpdate.accent_color
        );
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
  }, [settings, user, toast, getStaticLogo]);

  const applyPreset = useCallback(async (preset: BrandingPreset) => {
    try {
      await updateSettings({
        primary_color: preset.primaryColor,
        secondary_color: preset.secondaryColor,
        accent_color: preset.accentColor,
      });
    } catch (err) {
      console.error('Failed to apply preset:', err);
    }
  }, [updateSettings]);

  const removeLogo = useCallback(async () => {
    try {
      await updateSettings({
        logo_path: undefined,
        logo_base64: undefined,
        logo_filename: undefined,
      });
    } catch (err) {
      console.error('Failed to remove logo:', err);
    }
  }, [updateSettings]);

  /**
   * Get logo for specific context (header, export, preview)
   * Uses static logo system instead of dynamic uploads
   */
  const getLogoForContext = useCallback((context: 'header' | 'export' | 'preview', theme?: 'light' | 'dark') => {
    try {
      // Get static logo path from configuration with theme support
      const staticLogoPath = getStaticLogo(theme);

      if (!staticLogoPath) {
        return null;
      }

      // For exports, we can still use base64 if needed, but static files work fine
      if (context === 'export') {
        // For exports, return the static path (can be converted to base64 if needed)
        return staticLogoPath;
      }

      return staticLogoPath;
    } catch (error) {
      return null;
    }
  }, [getStaticLogo]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    logoSettings,
    brandingPresets,
    fetchSettings,
    updateSettings,
    applyPreset,
    removeLogo,
    getLogoForContext,
    setLogoSettings,
  };
}
