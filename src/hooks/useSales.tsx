/**
 * useSales
 * Manages sales data with database persistence.
 * Temporarily disabled until sales tables are added to TypeScript types
 */
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export interface SaleItem {
  id?: string;
  product_id: string;
  product_name: string;
  product_unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Sale {
  id: string;
  user_id: string;
  sale_number: string;
  sale_date: string;
  payment_method: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  notes?: string;
  items: SaleItem[];
  created_at?: string;
  updated_at?: string;
}

export interface InventoryLevel {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_unit: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  cost_per_unit: number;
  selling_price: number;
  last_updated?: string;
  created_at?: string;
}

export function useSales(userId: string) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [inventoryLevels, setInventoryLevels] = useState<InventoryLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (userId) {
      fetchSales();
      fetchInventoryLevels();
    }
  }, [userId]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!userId) return;
      const { data, error: fetchError } = await (supabase as any)
        .from('sales')
        .select(`*, sale_items (*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      const mapped: Sale[] = (data || []).map((s: any) => ({
        id: s.id,
        user_id: s.user_id,
        sale_number: s.sale_number,
        sale_date: s.sale_date,
        payment_method: s.payment_method,
        subtotal: Number(s.subtotal || 0),
        tax_amount: Number(s.tax_amount || 0),
        total_amount: Number(s.total_amount || 0),
        status: s.status,
        customer_name: s.customer_name || undefined,
        customer_phone: s.customer_phone || undefined,
        customer_address: s.customer_address || undefined,
        notes: s.notes || undefined,
        items: (s.sale_items || []).map((it: any) => ({
          id: it.id,
          product_id: it.product_id,
          product_name: it.product_name,
          product_unit: it.product_unit,
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
          total_price: Number(it.total_price),
        })),
        created_at: s.created_at,
        updated_at: s.updated_at,
      }));
      setSales(mapped);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryLevels = async () => {
    try {
      if (!userId) return;
      const { data, error: invErr } = await (supabase as any)
        .from('inventory_levels')
        .select('*')
        .eq('user_id', userId)
        .order('product_name', { ascending: true });
      if (invErr) throw invErr;
      const mapped: InventoryLevel[] = (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        product_id: row.product_id,
        product_name: row.product_name,
        product_unit: row.product_unit,
        current_stock: Number(row.current_stock || 0),
        minimum_stock: Number(row.minimum_stock || 0),
        maximum_stock: Number(row.maximum_stock || 0),
        cost_per_unit: Number(row.cost_per_unit || 0),
        selling_price: Number(row.selling_price || 0),
        last_updated: row.last_updated,
        created_at: row.created_at,
      }));
      setInventoryLevels(mapped);
    } catch (err) {
      console.error('Error fetching inventory levels:', err);
    }
  };

  const createSale = async (saleData: Omit<Sale, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sale_number'>) => {
    try {
      setLoading(true);
      setError(null);
      if (!user) throw new Error('User must be authenticated to create sales');
      const { data: saleNumber, error: numErr } = await (supabase as any).rpc('generate_sale_number');
      if (numErr) throw numErr;
      const { data: sale, error: saleErr } = await (supabase as any)
        .from('sales')
        .insert([{
          user_id: user.id,
          sale_number: saleNumber,
          sale_date: saleData.sale_date,
          payment_method: saleData.payment_method,
          subtotal: saleData.subtotal,
          tax_amount: saleData.tax_amount,
          total_amount: saleData.total_amount,
          notes: saleData.notes,
          status: saleData.status,
          customer_name: saleData.customer_name,
          customer_phone: saleData.customer_phone,
          customer_address: saleData.customer_address,
        }])
        .select()
        .single();
      if (saleErr) throw saleErr;
      if (saleData.items && saleData.items.length > 0) {
        const saleItems = saleData.items.map((item) => ({
          sale_id: sale.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_unit: item.product_unit,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        }));
        const { error: itemsErr } = await (supabase as any)
          .from('sale_items')
          .insert(saleItems);
        if (itemsErr) throw itemsErr;
      }
      await fetchSales();
      return sale as Sale;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create sale';
      setError(errorMessage);
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

  const updateSale = async (saleId: string, saleData: Partial<Sale>) => {
    try {
      setLoading(true);
      setError(null);
      const updatePayload: any = {};
      if (saleData.sale_date !== undefined) updatePayload.sale_date = saleData.sale_date;
      if (saleData.payment_method !== undefined) updatePayload.payment_method = saleData.payment_method;
      if (saleData.subtotal !== undefined) updatePayload.subtotal = saleData.subtotal;
      if (saleData.tax_amount !== undefined) updatePayload.tax_amount = saleData.tax_amount;
      if (saleData.total_amount !== undefined) updatePayload.total_amount = saleData.total_amount;
      if (saleData.notes !== undefined) updatePayload.notes = saleData.notes;
      if (saleData.status !== undefined) updatePayload.status = saleData.status;
      if (saleData.customer_name !== undefined) updatePayload.customer_name = saleData.customer_name;
      if (saleData.customer_phone !== undefined) updatePayload.customer_phone = saleData.customer_phone;
      if (saleData.customer_address !== undefined) updatePayload.customer_address = saleData.customer_address;
      if (Object.keys(updatePayload).length > 0) {
        const { error: updErr } = await (supabase as any)
          .from('sales')
          .update(updatePayload)
          .eq('id', saleId)
          .eq('user_id', userId);
        if (updErr) throw updErr;
      }
      await fetchSales();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update sale';
      setError(errorMessage);
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

  const deleteSale = async (saleId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { error: itemErr } = await (supabase as any)
        .from('sale_items')
        .delete()
        .eq('sale_id', saleId);
      if (itemErr) throw itemErr;
      const { error: delErr } = await (supabase as any)
        .from('sales')
        .delete()
        .eq('id', saleId)
        .eq('user_id', userId);
      if (delErr) throw delErr;
      await fetchSales();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete sale';
      setError(errorMessage);
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

  const updateInventoryLevel = async (productId: string, newStock: number) => {
    try {
      await (supabase as any)
        .from('inventory_levels')
        .update({ current_stock: newStock })
        .eq('user_id', userId)
        .eq('product_id', productId);
    } catch (err) {
      console.error('Error updating inventory level:', err);
    }
  };

  const getInventoryLevel = (productId: string): InventoryLevel | undefined => {
    return inventoryLevels.find(level => level.product_id === productId);
  };

  const isProductInStock = (productId: string, requestedQuantity: number): boolean => {
    const inventory = getInventoryLevel(productId);
    return inventory ? inventory.current_stock >= requestedQuantity : false;
  };

  const getAvailableStock = (productId: string): number => {
    const inventory = getInventoryLevel(productId);
    return inventory ? inventory.current_stock : 0;
  };

  return {
    sales,
    inventoryLevels,
    loading,
    error,
    fetchSales,
    fetchInventoryLevels,
    createSale,
    updateSale,
    deleteSale,
    updateInventoryLevel,
    getInventoryLevel,
    getAvailableStock,
    isProductInStock,
  };
}