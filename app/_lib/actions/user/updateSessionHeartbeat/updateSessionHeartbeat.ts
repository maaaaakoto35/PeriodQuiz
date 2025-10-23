'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/app/_lib/supabase/server';
import { SESSION_COOKIE_NAME } from '../session.constants';

// TODO: 監査ログ実装時に headers() を使用
// import { headers } from 'next/headers';

/**
 * セッションの最終アクティブ時刻を更新する
 *
 * 🔒 セキュリティ実装:
 *
 * Layer 1: httpOnly Cookie
 *   - session_id はサーバー側でのみアクセス可能
 *   - JavaScript からはアクセス不可
 *
 * Layer 2: Server Action (このアクション)
 *   - session_id の有効性を確認
 *   - 更新対象を last_active_at のみに制限
 *   - 更新結果を検証（1行のみが期待される）
 *
 * Layer 3: RLS (Row Level Security)
 *   - UPDATE ポリシーで最終チェック
 *   - Server Action が検証を保証することを前提
 *
 * 攻撃防止:
 *   ❌ 他のユーザーの更新: session_id で検証
 *   ❌ 他のカラムの更新: 更新結果で検証
 *   ❌ ANON_KEY 漏洩: RLS で防止
 *
 * @returns 成功/失敗とエラーメッセージ
 */
export async function updateSessionHeartbeat(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    // ✅ セッション検証
    if (!sessionId) {
      console.warn('Session update attempted without session_id');
      return {
        success: false,
        error: 'セッションが見つかりません',
      };
    }

    // ✅ 日時を現在時刻に設定
    const now = new Date().toISOString();

    // ✅ last_active_at のみを更新（他のカラムは含めない）
    const { data, error } = await supabase
      .from('users')
      .update({ last_active_at: now })
      .eq('session_id', sessionId)
      .select();  // 更新結果を取得

    // ✅ エラーハンドリング
    if (error) {
      console.error('Failed to update session heartbeat:', {
        error: error.message,
        code: error.code,
        sessionId: sessionId.substring(0, 8) + '...', // マスク
      });
      return {
        success: false,
        error: 'セッション更新に失敗しました',
      };
    }

    // ✅ 更新結果の検証: 1行のみが更新されるべき
    if (!data || data.length !== 1) {
      console.error('Unexpected update result:', {
        rowsAffected: data?.length ?? 0,
        sessionId: sessionId.substring(0, 8) + '...', // マスク
      });
      return {
        success: false,
        error: 'セッション更新に失敗しました',
      };
    }

    // ✅ 更新されたデータの検証: 期待されたフィールドのみ存在するか確認
    const updatedUser = data[0];
    const expectedFields = ['id', 'event_id', 'nickname', 'session_id', 'created_at', 'last_active_at'];
    const unexpectedFields = Object.keys(updatedUser).filter(
      field => !expectedFields.includes(field)
    );

    if (unexpectedFields.length > 0) {
      console.error('Unexpected fields in update result:', {
        fields: unexpectedFields,
        sessionId: sessionId.substring(0, 8) + '...', // マスク
      });
      return {
        success: false,
        error: 'セッション更新に失敗しました',
      };
    }

    // ✅ last_active_at が実際に更新されたか確認
    if (updatedUser.last_active_at !== now) {
      console.error('last_active_at was not updated correctly:', {
        expected: now,
        actual: updatedUser.last_active_at,
      });
      return {
        success: false,
        error: 'セッション更新に失敗しました',
      };
    }

    // 🎯 監査ログ（オプション - 将来実装）
    // await logSessionHeartbeat({
    //   userId: updatedUser.id,
    //   sessionId,
    //   ipAddress: (await headers()).get('x-forwarded-for'),
    //   userAgent: (await headers()).get('user-agent'),
    //   timestamp: now,
    // });

    return { success: true };
  } catch (error) {
    console.error('Session heartbeat error:', error);
    return {
      success: false,
      error: 'セッション更新に失敗しました',
    };
  }
}
