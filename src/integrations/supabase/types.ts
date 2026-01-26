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
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          is_deleted: boolean
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_deleted?: boolean
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_deleted?: boolean
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      exercise_logs: {
        Row: {
          actual_reps: number | null
          completed: boolean
          created_at: string
          equipment: string
          exercise_name: string
          id: string
          notes: string | null
          rpe: number | null
          session_id: string
          set_number: number
          target_reps: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          actual_reps?: number | null
          completed?: boolean
          created_at?: string
          equipment: string
          exercise_name: string
          id?: string
          notes?: string | null
          rpe?: number | null
          session_id: string
          set_number: number
          target_reps?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          actual_reps?: number | null
          completed?: boolean
          created_at?: string
          equipment?: string
          exercise_name?: string
          id?: string
          notes?: string | null
          rpe?: number | null
          session_id?: string
          set_number?: number
          target_reps?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
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
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      help_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      help_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "help_conversations"
            referencedColumns: ["id"]
          },
        ]
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
      live_streams: {
        Row: {
          allow_comments: boolean | null
          created_at: string
          description: string | null
          ended_at: string | null
          id: string
          started_at: string | null
          status: string
          stream_key: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          viewer_count: number | null
          visibility: string
        }
        Insert: {
          allow_comments?: boolean | null
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          stream_key?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id: string
          viewer_count?: number | null
          visibility?: string
        }
        Update: {
          allow_comments?: boolean | null
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          stream_key?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          viewer_count?: number | null
          visibility?: string
        }
        Relationships: []
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
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          delivered_at: string | null
          id: string
          image_url: string | null
          is_deleted: boolean
          read_at: string | null
          sender_id: string
          status: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          image_url?: string | null
          is_deleted?: boolean
          read_at?: string | null
          sender_id: string
          status?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          image_url?: string | null
          is_deleted?: boolean
          read_at?: string | null
          sender_id?: string
          status?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          achieved_at: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_shared: boolean | null
          milestone_type: string
          title: string
          user_id: string
          value: number | null
          visibility: string | null
        }
        Insert: {
          achieved_at?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_shared?: boolean | null
          milestone_type: string
          title: string
          user_id: string
          value?: number | null
          visibility?: string | null
        }
        Update: {
          achieved_at?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_shared?: boolean | null
          milestone_type?: string
          title?: string
          user_id?: string
          value?: number | null
          visibility?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_kudos: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_kudos_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_enabled: boolean
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          updated_at: string
          user_id: string
          video_url: string | null
          visibility: string
        }
        Insert: {
          comments_enabled?: boolean
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
          visibility?: string
        }
        Update: {
          comments_enabled?: boolean
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
          visibility?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          id: string
          is_public: boolean
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
          is_public?: boolean
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
          is_public?: boolean
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
          comments_enabled: boolean
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
          visibility: string
          weather_conditions: string | null
        }
        Insert: {
          average_speed_kph?: number | null
          calories_burned?: number | null
          comments_enabled?: boolean
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
          visibility?: string
          weather_conditions?: string | null
        }
        Update: {
          average_speed_kph?: number | null
          calories_burned?: number | null
          comments_enabled?: boolean
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
          visibility?: string
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
      stories: {
        Row: {
          content: string | null
          created_at: string
          expires_at: string
          id: string
          image_url: string | null
          user_id: string
          video_url: string | null
          visibility: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          image_url?: string | null
          user_id: string
          video_url?: string | null
          visibility?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          image_url?: string | null
          user_id?: string
          video_url?: string | null
          visibility?: string
        }
        Relationships: []
      }
      training_programs: {
        Row: {
          created_at: string
          current_day: number | null
          current_week: number | null
          id: string
          is_active: boolean
          name: string
          overview: string | null
          program_data: Json
          started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_day?: number | null
          current_week?: number | null
          id?: string
          is_active?: boolean
          name: string
          overview?: string | null
          program_data: Json
          started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_day?: number | null
          current_week?: number | null
          id?: string
          is_active?: boolean
          name?: string
          overview?: string | null
          program_data?: Json
          started_at?: string | null
          updated_at?: string
          user_id?: string
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
      user_presence: {
        Row: {
          is_online: boolean
          last_seen: string
          user_id: string
        }
        Insert: {
          is_online?: boolean
          last_seen?: string
          user_id: string
        }
        Update: {
          is_online?: boolean
          last_seen?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          ai_feedback_enabled: boolean | null
          allow_comments_default: boolean | null
          allow_friend_requests: boolean | null
          allow_messages: string | null
          created_at: string
          default_stream_visibility: string | null
          id: string
          live_notifications_enabled: boolean | null
          notify_achievements: boolean | null
          notify_comments: boolean | null
          notify_friend_requests: boolean | null
          notify_likes: boolean | null
          notify_messages: boolean | null
          profile_visibility: string | null
          show_achievements_in_feed: boolean | null
          show_community_posts: boolean | null
          show_online_status: boolean | null
          show_stats_publicly: boolean | null
          stream_quality: string | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_feedback_enabled?: boolean | null
          allow_comments_default?: boolean | null
          allow_friend_requests?: boolean | null
          allow_messages?: string | null
          created_at?: string
          default_stream_visibility?: string | null
          id?: string
          live_notifications_enabled?: boolean | null
          notify_achievements?: boolean | null
          notify_comments?: boolean | null
          notify_friend_requests?: boolean | null
          notify_likes?: boolean | null
          notify_messages?: boolean | null
          profile_visibility?: string | null
          show_achievements_in_feed?: boolean | null
          show_community_posts?: boolean | null
          show_online_status?: boolean | null
          show_stats_publicly?: boolean | null
          stream_quality?: string | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_feedback_enabled?: boolean | null
          allow_comments_default?: boolean | null
          allow_friend_requests?: boolean | null
          allow_messages?: string | null
          created_at?: string
          default_stream_visibility?: string | null
          id?: string
          live_notifications_enabled?: boolean | null
          notify_achievements?: boolean | null
          notify_comments?: boolean | null
          notify_friend_requests?: boolean | null
          notify_likes?: boolean | null
          notify_messages?: boolean | null
          profile_visibility?: string | null
          show_achievements_in_feed?: boolean | null
          show_community_posts?: boolean | null
          show_online_status?: boolean | null
          show_stats_publicly?: boolean | null
          stream_quality?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
          workout_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          workout_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_comments_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_kudos: {
        Row: {
          created_at: string
          id: string
          user_id: string
          workout_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          workout_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_kudos_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          comments_enabled: boolean
          created_at: string
          day_name: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          notes: string | null
          program_id: string | null
          session_type: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
          visibility: string
          week_number: number
        }
        Insert: {
          comments_enabled?: boolean
          created_at?: string
          day_name: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          program_id?: string | null
          session_type: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
          visibility?: string
          week_number: number
        }
        Update: {
          comments_enabled?: boolean
          created_at?: string
          day_name?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          program_id?: string | null
          session_type?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
          visibility?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      are_friends: { Args: { user1: string; user2: string }; Returns: boolean }
      can_message_user: {
        Args: { recipient_id: string; sender_id: string }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { conv_id: string; user_uuid: string }
        Returns: boolean
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
