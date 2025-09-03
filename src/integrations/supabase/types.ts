export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          accessed_at: string | null
          id: string
          ip_address: unknown | null
          operation: string
          record_count: number | null
          record_id: string | null
          risk_score: number | null
          session_id: string | null
          suspicious_flags: Json | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          accessed_at?: string | null
          id?: string
          ip_address?: unknown | null
          operation: string
          record_count?: number | null
          record_id?: string | null
          risk_score?: number | null
          session_id?: string | null
          suspicious_flags?: Json | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_at?: string | null
          id?: string
          ip_address?: unknown | null
          operation?: string
          record_count?: number | null
          record_id?: string | null
          risk_score?: number | null
          session_id?: string | null
          suspicious_flags?: Json | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chart_of_accounts: {
        Row: {
          account_code: string
          account_name: string
          category: string
          created_at: string
          current_balance: number
          normal_balance: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_code: string
          account_name: string
          category: string
          created_at?: string
          current_balance?: number
          normal_balance: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_code?: string
          account_name?: string
          category?: string
          created_at?: string
          current_balance?: number
          normal_balance?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_transactions: {
        Row: {
          amount: number
          balance_after: number
          client_id: string
          created_at: string
          description: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          payment_method: string | null
          reference_number: string
          transaction_date: string
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_method?: string | null
          reference_number: string
          transaction_date?: string
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_method?: string | null
          reference_number?: string
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "major_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          accent_color: string | null
          address: string | null
          company_name: string
          created_at: string
          email: string | null
          id: string
          logo_base64: string | null
          logo_filename: string | null
          logo_path: string | null
          logo_position: string | null
          payment_settings: Json | null
          phone: string | null
          primary_color: string
          secondary_color: string | null
          tax_id: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          accent_color?: string | null
          address?: string | null
          company_name?: string
          created_at?: string
          email?: string | null
          id?: string
          logo_base64?: string | null
          logo_filename?: string | null
          logo_path?: string | null
          logo_position?: string | null
          payment_settings?: Json | null
          phone?: string | null
          primary_color?: string
          secondary_color?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          accent_color?: string | null
          address?: string | null
          company_name?: string
          created_at?: string
          email?: string | null
          id?: string
          logo_base64?: string | null
          logo_filename?: string | null
          logo_path?: string | null
          logo_position?: string | null
          payment_settings?: Json | null
          phone?: string | null
          primary_color?: string
          secondary_color?: string | null
          tax_id?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      leak_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          description: string | null
          id: string
          is_resolved: boolean | null
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          title: string
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      major_clients: {
        Row: {
          client_address: string | null
          client_contact_person: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          client_tax_id: string | null
          created_at: string
          credit_limit: number | null
          current_balance: number | null
          id: string
          is_active: boolean | null
          notes: string | null
          payment_terms: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_address?: string | null
          client_contact_person?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          client_tax_id?: string | null
          created_at?: string
          credit_limit?: number | null
          current_balance?: number | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          payment_terms?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_address?: string | null
          client_contact_person?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          client_tax_id?: string | null
          created_at?: string
          credit_limit?: number | null
          current_balance?: number | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          payment_terms?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suspicious_patterns: {
        Row: {
          created_at: string | null
          detection_query: string
          id: string
          is_active: boolean | null
          pattern_description: string | null
          pattern_name: string
          risk_weight: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          detection_query: string
          id?: string
          is_active?: boolean | null
          pattern_description?: string | null
          pattern_name: string
          risk_weight?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          detection_query?: string
          id?: string
          is_active?: boolean | null
          pattern_description?: string | null
          pattern_name?: string
          risk_weight?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transaction_lines: {
        Row: {
          account_code: string
          created_at: string
          credit_amount: number
          debit_amount: number
          id: string
          transaction_id: string
        }
        Insert: {
          account_code: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          id?: string
          transaction_id: string
        }
        Update: {
          account_code?: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_lines_account_code_fkey"
            columns: ["account_code"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["account_code"]
          },
          {
            foreignKeyName: "transaction_lines_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reference_number: string
          transaction_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reference_number: string
          transaction_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reference_number?: string
          transaction_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_audit_logs: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      can_access_company_settings: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      detect_data_leaks: {
        Args: Record<PropertyKey, never>
        Returns: {
          alert_id: string
          description: string
          detected_at: string
          leak_type: string
          severity: string
          user_email: string
        }[]
      }
      generate_reference_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_active_pattern_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      is_security_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_security_manager: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_data_access: {
        Args: {
          p_operation: string
          p_record_count?: number
          p_record_id?: string
          p_table_name: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
