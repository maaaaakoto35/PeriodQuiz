'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { Database } from '@/app/_lib/types/database';

/**
 * answer画面への遷移処理
 * - question_displays.closed_at を更新して問題終了時刻を記録
 * - period_id と question_id の両方を条件に指定して正確なレコードを更新
 */
export async function handleAnswerTransition(
  supabase: ReturnType<typeof createAdminClient>,
  currentControl: Database['public']['Tables']['quiz_control']['Row']
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const currentPeriodId = currentControl.current_period_id;
    const currentQuestionId = currentControl.current_question_id;

    if (!currentPeriodId || !currentQuestionId) {
      return {
        success: false,
        error: '現在の状態が不正です',
      };
    }

    // question_displays の closed_at を update
    // period_id と question_id の両方を条件に指定して確実に更新
    const { error: displayError } = await supabase
      .from('question_displays')
      .update({
        closed_at: new Date().toISOString(),
      })
      .eq('period_id', currentPeriodId)
      .eq('question_id', currentQuestionId);

    if (displayError) {
      console.error('[handleAnswerTransition] Display update error:', displayError);
      return {
        success: false,
        error: '問題表示記録の更新に失敗しました',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('[handleAnswerTransition] Error:', error);
    const message = error instanceof Error ? error.message : '不明なエラー';
    return {
      success: false,
      error: `answer画面への遷移に失敗しました: ${message}`,
    };
  }
}
