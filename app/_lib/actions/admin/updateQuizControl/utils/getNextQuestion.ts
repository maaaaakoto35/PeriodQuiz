import { createAdminClient } from '@/app/_lib/supabase/server-admin';

/**
 * 次の問題IDを取得する
 * 現在の問題より order_num が大きい問題を同じピリオド内で取得
 * 次の問題がない場合は null を返す
 */
export async function getNextQuestion(
  supabase: ReturnType<typeof createAdminClient>,
  periodId: number,
  currentQuestionId: number | null
): Promise<number | null> {
  // currentQuestionId がない場合は第1問を取得
  if (!currentQuestionId) {
    const { data: firstQuestion, error: firstError } = await supabase
      .from('period_questions')
      .select('question_id')
      .eq('period_id', periodId)
      .order('order_num', { ascending: true })
      .limit(1)
      .single();

    if (firstError || !firstQuestion) {
      throw new Error('問題が見つかりません');
    }

    return firstQuestion.question_id;
  }

  // 現在の問題の order_num を取得
  const { data: currentQuestion, error: currentError } = await supabase
    .from('period_questions')
    .select('order_num')
    .eq('period_id', periodId)
    .eq('question_id', currentQuestionId)
    .single();

  if (currentError || !currentQuestion) {
    throw new Error('現在の問題情報が見つかりません');
  }

  // 次の問題を取得
  const { data: nextQuestion, error: nextError } = await supabase
    .from('period_questions')
    .select('question_id')
    .eq('period_id', periodId)
    .gt('order_num', currentQuestion.order_num)
    .order('order_num', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (nextError) {
    throw new Error('問題情報の取得に失敗しました');
  }

  // 次の問題が存在しない場合は null を返す（ピリオド結果画面へ）
  return nextQuestion?.question_id ?? null;
}
