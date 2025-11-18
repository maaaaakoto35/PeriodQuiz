'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { reorderQuizzesSchema } from '../validation';
import { checkAdminAuth } from '../../checkAdminAuth';

/**
 * クイズ順序変更
 * period_questions テーブルの order_num を更新
 * @param input クイズ順序変更情報
 * @returns 順序変更結果
 */
export async function reorderQuizzes(input: unknown): Promise<{
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
    const validatedInput = reorderQuizzesSchema.parse(input);

    // Supabase クライアント取得
    const supabase = createAdminClient();

    // ステップ1: 一時的に負の値で更新（UNIQUE 制約を回避）
    for (const quiz of validatedInput.quizzes) {
      const { error } = await supabase
        .from('period_questions')
        .update({
          order_num: -(quiz.orderNum + 1), // 一時的な負の値
        })
        .eq('question_id', quiz.id)
        .eq('period_id', validatedInput.periodId);

      if (error) {
        console.error('[reorderQuizzes] Step 1 error:', error);
        return {
          success: false,
          error: 'クイズ順序の変更に失敗しました（ステップ1）',
        };
      }
    }

    // ステップ2: 一時値を正の値に更新
    for (const quiz of validatedInput.quizzes) {
      const { error } = await supabase
        .from('period_questions')
        .update({
          order_num: quiz.orderNum,
        })
        .eq('question_id', quiz.id)
        .eq('period_id', validatedInput.periodId);

      if (error) {
        console.error('[reorderQuizzes] Step 2 error:', error);
        return {
          success: false,
          error: 'クイズ順序の変更に失敗しました（ステップ2）',
        };
      }
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('[reorderQuizzes] Error:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'クイズ順序変更中にエラーが発生しました',
    };
  }
}
