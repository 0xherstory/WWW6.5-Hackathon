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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      blockchain_records: {
        Row: {
          block_number: number | null
          chain_name: string
          content_hash: string
          contract_address: string | null
          created_at: string
          id: string
          tx_hash: string
          user_id: string
          work_id: string
        }
        Insert: {
          block_number?: number | null
          chain_name?: string
          content_hash: string
          contract_address?: string | null
          created_at?: string
          id?: string
          tx_hash: string
          user_id: string
          work_id: string
        }
        Update: {
          block_number?: number | null
          chain_name?: string
          content_hash?: string
          contract_address?: string | null
          created_at?: string
          id?: string
          tx_hash?: string
          user_id?: string
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blockchain_records_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "music_works"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
          work_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
          work_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "music_works"
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
      music_works: {
        Row: {
          audio_url: string | null
          chord_progression: string | null
          created_at: string
          description: string | null
          hash: string | null
          id: string
          is_on_chain: boolean
          is_public: boolean
          lyrics: string | null
          title: string
          updated_at: string
          user_id: string
          work_type: string
        }
        Insert: {
          audio_url?: string | null
          chord_progression?: string | null
          created_at?: string
          description?: string | null
          hash?: string | null
          id?: string
          is_on_chain?: boolean
          is_public?: boolean
          lyrics?: string | null
          title?: string
          updated_at?: string
          user_id: string
          work_type?: string
        }
        Update: {
          audio_url?: string | null
          chord_progression?: string | null
          created_at?: string
          description?: string | null
          hash?: string | null
          id?: string
          is_on_chain?: boolean
          is_public?: boolean
          lyrics?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          work_type?: string
        }
        Relationships: []
      }
      plagiarism_reports: {
        Row: {
          chord_score: number | null
          created_at: string
          details: Json | null
          emotion_score: number | null
          id: string
          lyrics_score: number | null
          melody_score: number | null
          overall_score: number | null
          rhythm_score: number | null
          timbre_score: number | null
          user_id: string
          work_id: string
        }
        Insert: {
          chord_score?: number | null
          created_at?: string
          details?: Json | null
          emotion_score?: number | null
          id?: string
          lyrics_score?: number | null
          melody_score?: number | null
          overall_score?: number | null
          rhythm_score?: number | null
          timbre_score?: number | null
          user_id: string
          work_id: string
        }
        Update: {
          chord_score?: number | null
          created_at?: string
          details?: Json | null
          emotion_score?: number | null
          id?: string
          lyrics_score?: number | null
          melody_score?: number | null
          overall_score?: number | null
          rhythm_score?: number | null
          timbre_score?: number | null
          user_id?: string
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plagiarism_reports_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "music_works"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
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
