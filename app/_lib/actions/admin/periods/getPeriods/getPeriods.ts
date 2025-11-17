'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { getPeriodsSchema } from '../validation';
import { checkAdminAuth } from '../../checkAdminAuth';

export interface PeriodRecord {
  id: number;
  name: string;
  order_num: number;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * ピリオド一覧を取得
 * @param input イベントID
 * @returns ピリオド一覧
 */
export async function getPeriods(input: unknown): Promise<{
  success: boolean;
  data?: PeriodRecord[];
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
    const validatedInput = getPeriodsSchema.parse(input);

    // Supabase クライアント取得
    const supabase = createAdminClient();

    // ピリオド一覧取得（order_num でソート）
    const { data, error } = await supabase
      .from('periods')
      .select('*')
      .eq('event_id', validatedInput.eventId)
      .order('order_num', { ascending: true });

    if (error) {
      console.error('[getPeriods] Supabase error:', error);
      return {
        success: false,
        error: 'ピリオド一覧の取得に失敗しました',
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('[getPeriods] Error:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'ピリオド一覧取得中にエラーが発生しました',
    };
  }
}
