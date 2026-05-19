/**
 * useInvoices
 * Manages invoice data with database persistence.
 * 
 * NOTE: This hook is temporarily disabled until the database migration is run.
 * The migration adds the invoices and invoice_items tables to the database.
 * After running the migration, uncomment this code and the types will be available.
 */
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  dateOfService: string;
  dateOfInvoice: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  termsAndConditions?: string;
  personalNote?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  items: InvoiceItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateInvoiceData {
  invoiceNumber: string;
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  dateOfService: string;
  dateOfInvoice: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  termsAndConditions?: string;
  personalNote?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue';
  items: InvoiceItem[];
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchInvoices = useCallback(async () => {
    console.warn('Invoice functionality is disabled until migration is run');
    setLoading(false);
  }, []);

  const createInvoice = async (invoiceData: CreateInvoiceData) => {
    toast({
      variant: 'destructive',
      title: 'Feature Unavailable',
      description: 'Invoices are disabled until database migration is completed.',
    });
    throw new Error('Invoices disabled until migration');
  };

  const updateInvoice = async (invoiceId: string, invoiceData: Partial<CreateInvoiceData>) => {
    toast({
      variant: 'destructive',
      title: 'Feature Unavailable',
      description: 'Invoices are disabled until database migration is completed.',
    });
    throw new Error('Invoices disabled until migration');
  };

  const deleteInvoice = async (invoiceId: string) => {
    toast({
      variant: 'destructive',
      title: 'Feature Unavailable',
      description: 'Invoices are disabled until database migration is completed.',
    });
    throw new Error('Invoices disabled until migration');
  };

  const deleteInvoices = async (invoiceIds: string[]) => {
    toast({
      variant: 'destructive',
      title: 'Feature Unavailable',
      description: 'Invoices are disabled until database migration is completed.',
    });
    throw new Error('Invoices disabled until migration');
  };

  const generateInvoiceNumber = useCallback((): string => {
    const year = new Date().getFullYear();
    return `INV-${year}-0001`;
  }, []);

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user, fetchInvoices]);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    deleteInvoices,
    generateInvoiceNumber,
  };
}
