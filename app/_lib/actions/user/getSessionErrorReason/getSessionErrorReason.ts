'use server';

import { createClient } from '@/app/_lib/supabase/server';

/**
 * セッションエラーの理由
 */
export type SessionErrorReason = 'quiz_started' | 'session_expired' | null;

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

  // クイズ進行状態を取得
  const { data: quizControl, error: controlError } = await supabase
    .from('quiz_control')
    .select('current_screen')
    .eq('event_id', eventId)
    .maybeSingle();

  if (controlError) {
    // エラーが発生した場合はsession_expiredと扱う
    return 'session_expired';
  }

  // quiz_controlが存在し、waiting以外の画面の場合
  if (quizControl && quizControl.current_screen !== 'waiting') {
    return 'quiz_started';
  }

  return null;
}
