'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { updateEventStatusSchema } from '../validation';
import { checkAdminAuth } from '../../checkAdminAuth';
import type { EventRecord } from '../getEvent';

/**
 * イベントのステータスを更新（draft → active → paused → completed）
 */
export async function updateEventStatus(input: unknown): Promise<{
  success: boolean;
  data?: EventRecord;
  error?: string;
}> {
  try {
    // 管理者認証チェック
    const authCheck = await checkAdminAuth();
    if (!authCheck.authenticated) {
      return {
        success: false,
        error: '認証が必要です',
      };
    }

    // バリデーション
    const validatedInput = updateEventStatusSchema.parse(input);

    const supabase = createAdminClient();

    // イベント取得（現在のステータス確認）
    const { data: currentEvent, error: fetchError } = await supabase
      .from('events')
      .select('status')
      .eq('id', validatedInput.id)
      .single();

    if (fetchError || !currentEvent) {
      return {
        success: false,
        error: 'イベントが見つかりません',
      };
    }

    // ステータス遷移ルール
    const validTransitions: Record<string, string[]> = {
      draft: ['active'],
      active: ['paused', 'completed'],
      paused: ['active', 'completed'],
      completed: [],
    };

    const validStatuses = validTransitions[currentEvent.status];
    if (!validStatuses?.includes(validatedInput.status)) {
      return {
        success: false,
        error: `ステータス "${currentEvent.status}" から "${validatedInput.status}" への遷移は許可されていません`,
      };
    }

    // ステータス更新
    const { data, error } = await supabase
      .from('events')
      .update({
        status: validatedInput.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedInput.id)
      .select('*')
      .single();

    if (error) {
      console.error('[updateEventStatus] Supabase error:', error);
      return {
        success: false,
        error: 'ステータス更新に失敗しました',
      };
    }

    return {
      success: true,
      data: data as EventRecord,
    };
  } catch (error) {
    console.error('[updateEventStatus] Error:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'ステータス更新中にエラーが発生しました',
    };
  }
}
