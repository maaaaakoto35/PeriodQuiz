'use server';

import { createClient } from '@/app/_lib/supabase/server';
import { validateSession } from '../validateSession';
import { QuizScreen } from '@/app/_lib/types/quiz';

export interface GetQuizStatusResult {
  success: true;
  data: {
    eventId: number;
    currentScreen: QuizScreen;
    currentPeriodId: number | null;
    currentQuestionId: number | null;
  };
}

/**
 * 現在のクイズ状態を取得
 * quiz_control から current_screen, current_period_id, current_question_id を取得
 */
export async function getQuizStatus(
  eventId: number
): Promise<GetQuizStatusResult | { success: false; error: string }> {
  try {
    // セッション検証
    const sessionResult = await validateSession();
    if (!sessionResult.valid) {
      return {
        success: false,
        error: 'セッションが見つかりません',
      };
    }

    const supabase = await createClient();

    // quiz_control から状態を取得
    const { data: quizControl, error } = await supabase
      .from('quiz_control')
      .select('current_screen, current_period_id, current_question_id')
      .eq('event_id', eventId)
      .single();

    if (error || !quizControl) {
      return {
        success: false,
        error: 'クイズ状態が見つかりません',
      };
    }

    return {
      success: true,
      data: {
        eventId,
        currentScreen: quizControl.current_screen as QuizScreen,
        currentPeriodId: quizControl.current_period_id,
        currentQuestionId: quizControl.current_question_id,
      },
    };
  } catch (error) {
    console.error('[getQuizStatus] Error:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: '予期しないエラーが発生しました',
    };
  }
}
