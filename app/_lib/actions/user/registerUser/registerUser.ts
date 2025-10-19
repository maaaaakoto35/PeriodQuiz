'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/app/_lib/supabase/server';
import { nicknameSchema } from '@/app/_lib/validation/nickname';
import { canRegisterNewUser } from '@/app/_lib/actions/user/canRegisterNewUser';
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '../session.constants';
import {
  ValidationError,
  DatabaseError,
  RegistrationError,
  getErrorMessage,
} from '../errors';
import type { Database } from '@/app/_lib/types/database';

type User = Database['public']['Tables']['users']['Row'];

/**
 * ユーザー登録結果の型
 */
export type RegisterUserResult =
  | { success: true; user: User; sessionId: string }
  | { success: false; error: string };

/**
 * ユーザーを登録する
 *
 * @param eventId - イベントID
 * @param nickname - ニックネーム
 * @returns 登録結果
 */
export async function registerUser(
  eventId: number,
  nickname: string
): Promise<RegisterUserResult> {
  try {
    const supabase = await createClient();

    // バリデーション
    const validation = nicknameSchema.safeParse({ nickname });
    if (!validation.success) {
      throw new ValidationError(validation.error.issues[0].message);
    }

    // 新規登録可能かチェック
    const canRegister = await canRegisterNewUser(eventId);
    if (!canRegister.canRegister) {
      throw new RegistrationError(canRegister.reason);
    }

    // セッションIDを生成
    const sessionId = crypto.randomUUID();

    // ユーザーを作成
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        event_id: eventId,
        nickname: validation.data.nickname,
        session_id: sessionId,
        last_active_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new DatabaseError('ユーザー登録に失敗しました', error.code);
    }

    if (!user) {
      throw new DatabaseError('ユーザー登録に失敗しました');
    }

    // Cookieにセッションを保存
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return {
      success: true,
      user,
      sessionId,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
