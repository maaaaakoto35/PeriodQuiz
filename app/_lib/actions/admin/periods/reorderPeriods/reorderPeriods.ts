'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { reorderPeriodsSchema } from '../validation';
import { checkAdminAuth } from '../../checkAdminAuth';

/**
 * ピリオド順序変更
 * トランザクション的に処理するため、負の一時値を使用してから正の値に更新
 * @param input ピリオド順序変更情報
 * @returns 順序変更結果
 */
export async function reorderPeriods(input: unknown): Promise<{
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
    const validatedInput = reorderPeriodsSchema.parse(input);

    // Supabase クライアント取得
    const supabase = createAdminClient();

    // ステップ1: 一時的に負の値で更新（UNIQUE 制約を回避）
    for (const period of validatedInput.periods) {
      const { error } = await supabase
        .from('periods')
        .update({
          order_num: -(period.orderNum + 1), // 一時的な負の値
        })
        .eq('id', period.id);

      if (error) {
        console.error('[reorderPeriods] Step 1 error:', error);
        return {
          success: false,
          error: 'ピリオド順序の変更に失敗しました（ステップ1）',
        };
      }
    }

    // ステップ2: 一時値を正の値に更新
    for (const period of validatedInput.periods) {
      const { error } = await supabase
        .from('periods')
        .update({
          order_num: period.orderNum,
        })
        .eq('id', period.id);

      if (error) {
        console.error('[reorderPeriods] Step 2 error:', error);
        return {
          success: false,
          error: 'ピリオド順序の変更に失敗しました（ステップ2）',
        };
      }
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('[reorderPeriods] Error:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'ピリオド順序変更中にエラーが発生しました',
    };
  }
}
