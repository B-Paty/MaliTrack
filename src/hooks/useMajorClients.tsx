import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MajorClient {
  id: string;
  user_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  client_contact_person?: string;
  client_tax_id?: string;
  credit_limit: number;
  current_balance: number;
  payment_terms: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMajorClientData {
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  client_contact_person?: string;
  client_tax_id?: string;
  credit_limit?: number;
  payment_terms?: number;
  notes?: string;
}

export function useMajorClients() {
  const [clients, setClients] = useState<MajorClient[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('major_clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching major clients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch major clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientData: CreateMajorClientData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('major_clients')
        .insert([
          {
            ...clientData,
            user_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setClients(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding major client:', error);
      throw error;
    }
  };

  const updateClient = async (id: string, updates: Partial<CreateMajorClientData>) => {
    try {
      const { data, error } = await supabase
        .from('major_clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setClients(prev => prev.map(client => 
        client.id === id ? data : client
      ));
      return data;
    } catch (error) {
      console.error('Error updating major client:', error);
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('major_clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setClients(prev => prev.filter(client => client.id !== id));
    } catch (error) {
      console.error('Error deleting major client:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    addClient,
    updateClient,
    deleteClient,
    refetch: fetchClients,
  };
}