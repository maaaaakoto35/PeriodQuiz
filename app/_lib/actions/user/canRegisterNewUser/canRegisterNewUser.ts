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

  // イベント情報を確認（存在確認のみ）
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId)
    .single();

  if (eventError || !event) {
    return {
      canRegister: false,
      reason: 'イベントが見つかりません',
    };
  }

  return { canRegister: true };
}
