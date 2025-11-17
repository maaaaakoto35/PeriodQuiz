'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { updatePeriodSchema } from '../validation';
import { checkAdminAuth } from '../../checkAdminAuth';
import type { PeriodRecord } from '../getPeriods';

/**
 * ピリオド更新
 * @param input ピリオド更新情報
 * @returns 更新されたピリオド情報
 */
export async function updatePeriod(input: unknown): Promise<{
  success: boolean;
  data?: PeriodRecord;
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
    const validatedInput = updatePeriodSchema.parse(input);

    // Supabase クライアント取得
    const supabase = createAdminClient();

    // ピリオド更新
    const { data, error } = await supabase
      .from('periods')
      .update({
        name: validatedInput.name,
      })
      .eq('id', validatedInput.id)
      .select('*')
      .single();

    if (error) {
      console.error('[updatePeriod] Supabase error:', error);
      return {
        success: false,
        error: 'ピリオド更新に失敗しました',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[updatePeriod] Error:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'ピリオド更新中にエラーが発生しました',
    };
  }
}
