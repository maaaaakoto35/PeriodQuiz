'use server';

import { createClient } from '@/app/_lib/supabase/server';

/**
 * 新規登録可否チェック結果の型
 */
export type CanRegisterResult =
  | { canRegister: true }
  | { canRegister: false; reason: string };

/**
 * 新規登録が可能かチェックする
 *
 * @param eventId - イベントID
 * @returns チェック結果
 */
export async function canRegisterNewUser(
  eventId: number
): Promise<CanRegisterResult> {
  const supabase = await createClient();

  // イベント情報を取得
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('allow_registration')
    .eq('id', eventId)
    .single();

  if (eventError || !event) {
    return {
      canRegister: false,
      reason: 'イベントが見つかりません',
    };
  }

  if (!event.allow_registration) {
    return {
      canRegister: false,
      reason: '現在、新規登録は受け付けていません',
    };
  }

  // クイズ進行状態を取得
  const { data: quizControl, error: controlError } = await supabase
    .from('quiz_control')
    .select('current_screen')
    .eq('event_id', eventId)
    .maybeSingle();

  if (controlError) {
    return {
      canRegister: false,
      reason: 'システムエラーが発生しました',
    };
  }

  // quiz_controlが存在し、waiting以外の画面の場合は登録不可
  if (quizControl && quizControl.current_screen !== 'waiting') {
    return {
      canRegister: false,
      reason: 'クイズが既に開始されています',
    };
  }

  return { canRegister: true };
}
