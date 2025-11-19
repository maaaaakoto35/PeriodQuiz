/**
 * Quiz related type definitions
 */

export type QuizScreen = 'waiting' | 'question' | 'answer' | 'break' | 'period_result' | 'final_result';

export interface QuizControl {
  id: number;
  event_id: number;
  current_screen: QuizScreen;
  current_period_id: number | null;
  current_question_id: number | null;
  question_displayed_at: string | null;
  question_closed_at: string | null;
  updated_at: string;
}

export interface QuestionDisplay {
  id: number;
  question_id: number;
  period_id: number;
  displayed_at: string;
  closed_at: string | null;
}
