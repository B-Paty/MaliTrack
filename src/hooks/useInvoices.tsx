/**
 * useInvoices
 * Manages invoice data with database persistence.
 * - Fetches invoices with their line items from Supabase
 * - Creates, updates, and deletes invoices
 * - Handles invoice status management
 * - Generates unique invoice numbers
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User must be authenticated to fetch invoices');
      }
      const { data: invoicesData, error: fetchError } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*),
          major_clients!client_id (
            id,
            client_name,
            client_email,
            client_phone,
            client_address
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const formattedInvoices = invoicesData?.map((invoice: any) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        clientId: invoice.client_id,
        clientName: invoice.client_name,
        clientEmail: invoice.client_email,
        clientPhone: invoice.client_phone,
        clientAddress: invoice.client_address,
        dateOfService: invoice.date_of_service,
        dateOfInvoice: invoice.date_of_invoice,
        dueDate: invoice.due_date,
        subtotal: invoice.subtotal,
        taxAmount: invoice.tax_amount,
        totalAmount: invoice.total_amount,
        termsAndConditions: invoice.terms_and_conditions,
        personalNote: invoice.personal_note,
        status: invoice.status,
        items: (invoice.invoice_items || []).map((item: any) => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          total: Number(item.total),
        })),
        created_at: invoice.created_at,
        updated_at: invoice.updated_at,
      })) || [];

      setInvoices(formattedInvoices);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch invoices';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createInvoice = async (invoiceData: CreateInvoiceData) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to create invoices');
      }
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          user_id: user.id,
          client_id: invoiceData.clientId,
          invoice_number: invoiceData.invoiceNumber,
          client_name: invoiceData.clientName,
          client_email: invoiceData.clientEmail,
          client_phone: invoiceData.clientPhone,
          client_address: invoiceData.clientAddress,
          date_of_service: invoiceData.dateOfService,
          date_of_invoice: invoiceData.dateOfInvoice,
          due_date: invoiceData.dueDate,
          subtotal: invoiceData.subtotal,
          tax_amount: invoiceData.taxAmount,
          total_amount: invoiceData.totalAmount,
          terms_and_conditions: invoiceData.termsAndConditions,
          personal_note: invoiceData.personalNote,
          status: invoiceData.status || 'draft',
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      if (invoiceData.items && invoiceData.items.length > 0) {
        const itemsWithInvoiceId = invoiceData.items.map(item => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total: item.total,
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsWithInvoiceId);

        if (itemsError) throw itemsError;
      }

      toast({
        title: 'Success',
        description: `Invoice ${invoiceData.invoiceNumber} created successfully`,
      });

      await fetchInvoices();
      return invoice;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create invoice';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      throw err;
    }
  };

  const updateInvoice = async (invoiceId: string, invoiceData: Partial<CreateInvoiceData>) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to update invoices');
      }
      const updatePayload: any = {};
      if (invoiceData.clientId !== undefined) updatePayload.client_id = invoiceData.clientId;
      if (invoiceData.invoiceNumber !== undefined) updatePayload.invoice_number = invoiceData.invoiceNumber;
      if (invoiceData.clientName !== undefined) updatePayload.client_name = invoiceData.clientName;
      if (invoiceData.clientEmail !== undefined) updatePayload.client_email = invoiceData.clientEmail;
      if (invoiceData.clientPhone !== undefined) updatePayload.client_phone = invoiceData.clientPhone;
      if (invoiceData.clientAddress !== undefined) updatePayload.client_address = invoiceData.clientAddress;
      if (invoiceData.dateOfService !== undefined) updatePayload.date_of_service = invoiceData.dateOfService;
      if (invoiceData.dateOfInvoice !== undefined) updatePayload.date_of_invoice = invoiceData.dateOfInvoice;
      if (invoiceData.dueDate !== undefined) updatePayload.due_date = invoiceData.dueDate;
      if (invoiceData.subtotal !== undefined) updatePayload.subtotal = invoiceData.subtotal;
      if (invoiceData.taxAmount !== undefined) updatePayload.tax_amount = invoiceData.taxAmount;
      if (invoiceData.totalAmount !== undefined) updatePayload.total_amount = invoiceData.totalAmount;
      if (invoiceData.termsAndConditions !== undefined) updatePayload.terms_and_conditions = invoiceData.termsAndConditions;
      if (invoiceData.personalNote !== undefined) updatePayload.personal_note = invoiceData.personalNote;
      if (invoiceData.status !== undefined) updatePayload.status = invoiceData.status;

      if (Object.keys(updatePayload).length > 0) {
        const { error: updateError } = await supabase
          .from('invoices')
          .update(updatePayload)
          .eq('id', invoiceId)
          .eq('user_id', user.id);
        if (updateError) throw updateError;
      }

      if (invoiceData.items !== undefined) {
        const { error: delErr } = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoiceId);
        if (delErr) throw delErr;

        if (invoiceData.items.length > 0) {
          const items = invoiceData.items.map(item => ({
            invoice_id: invoiceId,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total: item.total,
          }));
          const { error: insErr } = await supabase
            .from('invoice_items')
            .insert(items);
          if (insErr) throw insErr;
        }
      }

      toast({
        title: 'Success',
        description: 'Invoice updated successfully',
      });
      await fetchInvoices();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update invoice';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      throw err;
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to delete invoices');
      }
      const { error: itemsErr } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId);
      if (itemsErr) throw itemsErr;

      const { error: invErr } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId)
        .eq('user_id', user.id);
      if (invErr) throw invErr;

      toast({
        title: 'Success',
        description: 'Invoice deleted',
      });
      await fetchInvoices();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete invoice';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      throw err;
    }
  };

  const deleteInvoices = async (invoiceIds: string[]) => {
    try {
      if (!user) {
        throw new Error('User must be authenticated to delete invoices');
      }
      if (!invoiceIds.length) return;
      const { error: itemsErr } = await supabase
        .from('invoice_items')
        .delete()
        .in('invoice_id', invoiceIds);
      if (itemsErr) throw itemsErr;

      const { error: invErr } = await supabase
        .from('invoices')
        .delete()
        .in('id', invoiceIds)
        .eq('user_id', user.id);
      if (invErr) throw invErr;

      toast({
        title: 'Success',
        description: 'Invoices deleted',
      });
      await fetchInvoices();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete invoices';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      throw err;
    }
  };

  const generateInvoiceNumber = useCallback((): string => {
    const year = new Date().getFullYear();
    const count = invoices.length + 1;
    return `INV-${year}-${String(count).padStart(4, '0')}`;
  }, [invoices.length]);

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
