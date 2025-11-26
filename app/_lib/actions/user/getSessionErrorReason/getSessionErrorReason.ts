'use server';

import { createClient } from '@/app/_lib/supabase/server';

/**
 * セッションエラーの理由
 */
export type SessionErrorReason = 'session_expired' | null;

/**
 * セッションが無効な理由を判定する
 *
 * @param eventId - イベントID
 * @returns エラー理由（セッション有効な場合はnull）
 */
export async function getSessionErrorReason(
  eventId: number
): Promise<SessionErrorReason> {
  const supabase = await createClient();

  // イベント情報を確認
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId)
    .maybeSingle();

  if (eventError || !event) {
    // イベントが見つからない場合はsession_expiredと扱う
    return 'session_expired';
  }

  return null;
}
