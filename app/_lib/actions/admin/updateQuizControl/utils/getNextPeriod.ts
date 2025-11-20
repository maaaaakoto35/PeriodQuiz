import { createAdminClient } from '@/app/_lib/supabase/server-admin';

/**
 * 次のピリオドIDを取得する
 * 現在のピリオドより order_num が大きいピリオドを取得
 */
export async function getNextPeriod(
  supabase: ReturnType<typeof createAdminClient>,
  currentPeriodId: number,
  eventId: number
): Promise<number | null> {
  // 現在のピリオドの order_num を取得
  const { data: currentPeriod, error: currentError } = await supabase
    .from('periods')
    .select('order_num')
    .eq('id', currentPeriodId)
    .single();

  if (currentError || !currentPeriod) {
    throw new Error('ピリオド情報が見つかりません');
  }

  // 次のピリオドを取得
  const { data: nextPeriod, error: nextError } = await supabase
    .from('periods')
    .select('id')
    .eq('event_id', eventId)
    .gt('order_num', currentPeriod.order_num)
    .order('order_num', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (nextError) {
    throw new Error('ピリオド情報の取得に失敗しました');
  }

  // 次のピリオドが存在しない場合は null を返す（最終結果画面へ）
  return nextPeriod?.id ?? null;
}
