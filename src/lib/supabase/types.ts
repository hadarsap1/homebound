export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Enums: {
      property_status: PropertyStatus;
    };
    Views: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      families: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          invite_code?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          family_id: string | null;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          family_id?: string | null;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string | null;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_family_id_fkey";
            columns: ["family_id"];
            referencedRelation: "families";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };
      family_settings: {
        Row: {
          id: string;
          family_id: string;
          custom_tags: Json;
          custom_field_definitions: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          custom_tags?: Json;
          custom_field_definitions?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          custom_tags?: Json;
          custom_field_definitions?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "family_settings_family_id_fkey";
            columns: ["family_id"];
            referencedRelation: "families";
            referencedColumns: ["id"];
            isOneToOne: true;
          },
        ];
      };
      locations: {
        Row: {
          id: string;
          family_id: string;
          name: string;
          lat: number | null;
          lng: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          name: string;
          lat?: number | null;
          lng?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          name?: string;
          lat?: number | null;
          lng?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "locations_family_id_fkey";
            columns: ["family_id"];
            referencedRelation: "families";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };
      properties: {
        Row: {
          id: string;
          family_id: string;
          address: string;
          google_place_id: string | null;
          lat: number | null;
          lng: number | null;
          price: number | null;
          beds: number | null;
          baths: number | null;
          sqm: number | null;
          floor: number | null;
          parking: boolean;
          elevator: boolean;
          status: string;
          vibe_tags: string[];
          metadata: Json;
          images: string[];
          source_url: string | null;
          contact_phone: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          address: string;
          google_place_id?: string | null;
          lat?: number | null;
          lng?: number | null;
          price?: number | null;
          beds?: number | null;
          baths?: number | null;
          sqm?: number | null;
          floor?: number | null;
          parking?: boolean;
          elevator?: boolean;
          status?: string;
          vibe_tags?: string[];
          metadata?: Json;
          images?: string[];
          source_url?: string | null;
          contact_phone?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          address?: string;
          google_place_id?: string | null;
          lat?: number | null;
          lng?: number | null;
          price?: number | null;
          beds?: number | null;
          baths?: number | null;
          sqm?: number | null;
          floor?: number | null;
          parking?: boolean;
          elevator?: boolean;
          status?: string;
          vibe_tags?: string[];
          metadata?: Json;
          images?: string[];
          source_url?: string | null;
          contact_phone?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "properties_family_id_fkey";
            columns: ["family_id"];
            referencedRelation: "families";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };
      property_ratings: {
        Row: {
          id: string;
          property_id: string;
          profile_id: string;
          overall: number;
          location: number;
          condition: number;
          value: number;
          notes: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          profile_id: string;
          overall: number;
          location: number;
          condition: number;
          value: number;
          notes?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          profile_id?: string;
          overall?: number;
          location?: number;
          condition?: number;
          value?: number;
          notes?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_ratings_property_id_fkey";
            columns: ["property_id"];
            referencedRelation: "properties";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
          {
            foreignKeyName: "property_ratings_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };
      visit_checklists: {
        Row: {
          id: string;
          property_id: string;
          scheduled_at: string | null;
          completed: boolean;
          items: Json;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          scheduled_at?: string | null;
          completed?: boolean;
          items?: Json;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          scheduled_at?: string | null;
          completed?: boolean;
          items?: Json;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "visit_checklists_property_id_fkey";
            columns: ["property_id"];
            referencedRelation: "properties";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          family_id: string;
          assigned_to: string | null;
          title: string;
          description: string | null;
          due_date: string | null;
          completed: boolean;
          property_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          assigned_to?: string | null;
          title: string;
          description?: string | null;
          due_date?: string | null;
          completed?: boolean;
          property_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          assigned_to?: string | null;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          completed?: boolean;
          property_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_family_id_fkey";
            columns: ["family_id"];
            referencedRelation: "families";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey";
            columns: ["assigned_to"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };
    };
    Functions: {
      auth_family_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
  };
}

export type PropertyStatus =
  | "new"
  | "visited"
  | "interested"
  | "offer_made"
  | "rejected"
  | "archived";

export type CustomFieldDefinition = {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "select";
  options?: string[];
  entity: "property" | "rating" | "checklist";
};

export type ChecklistItem = {
  label: string;
  checked: boolean;
  notes?: string;
};

// Row types
export type Property = Database["public"]["Tables"]["properties"]["Row"] & {
  status: PropertyStatus;
};
export type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"];
export type PropertyUpdate = Database["public"]["Tables"]["properties"]["Update"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Family = Database["public"]["Tables"]["families"]["Row"];
export type FamilySettings = Database["public"]["Tables"]["family_settings"]["Row"] & {
  custom_tags: string[];
  custom_field_definitions: CustomFieldDefinition[];
};
export type PropertyRating = Database["public"]["Tables"]["property_ratings"]["Row"] & {
  metadata: Record<string, Json>;
};
export type VisitChecklist = Database["public"]["Tables"]["visit_checklists"]["Row"] & {
  items: ChecklistItem[];
};
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
