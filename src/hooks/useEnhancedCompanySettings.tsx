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

export interface EnhancedCompanySettings extends Omit<CompanySettings, 'logo'> {
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
  { name: 'QSA Crimson', primaryColor: '#a1052d', description: 'Professional deep red' },
  { name: 'Ocean Blue', primaryColor: '#0ea5e9', description: 'Trustworthy blue' },
  { name: 'Forest Green', primaryColor: '#059669', description: 'Growth and stability' },
  { name: 'Royal Purple', primaryColor: '#7c3aed', description: 'Premium and elegant' },
  { name: 'Sunset Orange', primaryColor: '#ea580c', description: 'Energetic and modern' },
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

      const defaultSettings: EnhancedCompanySettings = {
        company_name: 'QSA Solutions',
        primary_color: '#a1052d',
        secondary_color: '#ffffff',
        accent_color: '#f3f4f6',
        logo_position: 'left',
        address: '',
        phone: '',
        email: '',
        website: '',
        tax_id: '',
      };

      setSettings(data ? { ...defaultSettings, ...data } : defaultSettings);
      
      // Apply branding theme
      if (data?.primary_color) {
        applyBrandingTheme(data.primary_color, data.secondary_color, data.accent_color);
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
  }, [toast]);

  const uploadLogo = useCallback(async (file: File): Promise<string> => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    try {
      // Convert to base64 for storage
      const base64 = await fileToBase64(file);
      
      // Also upload to Supabase storage for public access
      const fileName = `logo-${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.warn('Storage upload failed, using base64:', uploadError);
        return base64;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('company-assets')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Logo upload error:', err);
      throw new Error('Failed to upload logo');
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<EnhancedCompanySettings>, logoFile?: File) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to update settings');
      }

      let logoUrl = updates.logo_path;
      let logoBase64 = updates.logo_base64;

      // Handle logo upload if provided
      if (logoFile) {
        try {
          logoUrl = await uploadLogo(logoFile);
          logoBase64 = await fileToBase64(logoFile);
        } catch (logoError) {
          console.error('Logo upload failed:', logoError);
          toast({
            variant: 'destructive',
            title: 'Logo Upload Failed',
            description: 'Settings saved without logo update',
          });
        }
      }

      const settingsUpdate = {
        ...updates,
        logo_path: logoUrl,
        logo_base64: logoBase64,
        logo_filename: logoFile?.name,
      };

      if (!settings?.id) {
        // Create new settings
        const { data, error } = await supabase
          .from('company_settings')
          .insert([{
            company_name: 'QSA Solutions',
            primary_color: '#a1052d',
            user_id: user.id,
            ...settingsUpdate,
          }])
          .select()
          .single();

        if (error) throw error;
        setSettings(prev => ({ ...prev, ...data }));
      } else {
        // Update existing settings
        const { data, error } = await supabase
          .from('company_settings')
          .update(settingsUpdate)
          .eq('id', settings.id)
          .select()
          .single();

        if (error) throw error;
        setSettings(prev => ({ ...prev, ...data }));
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
  }, [settings, user, toast, uploadLogo]);

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

  const getLogoForContext = useCallback((context: 'header' | 'export' | 'preview') => {
    if (!settings?.logo_path && !settings?.logo_base64) return null;
    
    const logoUrl = settings.logo_path || settings.logo_base64;
    if (!logoUrl) return null;

    // For exports, prefer base64 for embedding
    if (context === 'export' && settings.logo_base64) {
      return settings.logo_base64;
    }

    return logoUrl;
  }, [settings]);

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
    uploadLogo,
    applyPreset,
    removeLogo,
    getLogoForContext,
    setLogoSettings,
  };
}
