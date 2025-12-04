'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { checkAdminAuth } from '../checkAdminAuth';

export type ResetEventResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

/**
 * イベントをリセットする
 *
 * 処理フロー:
 * 1. 管理者認証チェック
 * 2. quiz_control を更新 (current_screen = 'waiting', current_period_id = null, current_question_id = null)
 * 3. question_displays を全削除
 * 4. answers を全削除
 * 5. users を全削除
 *
 * @param eventId - リセット対象のイベントID
 * @returns 成功/失敗結果
 */
export async function resetEvent(eventId: number): Promise<ResetEventResult> {
  try {
    // 管理者認証チェック
    const authCheck = await checkAdminAuth();
    if (!authCheck.authenticated) {
      return {
        success: false,
        error: '認証が必要です',
      };
    }

    const supabase = createAdminClient();

    // 1. quiz_control を更新
    const { error: updateError } = await supabase
      .from('quiz_control')
      .update({
        current_screen: 'waiting',
        current_period_id: null,
        current_question_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('event_id', eventId);

    if (updateError) {
      return {
        success: false,
        error: `クイズ制御情報の更新に失敗しました: ${updateError.message}`,
      };
    }

    // 2. question_displays を全削除
    // question_displays には event_id がないため、period_id 経由で削除
    // DELETE FROM question_displays WHERE period_id IN (SELECT id FROM periods WHERE event_id = eventId)
    const { data: periods, error: periodsError } = await supabase
      .from('periods')
      .select('id')
      .eq('event_id', eventId);

    if (periodsError) {
      return {
        success: false,
        error: `ピリオド取得に失敗しました: ${periodsError.message}`,
      };
    }

    const periodIds = periods?.map(p => p.id) || [];

    if (periodIds.length > 0) {
      const { error: displayError } = await supabase
        .from('question_displays')
        .delete()
        .in('period_id', periodIds);

      if (displayError) {
        return {
          success: false,
          error: `問題表示記録の削除に失敗しました: ${displayError.message}`,
        };
      }
    }

    // 3. answers を全削除
    // answers には event_id がないため、user_id 経由で削除
    // DELETE FROM answers WHERE user_id IN (SELECT id FROM users WHERE event_id = eventId)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('event_id', eventId);

    if (usersError) {
      return {
        success: false,
        error: `ユーザー取得に失敗しました: ${usersError.message}`,
      };
    }

    const userIds = users?.map(u => u.id) || [];

    if (userIds.length > 0) {
      const { error: answerError } = await supabase
        .from('answers')
        .delete()
        .in('user_id', userIds);

      if (answerError) {
        return {
          success: false,
          error: `回答データの削除に失敗しました: ${answerError.message}`,
        };
      }
    }

    // 4. users を全削除
    const { error: usersDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('event_id', eventId);

    if (usersDeleteError) {
      return {
        success: false,
        error: `ユーザーデータの削除に失敗しました: ${usersDeleteError.message}`,
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラー';
    return {
      success: false,
      error: `リセット処理中にエラーが発生しました: ${message}`,
    };
  }
}
