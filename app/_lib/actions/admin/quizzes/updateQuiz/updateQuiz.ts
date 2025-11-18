'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { updateQuizSchema } from '../validation';
import { checkAdminAuth } from '../../checkAdminAuth';
import type { QuizWithChoices } from '../getQuizzes';

/**
 * クイズ更新
 * @param input クイズ更新情報
 * @returns 更新されたクイズ情報
 */
export async function updateQuiz(input: unknown): Promise<{
  success: boolean;
  data?: QuizWithChoices;
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
    const validatedInput = updateQuizSchema.parse(input);

    // Supabase クライアント取得
    const supabase = createAdminClient();

    // 既存のクイズを取得
    const { data: existingQuiz, error: fetchError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', validatedInput.id)
      .single();

    if (fetchError || !existingQuiz) {
      console.error('[updateQuiz] Failed to fetch quiz:', fetchError);
      return {
        success: false,
        error: 'クイズが見つかりません',
      };
    }

    // クイズ（問題）を更新
    const { data: quiz, error: quizError } = await supabase
      .from('questions')
      .update({
        text: validatedInput.text,
        image_url: validatedInput.imageUrl || null,
      })
      .eq('id', validatedInput.id)
      .select('*')
      .single();

    if (quizError) {
      console.error('[updateQuiz] Failed to update question:', quizError);
      return {
        success: false,
        error: 'クイズ更新に失敗しました',
      };
    }

    // 既存の選択肢を削除
    const { error: deleteError } = await supabase
      .from('choices')
      .delete()
      .eq('question_id', validatedInput.id);

    if (deleteError) {
      console.error('[updateQuiz] Failed to delete old choices:', deleteError);
      return {
        success: false,
        error: 'クイズ更新に失敗しました',
      };
    }

    // 新しい選択肢を作成
    const choicesWithOrder = validatedInput.choices.map((choice, index) => ({
      question_id: validatedInput.id,
      text: choice.text,
      image_url: choice.imageUrl || null,
      is_correct: choice.isCorrect,
      order_num: index + 1,
    }));

    const { data: choices, error: choicesError } = await supabase
      .from('choices')
      .insert(choicesWithOrder)
      .select('*');

    if (choicesError) {
      console.error('[updateQuiz] Failed to create new choices:', choicesError);
      return {
        success: false,
        error: 'クイズ更新に失敗しました',
      };
    }

    // period_questions から order_num を取得
    const { data: pq, error: pqError } = await supabase
      .from('period_questions')
      .select('order_num')
      .eq('question_id', validatedInput.id)
      .single();

    const orderNum = pq?.order_num ?? 0;

    return {
      success: true,
      data: {
        id: quiz.id,
        text: quiz.text,
        image_url: quiz.image_url,
        order_num: orderNum,
        created_at: quiz.created_at,
        updated_at: quiz.updated_at,
        choices: choices || [],
      },
    };
  } catch (error) {
    console.error('[updateQuiz] Error:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'クイズ更新中にエラーが発生しました',
    };
  }
}
