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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          client_id: string | null
          client_name: string
          client_note: string | null
          client_phone: string | null
          coupon_code: string | null
          created_at: string
          discount: number
          duration_min: number
          ends_at: string
          id: string
          payment_method: string | null
          price: number
          service_id: string | null
          service_name: string
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          studio_id: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          client_name?: string
          client_note?: string | null
          client_phone?: string | null
          coupon_code?: string | null
          created_at?: string
          discount?: number
          duration_min?: number
          ends_at: string
          id?: string
          payment_method?: string | null
          price?: number
          service_id?: string | null
          service_name?: string
          starts_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          studio_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          client_name?: string
          client_note?: string | null
          client_phone?: string | null
          coupon_code?: string | null
          created_at?: string
          discount?: number
          duration_min?: number
          ends_at?: string
          id?: string
          payment_method?: string | null
          price?: number
          service_id?: string | null
          service_name?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          studio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_times: {
        Row: {
          all_day: boolean
          created_at: string
          ends_at: string
          id: string
          reason: string
          starts_at: string
          studio_id: string
        }
        Insert: {
          all_day?: boolean
          created_at?: string
          ends_at: string
          id?: string
          reason?: string
          starts_at: string
          studio_id: string
        }
        Update: {
          all_day?: boolean
          created_at?: string
          ends_at?: string
          id?: string
          reason?: string
          starts_at?: string
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_times_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      business_hours: {
        Row: {
          active: boolean
          break_end: string | null
          break_start: string | null
          end_time: string
          id: string
          start_time: string
          studio_id: string
          weekday: number
        }
        Insert: {
          active?: boolean
          break_end?: string | null
          break_start?: string | null
          end_time?: string
          id?: string
          start_time?: string
          studio_id: string
          weekday: number
        }
        Update: {
          active?: boolean
          break_end?: string | null
          break_start?: string | null
          end_time?: string
          id?: string
          start_time?: string
          studio_id?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "business_hours_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          ends_on: string | null
          id: string
          max_uses: number | null
          service_id: string | null
          starts_on: string | null
          studio_id: string
          type: Database["public"]["Enums"]["coupon_type"]
          uses: number
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          ends_on?: string | null
          id?: string
          max_uses?: number | null
          service_id?: string | null
          starts_on?: string | null
          studio_id: string
          type?: Database["public"]["Enums"]["coupon_type"]
          uses?: number
          value?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          ends_on?: string | null
          id?: string
          max_uses?: number | null
          service_id?: string | null
          starts_on?: string | null
          studio_id?: string
          type?: Database["public"]["Enums"]["coupon_type"]
          uses?: number
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "coupons_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_notes: {
        Row: {
          appointment_id: string | null
          client_id: string | null
          content: string
          created_at: string
          id: string
          studio_id: string
        }
        Insert: {
          appointment_id?: string | null
          client_id?: string | null
          content: string
          created_at?: string
          id?: string
          studio_id: string
        }
        Update: {
          appointment_id?: string | null
          client_id?: string | null
          content?: string
          created_at?: string
          id?: string
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_notes_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          audience: string
          body: string
          created_at: string
          id: string
          read: boolean
          studio_id: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          audience?: string
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          studio_id?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          audience?: string
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          studio_id?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          client_id: string | null
          id: string
          method: string
          paid_at: string
          service_name: string
          studio_id: string
        }
        Insert: {
          amount?: number
          appointment_id?: string | null
          client_id?: string | null
          id?: string
          method?: string
          paid_at?: string
          service_name?: string
          studio_id: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          client_id?: string | null
          id?: string
          method?: string
          paid_at?: string
          service_name?: string
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_categories: {
        Row: {
          id: string
          name: string
          sort_order: number
          studio_id: string
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
          studio_id: string
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
          studio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_categories_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          category_id: string | null
          created_at: string
          description: string
          id: string
          image_url: string
          media_type: string
          sort_order: number
          studio_id: string
          title: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url: string
          media_type?: string
          sort_order?: number
          studio_id: string
          title?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          media_type?: string
          sort_order?: number
          studio_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "portfolio_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_items_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          instagram: string | null
          phone: string | null
          studio_id: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          instagram?: string | null
          phone?: string | null
          studio_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          instagram?: string | null
          phone?: string | null
          studio_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string
          duration_min: number
          id: string
          image_url: string | null
          name: string
          price: number
          sort_order: number
          studio_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string
          duration_min?: number
          id?: string
          image_url?: string | null
          name: string
          price?: number
          sort_order?: number
          studio_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string
          duration_min?: number
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          sort_order?: number
          studio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studios: {
        Row: {
          address: string
          buffer_minutes: number
          cancel_min_hours: number
          cancellation_policy: string
          city: string
          client_can_cancel: boolean
          cover_url: string | null
          created_at: string
          description: string
          id: string
          instagram: string
          logo_url: string | null
          loyalty_benefit: string
          loyalty_enabled: boolean
          loyalty_target: number
          loyalty_validity_days: number
          name: string
          payment_methods: string[]
          professional_name: string
          reschedule_min_hours: number
          slot_step_minutes: number
          slug: string
          subtitle: string
          tagline: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          address?: string
          buffer_minutes?: number
          cancel_min_hours?: number
          cancellation_policy?: string
          city?: string
          client_can_cancel?: boolean
          cover_url?: string | null
          created_at?: string
          description?: string
          id?: string
          instagram?: string
          logo_url?: string | null
          loyalty_benefit?: string
          loyalty_enabled?: boolean
          loyalty_target?: number
          loyalty_validity_days?: number
          name: string
          payment_methods?: string[]
          professional_name?: string
          reschedule_min_hours?: number
          slot_step_minutes?: number
          slug: string
          subtitle?: string
          tagline?: string
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          address?: string
          buffer_minutes?: number
          cancel_min_hours?: number
          cancellation_policy?: string
          city?: string
          client_can_cancel?: boolean
          cover_url?: string | null
          created_at?: string
          description?: string
          id?: string
          instagram?: string
          logo_url?: string | null
          loyalty_benefit?: string
          loyalty_enabled?: boolean
          loyalty_target?: number
          loyalty_validity_days?: number
          name?: string
          payment_methods?: string[]
          professional_name?: string
          reschedule_min_hours?: number
          slot_step_minutes?: number
          slug?: string
          subtitle?: string
          tagline?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          studio_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          studio_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          studio_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      busy_ranges: {
        Args: { _from: string; _studio: string; _to: string }
        Returns: {
          ends_at: string
          starts_at: string
        }[]
      }
      coupon_discount: {
        Args: {
          _amount: number
          _code: string
          _service: string
          _studio: string
        }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_studio_admin: { Args: { _studio: string }; Returns: boolean }
      my_studio_id: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "admin" | "client"
      appointment_status:
        | "agendado"
        | "confirmado"
        | "concluido"
        | "cancelado"
        | "nao_compareceu"
      coupon_type: "percent" | "fixed"
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
    Enums: {
      app_role: ["admin", "client"],
      appointment_status: [
        "agendado",
        "confirmado",
        "concluido",
        "cancelado",
        "nao_compareceu",
      ],
      coupon_type: ["percent", "fixed"],
    },
  },
} as const
