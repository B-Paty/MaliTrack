/**
 * useSales
 * Manages sales data with database persistence.
 * Temporarily disabled until sales tables are added to TypeScript types
 */
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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

      // Temporarily disabled until sales table is added to types
      console.log('Sales fetch temporarily disabled');
      setSales([]);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryLevels = async () => {
    try {
      // Temporarily disabled until inventory_levels table is added to types
      console.log('Inventory levels fetch temporarily disabled');
      setInventoryLevels([]);
    } catch (err) {
      console.error('Error fetching inventory levels:', err);
    }
  };

  const createSale = async (saleData: Omit<Sale, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sale_number'>) => {
    try {
      setLoading(true);
      setError(null);

      // Temporarily disabled until sales table is added to types
      console.log('Sale creation temporarily disabled');
      toast({
        title: 'Info',
        description: 'Sale creation temporarily disabled',
      });
      
      return null;
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

      // Temporarily disabled until sales table is added to types
      console.log('Sale update temporarily disabled');
      toast({
        title: 'Info',
        description: 'Sale update temporarily disabled',
      });
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

      // Temporarily disabled until sales table is added to types
      console.log('Sale deletion temporarily disabled');
      toast({
        title: 'Info',
        description: 'Sale deletion temporarily disabled',
      });
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
      // Temporarily disabled until inventory_levels table is added to types
      console.log('Inventory level update temporarily disabled');
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