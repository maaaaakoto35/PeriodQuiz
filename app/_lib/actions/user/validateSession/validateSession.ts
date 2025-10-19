'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/app/_lib/supabase/server';
import { SESSION_COOKIE_NAME } from '../session.constants';
import {
  SessionError,
  DatabaseError,
  getErrorMessage,
} from '../errors';
import type { Database } from '@/app/_lib/types/database';

type User = Database['public']['Tables']['users']['Row'];

/**
 * セッション検証結果の型
 */
export type ValidateSessionResult =
  | { valid: true; user: User }
  | { valid: false; error: string };

/**
 * セッションを検証する
 *
 * @param sessionId - セッションID（省略時はCookieから取得）
 * @returns 検証結果
 */
export async function validateSession(
  sessionId?: string
): Promise<ValidateSessionResult> {
  try {
    const supabase = await createClient();

    // セッションIDを取得
    let sid = sessionId;
    if (!sid) {
      const cookieStore = await cookies();
      sid = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    }

    if (!sid) {
      throw new SessionError('セッションが見つかりません');
    }

    // ユーザーを取得
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('session_id', sid)
      .single();

    if (error || !user) {
      throw new SessionError('セッションが無効です');
    }

    // 最終アクティブ時刻を更新
    await supabase
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user.id)
      .throwOnError();

    return {
      valid: true,
      user,
    };
  } catch (error) {
    return {
      valid: false,
      error: getErrorMessage(error),
    };
  }
}
