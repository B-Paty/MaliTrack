import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductType {
  id: string;
  name: string;
  description: string;
  unit: string;
  defaultPrice: number;
}

export interface InventorySettings {
  id: string;
  user_id: string;
  inventory_type: 'single' | 'multiple';
  products: ProductType[];
  created_at: string;
  updated_at: string;
}

export function useInventorySettings(userId: string) {
  const [settings, setSettings] = useState<InventorySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchSettings();
    }
  }, [userId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Temporarily disabled until inventory_settings is added to types
      console.log('Inventory settings fetch temporarily disabled');
      /*
      const { data, error: fetchError } = await supabase
        .from('inventory_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setSettings(data);
      */
      setSettings(null);
    } catch (err) {
      console.error('Error fetching inventory settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const updateInventoryType = async (inventoryType: 'single' | 'multiple', products?: ProductType[]) => {
    try {
      setLoading(true);
      setError(null);

      // Temporarily disabled until inventory_settings is added to types
      console.log('Inventory settings update temporarily disabled');
      /*
      const { data, error: updateError } = await supabase
        .from('inventory_settings')
        .upsert({
          user_id: userId,
          inventory_type: inventoryType,
          products: products || settings?.products || [],
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setSettings(data);
      return data;
      */
      return null;
    } catch (err) {
      console.error('Error updating inventory settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: ProductType) => {
    if (!settings) return;

    const updatedProducts = [...settings.products, product];
    return updateInventoryType('multiple', updatedProducts);
  };

  const removeProduct = async (productId: string) => {
    if (!settings) return;

    const updatedProducts = settings.products.filter(p => p.id !== productId);
    return updateInventoryType('multiple', updatedProducts);
  };

  const updateProduct = async (productId: string, updatedProduct: ProductType) => {
    if (!settings) return;

    const updatedProducts = settings.products.map(p => 
      p.id === productId ? updatedProduct : p
    );
    return updateInventoryType('multiple', updatedProducts);
  };

  const getProductById = (productId: string): ProductType | undefined => {
    return settings?.products.find(p => p.id === productId);
  };

  const getProductByName = (productName: string): ProductType | undefined => {
    return settings?.products.find(p => p.name.toLowerCase() === productName.toLowerCase());
  };

  return {
    settings,
    loading,
    error,
    updateInventoryType,
    addProduct,
    removeProduct,
    updateProduct,
    getProductById,
    getProductByName,
    refetch: fetchSettings
  };
}
