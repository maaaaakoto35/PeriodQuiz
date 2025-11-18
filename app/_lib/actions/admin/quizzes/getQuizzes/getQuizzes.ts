'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { getQuizzesSchema } from '../validation';
import { checkAdminAuth } from '../../checkAdminAuth';

export interface QuizRecord {
  id: number;
  text: string;
  image_url: string | null;
  order_num: number;
  created_at: string;
  updated_at: string;
}

export interface QuizWithChoices extends QuizRecord {
  choices: ChoiceRecord[];
}

export interface ChoiceRecord {
  id: number;
  question_id: number;
  text: string;
  image_url: string | null;
  is_correct: boolean;
  order_num: number;
  created_at: string;
}

/**
 * ピリオド内のクイズ一覧を取得（選択肢を含む）
 * @param input ピリオドID
 * @returns クイズ一覧
 */
export async function getQuizzes(input: unknown): Promise<{
  success: boolean;
  data?: QuizWithChoices[];
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
    const validatedInput = getQuizzesSchema.parse(input);

    // Supabase クライアント取得
    const supabase = createAdminClient();

    // ピリオド内のクイズを取得（period_questions経由）
    const { data: periodQuestions, error: pqError } = await supabase
      .from('period_questions')
      .select('*')
      .eq('period_id', validatedInput.periodId)
      .order('order_num', { ascending: true });

    if (pqError) {
      console.error('[getQuizzes] Supabase error:', pqError);
      return {
        success: false,
        error: 'クイズ一覧の取得に失敗しました',
      };
    }

    // 各クイズの詳細情報と選択肢を取得
    const quizzesWithChoices: QuizWithChoices[] = [];

    for (const pq of periodQuestions || []) {
      // クイズの詳細情報を取得
      const { data: quiz, error: quizError } = await supabase
        .from('questions')
        .select('*')
        .eq('id', pq.question_id)
        .single();

      if (quizError) {
        console.error('[getQuizzes] Failed to fetch quiz:', quizError);
        continue;
      }

      // 選択肢を取得
      const { data: choices, error: choicesError } = await supabase
        .from('choices')
        .select('*')
        .eq('question_id', quiz.id)
        .order('order_num', { ascending: true });

      if (choicesError) {
        console.error('[getQuizzes] Failed to fetch choices:', choicesError);
        continue;
      }

      quizzesWithChoices.push({
        id: quiz.id,
        text: quiz.text,
        image_url: quiz.image_url,
        order_num: pq.order_num,
        created_at: quiz.created_at,
        updated_at: quiz.updated_at,
        choices: choices || [],
      });
    }

    return {
      success: true,
      data: quizzesWithChoices,
    };
  } catch (error) {
    console.error('[getQuizzes] Error:', error);
    return {
      success: false,
      error: '予期しないエラーが発生しました',
    };
  }
}
