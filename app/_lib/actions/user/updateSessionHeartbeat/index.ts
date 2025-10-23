'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/app/_lib/supabase/server';
import { SESSION_COOKIE_NAME } from '../session.constants';

/**
 * セッションの最終アクティブ時刻を更新する
 *
 * セキュリティ: このアクションは Server Action で実行され、
 * - セッションIDの検証を行う
 * - 現在のユーザーの last_active_at のみを更新
 * - ニックネームやその他のカラムは更新不可
 *
 * @returns 成功/失敗
 */
export async function updateSessionHeartbeat(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
      return {
        success: false,
        error: 'セッションが見つかりません',
      };
    }

    // セッションIDが一致するユーザーのみを更新
    const { error } = await supabase
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('session_id', sessionId)
      .throwOnError();

    if (error) {
      console.error('Failed to update session heartbeat:', error);
      return {
        success: false,
        error: 'セッション更新に失敗しました',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Session heartbeat error:', error);
    return {
      success: false,
      error: 'セッション更新に失敗しました',
    };
  }
}
