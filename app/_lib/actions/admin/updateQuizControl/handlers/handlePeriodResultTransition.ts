'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { Database } from '@/app/_lib/types/database';
import { getNextPeriod } from '../utils';

/**
 * period_result画面への遷移処理
 * - 次のピリオドを決定
 * - 次のピリオドがない場合は null を返す（最終結果画面へ）
 */
export async function handlePeriodResultTransition(
  supabase: ReturnType<typeof createAdminClient>,
  currentControl: Database['public']['Tables']['quiz_control']['Row'],
  eventId: number
): Promise<
  | { success: true; nextPeriodId: number | null }
  | { success: false; error: string }
> {
  try {
    const currentPeriodId = currentControl.current_period_id;

    if (!currentPeriodId) {
      return {
        success: false,
        error: 'ピリオド情報が見つかりません',
      };
    }

    const nextPeriodId = await getNextPeriod(supabase, currentPeriodId, eventId);

    // 次のピリオドが存在しない場合もnull返す
    return {
      success: true,
      nextPeriodId,
    };
  } catch (error) {
    console.error('[handlePeriodResultTransition] Error:', error);
    const message = error instanceof Error ? error.message : '不明なエラー';
    return {
      success: false,
      error: `ピリオド結果の次ピリオド決定に失敗しました: ${message}`,
    };
  }
}
