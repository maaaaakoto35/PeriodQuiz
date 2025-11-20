import { createAdminClient } from '@/app/_lib/supabase/server-admin';

/**
 * question_displays レコードを作成する
 * 画面表示の開始時刻を記録
 */
export async function createQuestionDisplay(
  supabase: ReturnType<typeof createAdminClient>,
  questionId: number,
  periodId: number
): Promise<void> {
  const { error } = await supabase
    .from('question_displays')
    .insert({
      question_id: questionId,
      period_id: periodId,
      displayed_at: new Date().toISOString(),
      closed_at: null,
    });

  if (error) {
    throw new Error(`question_displays の作成に失敗しました: ${error.message}`);
  }
}
