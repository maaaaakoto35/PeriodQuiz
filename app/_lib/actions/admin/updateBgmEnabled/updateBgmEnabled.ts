'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { checkAdminAuth } from '../checkAdminAuth';

export interface UpdateBgmEnabledInput {
  eventId: number;
  enabled: boolean;
}

export type UpdateBgmEnabledResult =
  | {
      success: true;
      data: {
        bgmEnabled: boolean;
      };
    }
  | {
      success: false;
      error: string;
    };

/**
 * BGM有効/無効状態を更新する
 *
 * 責務:
 * - 管理者認証チェック
 * - quiz_control.bgm_enabled を更新
 * - エラーハンドリング
 */
export async function updateBgmEnabled(
  input: UpdateBgmEnabledInput
): Promise<UpdateBgmEnabledResult> {
  try {
    // 管理者認証チェック
    const authCheck = await checkAdminAuth();
    if (!authCheck.authenticated) {
      return {
        success: false,
        error: '認証が必要です',
      };
    }

    const { eventId, enabled } = input;
    const supabase = createAdminClient();

    // quiz_control の bgm_enabled を更新
    const { error: updateError } = await supabase
      .from('quiz_control')
      .update({ bgm_enabled: enabled })
      .eq('event_id', eventId);

    if (updateError) {
      console.error('[updateBgmEnabled] Update error:', updateError);
      return {
        success: false,
        error: 'BGM設定の更新に失敗しました',
      };
    }

    return {
      success: true,
      data: {
        bgmEnabled: enabled,
      },
    };
  } catch (error) {
    console.error('[updateBgmEnabled] Error:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: '予期しないエラーが発生しました',
    };
  }
}
