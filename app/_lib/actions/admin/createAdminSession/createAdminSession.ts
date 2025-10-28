'use server';

import { createClient } from '@/app/_lib/supabase/server';

/**
 * Admin セッションを作成
 * Basic認証後、セッションをadmin_sessionsテーブルに記録
 * @param username - Admin ユーザー名（環境変数ADMIN_USERNAMEの値）
 * @returns セッション作成結果
 */
export async function createAdminSession(
  username: string
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    // 入力検証
    if (!username) {
      return {
        success: false,
        error: 'ユーザー名は必須です',
      };
    }

    const supabase = await createClient();

    const sessionId = crypto.randomUUID();

    // 7日後を expires_at に設定
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // admin_sessions テーブルに挿入
    const { data, error: sessionError } = await supabase
      .from('admin_sessions')
      .insert({
        session_id: sessionId,
        last_active_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select('session_id')
      .single();

    if (sessionError) {
      console.error('[createAdminSession] DB Error:', sessionError);
      return {
        success: false,
        error: 'セッション作成に失敗しました',
      };
    }

    return {
      success: true,
      sessionId: (data as { session_id: string }).session_id,
    };
  } catch (error) {
    console.error('[createAdminSession] Error:', error);
    return {
      success: false,
      error: 'サーバーエラーが発生しました',
    };
  }
}
