export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          name: string
          description: string
          status: 'draft' | 'active' | 'paused' | 'completed'
          allow_registration: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          status?: 'draft' | 'active' | 'paused' | 'completed'
          allow_registration?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          status?: 'draft' | 'active' | 'paused' | 'completed'
          allow_registration?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      periods: {
        Row: {
          id: string
          event_id: string
          name: string
          order_num: number
          status: 'pending' | 'active' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          order_num: number
          status?: 'pending' | 'active' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          order_num?: number
          status?: 'pending' | 'active' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          text: string
          image_url: string | null
          explanation: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          text: string
          image_url?: string | null
          explanation?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          text?: string
          image_url?: string | null
          explanation?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      choices: {
        Row: {
          id: string
          question_id: string
          text: string
          image_url: string | null
          is_correct: boolean
          order_num: number
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          text: string
          image_url?: string | null
          is_correct?: boolean
          order_num: number
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          text?: string
          image_url?: string | null
          is_correct?: boolean
          order_num?: number
          created_at?: string
        }
      }
      period_questions: {
        Row: {
          id: string
          period_id: string
          question_id: string
          order_num: number
          created_at: string
        }
        Insert: {
          id?: string
          period_id: string
          question_id: string
          order_num: number
          created_at?: string
        }
        Update: {
          id?: string
          period_id?: string
          question_id?: string
          order_num?: number
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          event_id: string
          nickname: string
          created_at: string
          last_active_at: string
        }
        Insert: {
          id?: string
          event_id: string
          nickname: string
          created_at?: string
          last_active_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          nickname?: string
          created_at?: string
          last_active_at?: string
        }
      }
      answers: {
        Row: {
          id: string
          user_id: string
          question_id: string
          choice_id: string
          is_correct: boolean
          answered_at: string
          response_time_ms: number
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          choice_id: string
          is_correct: boolean
          answered_at?: string
          response_time_ms: number
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          choice_id?: string
          is_correct?: boolean
          answered_at?: string
          response_time_ms?: number
        }
      }
      quiz_control: {
        Row: {
          id: string
          event_id: string
          current_screen: 'waiting' | 'question' | 'answer' | 'period_result' | 'final_result'
          current_period_id: string | null
          current_question_id: string | null
          question_displayed_at: string | null
          question_closed_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          current_screen?: 'waiting' | 'question' | 'answer' | 'period_result' | 'final_result'
          current_period_id?: string | null
          current_question_id?: string | null
          question_displayed_at?: string | null
          question_closed_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          current_screen?: 'waiting' | 'question' | 'answer' | 'period_result' | 'final_result'
          current_period_id?: string | null
          current_question_id?: string | null
          question_displayed_at?: string | null
          question_closed_at?: string | null
          updated_at?: string
        }
      }
      question_displays: {
        Row: {
          id: string
          question_id: string
          period_id: string
          displayed_at: string
          closed_at: string | null
        }
        Insert: {
          id?: string
          question_id: string
          period_id: string
          displayed_at?: string
          closed_at?: string | null
        }
        Update: {
          id?: string
          question_id?: string
          period_id?: string
          displayed_at?: string
          closed_at?: string | null
        }
      }
    }
    Views: {
      period_rankings: {
        Row: {
          event_id: string
          period_id: string
          user_id: string
          nickname: string
          correct_count: number
          total_response_time_ms: number
          answered_count: number
        }
      }
      event_rankings: {
        Row: {
          event_id: string
          user_id: string
          nickname: string
          correct_count: number
          total_response_time_ms: number
          answered_count: number
        }
      }
    }
    Functions: {
      get_unanswered_time: {
        Args: {
          p_question_id: string
          p_period_id: string
        }
        Returns: number
      }
    }
  }
}
