'use server';

import { headers, cookies } from 'next/headers';
import { createClient } from '@/app/_lib/supabase/server';

/**
 * Admin 認証状態をチェック
 * 既存のセッションがあれば確認、なければ Basic 認証で新規セッションを作成
 * @returns 認証結果
 */
export async function checkAdminAuth(): Promise<{
  authenticated: boolean;
  error?: string;
}> {
  try {
    const headersList = await headers();
    const cookieStore = await cookies();

    // 既存の session_id がある場合は確認
    const existingSessionId = cookieStore.get('admin_session_id')?.value;

    if (existingSessionId) {
      // セッションが有効か確認
      const supabase = await createClient();
      const { data: session, error } = await supabase
        .from('admin_sessions')
        .select('id, last_active_at, expires_at')
        .eq('session_id', existingSessionId)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error) {
        console.error('[checkAdminAuth] Session lookup error:', error);
      }

      if (session) {
        // セッションが有効 → heartbeat を更新
        const supabase = await createClient();
        const { error: updateError } = await supabase
          .from('admin_sessions')
          .update({ last_active_at: new Date().toISOString() })
          .eq('session_id', existingSessionId);

        if (updateError) {
          console.error('[checkAdminAuth] Heartbeat error:', updateError);
        }

        return { authenticated: true };
      }

      // セッション期限切れ → Cookie を削除
      cookieStore.delete('admin_session_id');
    }

    // Basic 認証ヘッダーを確認
    const authHeader = headersList.get('authorization');
    if (!authHeader?.startsWith('Basic ')) {
      return {
        authenticated: false,
        error: 'Basic 認証が必要です',
      };
    }

    // Base64 デコード
    const credentials = Buffer.from(authHeader.slice(6), 'base64').toString(
      'utf8'
    );
    const [username, password] = credentials.split(':');

    if (!username || !password) {
      return {
        authenticated: false,
        error: '無効な認証情報です',
      };
    }

    // 動的 import で循環依存を回避
    const { verifyAdminCredentials } = await import(
      '../verifyAdminCredentials'
    );
    const { createAdminSession } = await import('../createAdminSession');

    // ユーザー認証
    const authResult = await verifyAdminCredentials(username, password);
    if (!authResult.success) {
      return {
        authenticated: false,
        error: authResult.error,
      };
    }

    // セッション作成（username を渡す）
    const sessionResult = await createAdminSession(authResult.username!);
    if (!sessionResult.success) {
      return {
        authenticated: false,
        error: sessionResult.error,
      };
    }

    // Cookie に保存（httpOnly）
    cookieStore.set('admin_session_id', sessionResult.sessionId!, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/admin',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return { authenticated: true };
  } catch (error) {
    console.error('[checkAdminAuth] Error:', error);
    return {
      authenticated: false,
      error: 'サーバーエラーが発生しました',
    };
  }
}
