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
  data?: { id: number; name: string; description: string; status: string };
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
    const { data, error } = await supabase
      .from('events')
      .insert({
        name: validatedInput.name,
        description: validatedInput.description,
        status: 'draft',
        allow_registration: true,
      })
      .select('id, name, description, status')
      .single();

    if (error) {
      console.error('[createEvent] Supabase error:', error);
      return {
        success: false,
        error: 'イベント作成に失敗しました',
      };
    }

    return {
      success: true,
      data,
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
