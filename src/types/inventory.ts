/**
 * Inventory Management Types
 * Comprehensive interfaces for automated inventory management system
 */

export interface InventoryProduct {
  id: string;
  name: string;
  category: string;
  unit_of_measure: string;
  cost_per_unit: number;
  selling_price: number;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  inventory_account_code: string;
  cogs_account_code: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface InventoryTransaction {
  id: string;
  product_id: string;
  transaction_type: 'sale' | 'purchase' | 'adjustment';
  quantity: number;
  unit_price: number;
  total_amount: number;
  reference_number?: string;
  transaction_date: string;
  description: string;
  created_at?: string;
  user_id?: string;
}

export interface InventoryReport {
  product_id: string;
  product_name: string;
  category: string;
  opening_stock: number;
  purchases: number;
  sales: number;
  adjustments: number;
  closing_stock: number;
  stock_value: number;
  cogs_value: number;
}

export interface LowStockAlert {
  product_id: string;
  product_name: string;
  current_stock: number;
  minimum_stock: number;
  days_remaining: number;
  alert_level: 'low' | 'critical' | 'out_of_stock';
}

export interface BusinessRegistration {
  business_name: string;
  business_type: string;
  registration_number: string;
  tax_id: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  industry: string;
  inventory_type: 'single' | 'multiple';
  products?: InventoryProduct[];
}

export interface SalesTransaction {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  cogs_amount: number;
}

export interface AutomatedCOGSEntry {
  product_id: string;
  quantity: number;
  unit_cogs: number;
  total_cogs: number;
  inventory_account_code: string;
  cogs_account_code: string;
}
