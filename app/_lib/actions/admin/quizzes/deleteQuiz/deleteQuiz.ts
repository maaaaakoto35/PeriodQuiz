'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { deleteQuizSchema } from '../validation';
import { checkAdminAuth } from '../../checkAdminAuth';

/**
 * クイズ削除
 * @param input クイズ削除情報
 * @returns 削除結果
 */
export async function deleteQuiz(input: unknown): Promise<{
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
    const validatedInput = deleteQuizSchema.parse(input);

    // Supabase クライアント取得
    const supabase = createAdminClient();

    // 選択肢を削除
    const { error: choicesError } = await supabase
      .from('choices')
      .delete()
      .eq('question_id', validatedInput.id);

    if (choicesError) {
      console.error('[deleteQuiz] Failed to delete choices:', choicesError);
      return {
        success: false,
        error: 'クイズ削除に失敗しました',
      };
    }

    // period_questions から削除
    const { error: pqError } = await supabase
      .from('period_questions')
      .delete()
      .eq('question_id', validatedInput.id);

    if (pqError) {
      console.error('[deleteQuiz] Failed to delete period_question:', pqError);
      return {
        success: false,
        error: 'クイズ削除に失敗しました',
      };
    }

    // 問題を削除
    const { error: quizError } = await supabase
      .from('questions')
      .delete()
      .eq('id', validatedInput.id);

    if (quizError) {
      console.error('[deleteQuiz] Failed to delete question:', quizError);
      return {
        success: false,
        error: 'クイズ削除に失敗しました',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('[deleteQuiz] Error:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'クイズ削除中にエラーが発生しました',
    };
  }
}
