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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          run_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          run_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          run_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      kudos: {
        Row: {
          created_at: string
          id: string
          run_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          run_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          run_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kudos_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      local_legend_stats: {
        Row: {
          effort_count: number | null
          id: string
          is_local_legend: boolean | null
          last_effort_at: string | null
          segment_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          effort_count?: number | null
          id?: string
          is_local_legend?: boolean | null
          last_effort_at?: string | null
          segment_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          effort_count?: number | null
          id?: string
          is_local_legend?: boolean | null
          last_effort_at?: string | null
          segment_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_legend_stats_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      medals: {
        Row: {
          code: string
          created_at: string
          description: string | null
          earned_at: string
          icon: string | null
          id: string
          name: string
          run_id: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          name: string
          run_id?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          name?: string
          run_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medals_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_records: {
        Row: {
          achieved_at: string
          created_at: string
          distance_km: number | null
          distance_type: string
          id: string
          pace_per_km_seconds: number | null
          run_id: string | null
          time_seconds: number | null
          user_id: string
        }
        Insert: {
          achieved_at: string
          created_at?: string
          distance_km?: number | null
          distance_type: string
          id?: string
          pace_per_km_seconds?: number | null
          run_id?: string | null
          time_seconds?: number | null
          user_id: string
        }
        Update: {
          achieved_at?: string
          created_at?: string
          distance_km?: number | null
          distance_type?: string
          id?: string
          pace_per_km_seconds?: number | null
          run_id?: string | null
          time_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_records_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          id: string
          location: string | null
          total_distance_km: number | null
          total_runs: number | null
          total_time_seconds: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          id?: string
          location?: string | null
          total_distance_km?: number | null
          total_runs?: number | null
          total_time_seconds?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          id?: string
          location?: string | null
          total_distance_km?: number | null
          total_runs?: number | null
          total_time_seconds?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      runs: {
        Row: {
          average_speed_kph: number | null
          calories_burned: number | null
          created_at: string
          description: string | null
          distance_km: number
          duration_seconds: number
          elevation_gain_m: number | null
          ended_at: string | null
          id: string
          is_gps_tracked: boolean | null
          is_public: boolean | null
          map_snapshot_url: string | null
          notes: string | null
          pace_per_km_seconds: number | null
          route_polyline: string | null
          started_at: string
          temperature_celsius: number | null
          title: string | null
          updated_at: string
          user_id: string
          weather_conditions: string | null
        }
        Insert: {
          average_speed_kph?: number | null
          calories_burned?: number | null
          created_at?: string
          description?: string | null
          distance_km: number
          duration_seconds: number
          elevation_gain_m?: number | null
          ended_at?: string | null
          id?: string
          is_gps_tracked?: boolean | null
          is_public?: boolean | null
          map_snapshot_url?: string | null
          notes?: string | null
          pace_per_km_seconds?: number | null
          route_polyline?: string | null
          started_at: string
          temperature_celsius?: number | null
          title?: string | null
          updated_at?: string
          user_id: string
          weather_conditions?: string | null
        }
        Update: {
          average_speed_kph?: number | null
          calories_burned?: number | null
          created_at?: string
          description?: string | null
          distance_km?: number
          duration_seconds?: number
          elevation_gain_m?: number | null
          ended_at?: string | null
          id?: string
          is_gps_tracked?: boolean | null
          is_public?: boolean | null
          map_snapshot_url?: string | null
          notes?: string | null
          pace_per_km_seconds?: number | null
          route_polyline?: string | null
          started_at?: string
          temperature_celsius?: number | null
          title?: string | null
          updated_at?: string
          user_id?: string
          weather_conditions?: string | null
        }
        Relationships: []
      }
      segment_efforts: {
        Row: {
          created_at: string
          elapsed_time_seconds: number
          end_index: number | null
          id: string
          is_kom: boolean | null
          is_pr: boolean | null
          rank: number | null
          run_id: string | null
          segment_id: string
          start_index: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          elapsed_time_seconds: number
          end_index?: number | null
          id?: string
          is_kom?: boolean | null
          is_pr?: boolean | null
          rank?: number | null
          run_id?: string | null
          segment_id: string
          start_index?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          elapsed_time_seconds?: number
          end_index?: number | null
          id?: string
          is_kom?: boolean | null
          is_pr?: boolean | null
          rank?: number | null
          run_id?: string | null
          segment_id?: string
          start_index?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "segment_efforts_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "segment_efforts_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      segments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          distance_m: number
          elevation_gain_m: number | null
          end_lat: number
          end_lng: number
          id: string
          name: string
          polyline: string
          start_lat: number
          start_lng: number
          total_efforts: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          distance_m: number
          elevation_gain_m?: number | null
          end_lat: number
          end_lng: number
          id?: string
          name: string
          polyline: string
          start_lat: number
          start_lng: number
          total_efforts?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          distance_m?: number
          elevation_gain_m?: number | null
          end_lat?: number
          end_lng?: number
          id?: string
          name?: string
          polyline?: string
          start_lat?: number
          start_lng?: number
          total_efforts?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      trophies: {
        Row: {
          age_group: string | null
          category: string
          created_at: string
          distance_bucket: string
          earned_at: string
          id: string
          pace_per_km_seconds: number
          rank: number
          run_id: string | null
          user_id: string
        }
        Insert: {
          age_group?: string | null
          category: string
          created_at?: string
          distance_bucket: string
          earned_at?: string
          id?: string
          pace_per_km_seconds: number
          rank: number
          run_id?: string | null
          user_id: string
        }
        Update: {
          age_group?: string | null
          category?: string
          created_at?: string
          distance_bucket?: string
          earned_at?: string
          id?: string
          pace_per_km_seconds?: number
          rank?: number
          run_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
