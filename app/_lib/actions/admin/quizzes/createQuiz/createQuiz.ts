'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { createQuizSchema } from '../validation';
import { checkAdminAuth } from '../../checkAdminAuth';
import type { QuizWithChoices } from '../getQuizzes';

/**
 * クイズ作成
 * @param input クイズ作成情報
 * @returns 作成されたクイズ情報
 */
export async function createQuiz(input: unknown): Promise<{
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
    const validatedInput = createQuizSchema.parse(input);

    // Supabase クライアント取得
    const supabase = createAdminClient();

    // 最大の order_num を取得（period_questions テーブルから）
    const { data: maxOrderData, error: maxOrderError } = await supabase
      .from('period_questions')
      .select('order_num')
      .eq('period_id', validatedInput.periodId)
      .order('order_num', { ascending: false })
      .limit(1)
      .single();

    if (maxOrderError && maxOrderError.code !== 'PGRST116') {
      console.error('[createQuiz] Get max order error:', maxOrderError);
      return {
        success: false,
        error: 'クイズ作成に失敗しました',
      };
    }

    const nextOrderNum = (maxOrderData?.order_num ?? 0) + 1;

    // クイズ（問題）作成
    const { data: quiz, error: quizError } = await supabase
      .from('questions')
      .insert({
        text: validatedInput.text,
        image_url: validatedInput.imageUrl || null,
      })
      .select('*')
      .single();

    if (quizError) {
      console.error('[createQuiz] Failed to create question:', quizError);
      return {
        success: false,
        error: 'クイズ作成に失敗しました',
      };
    }

    // period_questions に関連付け
    const { error: pqError } = await supabase
      .from('period_questions')
      .insert({
        period_id: validatedInput.periodId,
        question_id: quiz.id,
        order_num: nextOrderNum,
      });

    if (pqError) {
      console.error('[createQuiz] Failed to link period_questions:', pqError);
      // ロールバック：作成した問題を削除
      await supabase.from('questions').delete().eq('id', quiz.id);
      return {
        success: false,
        error: 'クイズ作成に失敗しました',
      };
    }

    // 選択肢を作成
    const choicesWithOrder = validatedInput.choices.map((choice, index) => ({
      question_id: quiz.id,
      text: choice.text,
      image_url: choice.imageUrl || null,
      is_correct: choice.isCorrect,
      order_num: index + 1,
      answer_text: choice.answerText || null,
    }));

    const { data: choices, error: choicesError } = await supabase
      .from('choices')
      .insert(choicesWithOrder)
      .select('*');

    if (choicesError) {
      console.error('[createQuiz] Failed to create choices:', choicesError);
      // ロールバック：作成したデータを削除
      await supabase.from('period_questions').delete().eq('question_id', quiz.id);
      await supabase.from('questions').delete().eq('id', quiz.id);
      return {
        success: false,
        error: 'クイズ作成に失敗しました',
      };
    }

    return {
      success: true,
      data: {
        id: quiz.id,
        text: quiz.text,
        image_url: quiz.image_url,
        order_num: nextOrderNum,
        created_at: quiz.created_at,
        updated_at: quiz.updated_at,
        choices: choices || [],
      },
    };
  } catch (error) {
    console.error('[createQuiz] Error:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'クイズ作成中にエラーが発生しました',
    };
  }
}
