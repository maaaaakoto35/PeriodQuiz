export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_sessions: {
        Row: {
          id: string
          session_id: string
          last_active_at: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          session_id: string
          last_active_at?: string
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          session_id?: string
          last_active_at?: string
          created_at?: string
          expires_at?: string
        }
        Relationships: []
      }
      answers: {
        Row: {
          answered_at: string
          choice_id: number
          id: number
          is_correct: boolean
          question_id: number
          response_time_ms: number
          user_id: number
        }
        Insert: {
          answered_at?: string
          choice_id: number
          id?: number
          is_correct: boolean
          question_id: number
          response_time_ms: number
          user_id: number
        }
        Update: {
          answered_at?: string
          choice_id?: number
          id?: number
          is_correct?: boolean
          question_id?: number
          response_time_ms?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "answers_choice_id_fkey"
            columns: ["choice_id"]
            isOneToOne: false
            referencedRelation: "choices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "event_rankings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "period_rankings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      choices: {
        Row: {
          created_at: string
          id: number
          image_url: string | null
          is_correct: boolean
          order_num: number
          question_id: number
          text: string
        }
        Insert: {
          created_at?: string
          id?: number
          image_url?: string | null
          is_correct?: boolean
          order_num: number
          question_id: number
          text: string
        }
        Update: {
          created_at?: string
          id?: number
          image_url?: string | null
          is_correct?: boolean
          order_num?: number
          question_id?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "choices_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_break_images: {
        Row: {
          created_at: string
          id: string
          event_id: number
          image_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          event_id: number
          image_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          event_id?: number
          image_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_break_images_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      period_questions: {
        Row: {
          created_at: string
          id: number
          order_num: number
          period_id: number
          question_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          order_num: number
          period_id: number
          question_id: number
        }
        Update: {
          created_at?: string
          id?: number
          order_num?: number
          period_id?: number
          question_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "period_questions_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "period_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      periods: {
        Row: {
          created_at: string
          event_id: number
          id: number
          name: string
          order_num: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: number
          id?: number
          name: string
          order_num: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: number
          id?: number
          name?: string
          order_num?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "periods_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      question_displays: {
        Row: {
          closed_at: string | null
          displayed_at: string
          id: number
          period_id: number
          question_id: number
        }
        Insert: {
          closed_at?: string | null
          displayed_at?: string
          id?: number
          period_id: number
          question_id: number
        }
        Update: {
          closed_at?: string | null
          displayed_at?: string
          id?: number
          period_id?: number
          question_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_displays_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_displays_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string
          explanation: string | null
          id: number
          image_url: string | null
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explanation?: string | null
          id?: number
          image_url?: string | null
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explanation?: string | null
          id?: number
          image_url?: string | null
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_control: {
        Row: {
          bgm_enabled: boolean
          current_period_id: number | null
          current_question_id: number | null
          current_screen: string
          event_id: number
          id: number
          question_closed_at: string | null
          question_displayed_at: string | null
          updated_at: string
        }
        Insert: {
          bgm_enabled?: boolean
          current_period_id?: number | null
          current_question_id?: number | null
          current_screen?: string
          event_id: number
          id?: number
          question_closed_at?: string | null
          question_displayed_at?: string | null
          updated_at?: string
        }
        Update: {
          bgm_enabled?: boolean
          current_period_id?: number | null
          current_question_id?: number | null
          current_screen?: string
          event_id?: number
          id?: number
          question_closed_at?: string | null
          question_displayed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_control_current_period_id_fkey"
            columns: ["current_period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_control_current_question_id_fkey"
            columns: ["current_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_control_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          event_id: number
          id: number
          last_active_at: string
          nickname: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          event_id: number
          id?: number
          last_active_at?: string
          nickname: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: number
          id?: number
          last_active_at?: string
          nickname?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      event_rankings: {
        Row: {
          answered_count: number | null
          correct_count: number | null
          event_id: number | null
          nickname: string | null
          total_response_time_ms: number | null
          user_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "users_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      period_rankings: {
        Row: {
          answered_count: number | null
          correct_count: number | null
          event_id: number | null
          nickname: string | null
          period_id: number | null
          total_response_time_ms: number | null
          user_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "period_questions_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_unanswered_time: {
        Args: { p_period_id: number; p_question_id: number }
        Returns: number
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

