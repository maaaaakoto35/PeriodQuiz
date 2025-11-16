'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import {
  updateEventSchema,
  deleteEventSchema,
} from '../validation';
import { checkAdminAuth } from '../../checkAdminAuth';
import type { EventRecord } from '../getEvent';

/**
 * イベント更新（名前・説明）
 */
export async function updateEvent(input: unknown): Promise<{
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
    const validatedInput = updateEventSchema.parse(input);

    const supabase = createAdminClient();

    // イベント更新
    const { data, error } = await supabase
      .from('events')
      .update({
        name: validatedInput.name,
        description: validatedInput.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedInput.id)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'イベントが見つかりません',
        };
      }
      console.error('[updateEvent] Supabase error:', error);
      return {
        success: false,
        error: 'イベント更新に失敗しました',
      };
    }

    return {
      success: true,
      data: data as EventRecord,
    };
  } catch (error) {
    console.error('[updateEvent] Error:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'イベント更新中にエラーが発生しました',
    };
  }
}

/**
 * イベント削除（カスケード削除）
 */
export async function deleteEvent(input: unknown): Promise<{
  success: boolean;
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
    const validatedInput = deleteEventSchema.parse(input);

    const supabase = createAdminClient();

    // イベント削除
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', validatedInput.id);

    if (error) {
      console.error('[deleteEvent] Supabase error:', error);
      return {
        success: false,
        error: 'イベント削除に失敗しました',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('[deleteEvent] Error:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'イベント削除中にエラーが発生しました',
    };
  }
}
