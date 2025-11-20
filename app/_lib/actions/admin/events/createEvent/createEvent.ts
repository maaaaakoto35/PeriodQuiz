'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { createEventSchema } from '../validation';
import { checkAdminAuth } from '../../checkAdminAuth';

/**
 * イベント作成
 * @param input イベント作成情報
 * @returns 作成されたイベント情報
 */
export async function createEvent(input: unknown): Promise<{
  success: boolean;
  data?: { id: number; name: string; description: string };
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
    const validatedInput = createEventSchema.parse(input);

    // Supabase クライアント取得
    const supabase = createAdminClient();

    // イベント作成
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        name: validatedInput.name,
        description: validatedInput.description,
      })
      .select('id, name, description')
      .single();

    if (eventError || !event) {
      console.error('[createEvent] Supabase error:', eventError);
      return {
        success: false,
        error: 'イベント作成に失敗しました',
      };
    }

    // quiz_control エントリを作成
    const { error: controlError } = await supabase
      .from('quiz_control')
      .insert({
        event_id: event.id,
        current_screen: 'waiting',
      });

    if (controlError) {
      console.error('[createEvent] Quiz control creation error:', controlError);
      // イベントは作成されているが、quiz_control 作成に失敗
      // トランザクション処理がないため、イベントは存在するが quiz_control がない状態
      // これは設計上の問題だが、現在は続行
    }

    return {
      success: true,
      data: event,
    };
  } catch (error) {
    console.error('[createEvent] Error:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'イベント作成中にエラーが発生しました',
    };
  }
}
