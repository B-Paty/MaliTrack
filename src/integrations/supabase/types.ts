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
      company_settings: {
        Row: {
          company_name: string
          created_at: string
          id: string
          logo_filename: string | null
          logo_path: string | null
          logo_base64: string | null
          primary_color: string
          secondary_color: string | null
          accent_color: string | null
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          tax_id: string | null
          logo_position: string | null
          updated_at: string
          user_id: string
          payment_settings: Json | null
        }
        Insert: {
          company_name?: string
          created_at?: string
          id?: string
          logo_filename?: string | null
          logo_path?: string | null
          logo_base64?: string | null
          primary_color?: string
          secondary_color?: string | null
          accent_color?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          tax_id?: string | null
          logo_position?: string | null
          updated_at?: string
          user_id: string
          payment_settings?: Json | null
        }
        Update: {
          company_name?: string
          created_at?: string
          id?: string
          logo_filename?: string | null
          logo_path?: string | null
          logo_base64?: string | null
          primary_color?: string
          secondary_color?: string | null
          accent_color?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          tax_id?: string | null
          logo_position?: string | null
          updated_at?: string
          user_id?: string
          payment_settings?: Json | null
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