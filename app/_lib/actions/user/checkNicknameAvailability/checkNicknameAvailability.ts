'use server';

import { createClient } from '@/app/_lib/supabase/server';
import { nicknameSchema } from '@/app/_lib/validation/nickname';
import {
  ValidationError,
  DatabaseError,
  getErrorMessage,
} from '../errors';

/**
 * ニックネーム重複チェック結果の型
 */
export type CheckNicknameResult =
  | { available: true }
  | { available: false; error: string };

/**
 * ニックネームの重複をチェックする
 *
 * @param eventId - イベントID
 * @param nickname - ニックネーム
 * @returns チェック結果
 */
export async function checkNicknameAvailability(
  eventId: number,
  nickname: string
): Promise<CheckNicknameResult> {
  try {
    const supabase = await createClient();

    // バリデーション
    const validation = nicknameSchema.safeParse({ nickname });
    if (!validation.success) {
      throw new ValidationError(validation.error.issues[0].message);
    }

    // 重複チェック
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('event_id', eventId)
      .eq('nickname', validation.data.nickname)
      .maybeSingle();

    if (error) {
      throw new DatabaseError('チェックに失敗しました');
    }

    if (data) {
      throw new DatabaseError('このニックネームは既に使用されています', '23505');
    }

    return { available: true };
  } catch (error) {
    return {
      available: false,
      error: getErrorMessage(error),
    };
  }
}
