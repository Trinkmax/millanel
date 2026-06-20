export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      categories: {
        Row: {
          active: boolean;
          created_at: string;
          description: string | null;
          featured: boolean;
          id: string;
          image_path: string | null;
          name: string;
          parent_id: string | null;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          description?: string | null;
          featured?: boolean;
          id?: string;
          image_path?: string | null;
          name: string;
          parent_id?: string | null;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          order_id: string;
          product_code: string | null;
          product_id: string | null;
          product_image: string | null;
          product_name: string;
          quantity: number;
          total: number;
          unit_price: number;
          variant_label: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          order_id: string;
          product_code?: string | null;
          product_id?: string | null;
          product_image?: string | null;
          product_name: string;
          quantity: number;
          total: number;
          unit_price: number;
          variant_label?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          admin_notes: string | null;
          created_at: string;
          customer_dni: string | null;
          customer_email: string;
          customer_name: string;
          customer_phone: string;
          delivered_at: string | null;
          discount: number;
          id: string;
          mp_payment_id: string | null;
          mp_preference_id: string | null;
          mp_status: string | null;
          notes: string | null;
          order_number: string;
          paid_at: string | null;
          payment_method: Database["public"]["Enums"]["payment_method"];
          payment_status: Database["public"]["Enums"]["payment_status"];
          shipped_at: string | null;
          shipping_address: Json | null;
          shipping_cost: number;
          shipping_method: Database["public"]["Enums"]["shipping_method"];
          shipping_zone_id: string | null;
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          admin_notes?: string | null;
          created_at?: string;
          customer_dni?: string | null;
          customer_email: string;
          customer_name: string;
          customer_phone: string;
          delivered_at?: string | null;
          discount?: number;
          id?: string;
          mp_payment_id?: string | null;
          mp_preference_id?: string | null;
          mp_status?: string | null;
          notes?: string | null;
          order_number?: string;
          paid_at?: string | null;
          payment_method: Database["public"]["Enums"]["payment_method"];
          payment_status?: Database["public"]["Enums"]["payment_status"];
          shipped_at?: string | null;
          shipping_address?: Json | null;
          shipping_cost?: number;
          shipping_method: Database["public"]["Enums"]["shipping_method"];
          shipping_zone_id?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          active: boolean;
          alternativa_a: string | null;
          alternativa_marca: string | null;
          category_id: string | null;
          code: string | null;
          created_at: string;
          description: string | null;
          featured: boolean;
          fragrance_number: number | null;
          id: string;
          images: Json;
          sizes: Json;
          is_new: boolean;
          name: string;
          price: number;
          promotion: string | null;
          reference_price: number | null;
          sale_price: number | null;
          search_vector: unknown;
          section: string | null;
          short_description: string | null;
          slug: string;
          stock: number;
          tags: string[];
          track_stock: boolean;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          alternativa_a?: string | null;
          alternativa_marca?: string | null;
          category_id?: string | null;
          code?: string | null;
          created_at?: string;
          description?: string | null;
          featured?: boolean;
          fragrance_number?: number | null;
          id?: string;
          images?: Json;
          sizes?: Json;
          is_new?: boolean;
          name: string;
          price: number;
          promotion?: string | null;
          reference_price?: number | null;
          sale_price?: number | null;
          section?: string | null;
          short_description?: string | null;
          slug: string;
          stock?: number;
          tags?: string[];
          track_stock?: boolean;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          role: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          role?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      settings: {
        Row: {
          key: string;
          updated_at: string;
          value: Json;
        };
        Insert: { key: string; updated_at?: string; value: Json };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
        Relationships: [];
      };
      shipping_zones: {
        Row: {
          active: boolean;
          base_cost: number;
          created_at: string;
          estimated_days: string | null;
          free_shipping_threshold: number | null;
          id: string;
          name: string;
          provinces: string[];
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          base_cost?: number;
          created_at?: string;
          estimated_days?: string | null;
          free_shipping_threshold?: number | null;
          id?: string;
          name: string;
          provinces?: string[];
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["shipping_zones"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      dashboard_metrics: { Args: { period?: string }; Returns: Json };
      is_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "shipped"
        | "delivered"
        | "cancelled";
      payment_method: "mercadopago" | "whatsapp" | "transfer" | "pickup_cash";
      payment_status:
        | "pending"
        | "in_process"
        | "paid"
        | "failed"
        | "refunded";
      shipping_method: "pickup" | "shipping";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

// Convenience type aliases
export type Product = Tables<"products">;
export type Category = Tables<"categories">;
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type Profile = Tables<"profiles">;
export type ShippingZone = Tables<"shipping_zones">;
export type Setting = Tables<"settings">;
