'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { deletePeriodSchema } from '../validation';
import { checkAdminAuth } from '../../checkAdminAuth';

/**
 * ピリオド削除
 * @param input ピリオド削除情報
 * @returns 削除結果
 */
export async function deletePeriod(input: unknown): Promise<{
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
    const validatedInput = deletePeriodSchema.parse(input);

    // Supabase クライアント取得
    const supabase = createAdminClient();

    // 関連する問題があるかチェック
    const { data: relatedQuestions, error: checkError } = await supabase
      .from('period_questions')
      .select('id')
      .eq('period_id', validatedInput.id)
      .limit(1);

    if (checkError) {
      console.error('[deletePeriod] Check error:', checkError);
      return {
        success: false,
        error: 'ピリオド削除に失敗しました',
      };
    }

    if (relatedQuestions && relatedQuestions.length > 0) {
      return {
        success: false,
        error: 'このピリオドに紐付いた問題があるため、削除できません',
      };
    }

    // ピリオド削除
    const { error } = await supabase
      .from('periods')
      .delete()
      .eq('id', validatedInput.id);

    if (error) {
      console.error('[deletePeriod] Supabase error:', error);
      return {
        success: false,
        error: 'ピリオド削除に失敗しました',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('[deletePeriod] Error:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'ピリオド削除中にエラーが発生しました',
    };
  }
}
