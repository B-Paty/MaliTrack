import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  payment_method: 'cash' | 'credit' | 'bank_transfer';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  items?: SaleItem[];
}

export interface InventoryMovement {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  movement_type: 'sale' | 'purchase' | 'adjustment' | 'return';
  quantity: number;
  unit_price?: number;
  total_value?: number;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  movement_date: string;
  created_at: string;
}

export interface InventoryLevel {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_unit: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  last_movement_date?: string;
  last_movement_type?: string;
  created_at: string;
  updated_at: string;
}

export function useSales(userId: string) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [inventoryLevels, setInventoryLevels] = useState<InventoryLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const { data, error: fetchError } = await supabase
        .from('sales')
        .select(`
          *,
          items:sale_items(*)
        `)
        .eq('user_id', userId)
        .order('sale_date', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setSales(data || []);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryLevels = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('inventory_levels')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) {
        throw fetchError;
      }

      setInventoryLevels(data || []);
    } catch (err) {
      console.error('Error fetching inventory levels:', err);
    }
  };

  const createSale = async (saleData: Omit<Sale, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sale_number'>) => {
    try {
      setLoading(true);
      setError(null);

      // Generate sale number
      const { data: saleNumberData, error: saleNumberError } = await supabase
        .rpc('generate_sale_number');

      if (saleNumberError) {
        throw saleNumberError;
      }

      // Create sale
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          user_id: userId,
          sale_number: saleNumberData,
          ...saleData
        })
        .select()
        .single();

      if (saleError) {
        throw saleError;
      }

      // Create sale items
      if (saleData.items && saleData.items.length > 0) {
        const saleItems = saleData.items.map((item: SaleItem) => ({
          sale_id: saleData.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_unit: item.product_unit,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }));

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItems);

        if (itemsError) {
          throw itemsError;
        }

        // Create inventory movements and update inventory levels
        await updateInventoryForSale(saleData.id, saleData.items);
      }

      await fetchSales();
      await fetchInventoryLevels();
      return saleData;
    } catch (err) {
      console.error('Error creating sale:', err);
      setError(err instanceof Error ? err.message : 'Failed to create sale');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateInventoryForSale = async (saleId: string, items: SaleItem[]) => {
    try {
      for (const item of items) {
        // Create inventory movement
        const { error: movementError } = await supabase
          .from('inventory_movements')
          .insert({
            user_id: userId,
            product_id: item.product_id,
            product_name: item.product_name,
            movement_type: 'sale',
            quantity: -item.quantity, // Negative for sales (reduces stock)
            unit_price: item.unit_price,
            total_value: item.total_price,
            reference_id: saleId,
            reference_type: 'sale',
            notes: `Sale: ${item.product_name}`
          });

        if (movementError) {
          throw movementError;
        }

        // Update inventory level
        const { data: existingLevel, error: levelError } = await supabase
          .from('inventory_levels')
          .select('*')
          .eq('user_id', userId)
          .eq('product_id', item.product_id)
          .single();

        if (levelError && levelError.code !== 'PGRST116') {
          throw levelError;
        }

        if (existingLevel) {
          // Update existing level
          const { error: updateError } = await supabase
            .from('inventory_levels')
            .update({
              current_stock: existingLevel.current_stock - item.quantity,
              last_movement_date: new Date().toISOString().split('T')[0],
              last_movement_type: 'sale'
            })
            .eq('id', existingLevel.id);

          if (updateError) {
            throw updateError;
          }
        } else {
          // Create new level (this shouldn't happen in normal flow)
          const { error: createError } = await supabase
            .from('inventory_levels')
            .insert({
              user_id: userId,
              product_id: item.product_id,
              product_name: item.product_name,
              product_unit: item.product_unit,
              current_stock: -item.quantity,
              reserved_stock: 0,
              last_movement_date: new Date().toISOString().split('T')[0],
              last_movement_type: 'sale'
            });

          if (createError) {
            throw createError;
          }
        }
      }
    } catch (err) {
      console.error('Error updating inventory for sale:', err);
      throw err;
    }
  };

  const getInventoryLevel = (productId: string): InventoryLevel | undefined => {
    return inventoryLevels.find(level => level.product_id === productId);
  };

  const getAvailableStock = (productId: string): number => {
    const level = getInventoryLevel(productId);
    return level ? level.available_stock : 0;
  };

  const createJournalEntryFromSale = async (sale: Sale) => {
    try {
      // This would create a journal entry based on the sale
      // Implementation depends on your journal entry system
      const journalLines = [];
      
      if (sale.payment_method === 'cash') {
        journalLines.push({
          account_code: '1010', // Cash in Hand
          debit_amount: sale.total_amount,
          credit_amount: 0
        });
      } else if (sale.payment_method === 'credit') {
        journalLines.push({
          account_code: '1030', // Accounts Receivable
          debit_amount: sale.total_amount,
          credit_amount: 0
        });
      }

      // Add sales revenue lines for each product
      if (sale.items) {
        for (const item of sale.items) {
          // Find the product's sales revenue account
          // This would need to be implemented based on your account structure
          journalLines.push({
            account_code: '4010', // Default Sales Revenue (would be product-specific in multiple inventory)
            debit_amount: 0,
            credit_amount: item.total_price
          });
        }
      }

      return journalLines;
    } catch (err) {
      console.error('Error creating journal entry from sale:', err);
      throw err;
    }
  };

  return {
    sales,
    inventoryLevels,
    loading,
    error,
    createSale,
    getInventoryLevel,
    getAvailableStock,
    createJournalEntryFromSale,
    refetch: fetchSales
  };
}
