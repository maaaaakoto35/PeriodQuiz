'use server';

import { createClient } from '@/app/_lib/supabase/server';

/**
 * Admin セッションを作成
 * admin_users テーブルからユーザーを取得（ない場合は作成）してセッションを作成
 * @param username - Admin ユーザー名
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
    // admin_users テーブルから該当ユーザーを取得
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('username', username)
      .single();

    // ユーザーを取得または作成
    let adminUserId: string;

    if (existingUser) {
      adminUserId = (existingUser as { id: string }).id;
    } else {
      const { data: newUser, error: insertError } = await supabase
        .from('admin_users')
        .insert({
          username,
        })
        .select('id')
        .single();

      if (insertError || !newUser) {
        console.error('[createAdminSession] Failed to create admin user:', insertError);
        return {
          success: false,
          error: 'ユーザー作成に失敗しました',
        };
      }

      adminUserId = (newUser as { id: string }).id;
    }

    const sessionId = crypto.randomUUID();

    // 1 週間後を expires_at に設定
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // admin_sessions テーブルに挿入
    const { data, error: sessionError } = await supabase
      .from('admin_sessions')
      .insert({
        admin_user_id: adminUserId,
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
