'use server';

import { cookies } from 'next/headers';
import {
  verifyAdminSessionId,
  updateAdminSessionHeartbeat,
} from '@/app/_lib/supabase/server-admin';

/**
 * Admin 認証状態をチェック
 * 既存のセッション ID が有効か確認
 * @returns 認証結果
 */
export async function checkAdminAuth(): Promise<{
  authenticated: boolean;
  error?: string;
}> {
  try {
    const cookieStore = await cookies();

    // 既存の session_id がある場合は確認
    const existingSessionId = cookieStore.get('admin_session_id')?.value;

    if (!existingSessionId) {
      return {
        authenticated: false,
        error: 'セッションが見つかりません',
      };
    }

    // Service Role Key でセッションを検証
    const isValid = await verifyAdminSessionId(existingSessionId);

    if (!isValid) {
      // セッション期限切れ → Cookie を削除
      cookieStore.delete('admin_session_id');
      return {
        authenticated: false,
        error: 'セッション期限切れ',
      };
    }

    // ハートビートを更新
    await updateAdminSessionHeartbeat(existingSessionId);

    return { authenticated: true };
  } catch (error) {
    console.error('[checkAdminAuth] Error:', error);
    return {
      authenticated: false,
      error: 'サーバーエラーが発生しました',
    };
  }
}
