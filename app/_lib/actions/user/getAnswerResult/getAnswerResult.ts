'use server';

import { createClient } from '@/app/_lib/supabase/server';
import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { validateSession } from '../validateSession';
import { type Choice } from '@/app/(user)/events/[eventId]/quiz/_components';

export interface GetAnswerResultInput {
  eventId: number;
}

export interface AnswerData {
  questionText: string;
  questionImageUrl: string | null;
  choices: Choice[];
  userAnswer: {
    choiceId: number;
    isCorrect: boolean;
    responseTimeMs: number;
  } | null;
}

export type GetAnswerResultResult =
  | {
      success: true;
      data: AnswerData;
    }
  | {
      success: false;
      error: string;
    };

/**
 * ユーザーの回答結果を取得
 * - 現在の問題情報を取得
 * - ユーザーの回答を取得
 * - 正解/不正解と回答時間を返す
 */
export async function getAnswerResult(
  eventId: number
): Promise<GetAnswerResultResult> {
  try {
    // セッション検証
    const sessionResult = await validateSession();
    if (!sessionResult.valid) {
      return {
        success: false,
        error: 'セッションが見つかりません',
      };
    }

    const userId = sessionResult.user.id;
    const supabase = await createClient();

    // quiz_control から現在の問題IDを取得
    const { data: quizControl, error: quizControlError } = await supabase
      .from('quiz_control')
      .select('current_question_id')
      .eq('event_id', eventId)
      .single();

    if (quizControlError || !quizControl || !quizControl.current_question_id) {
      return {
        success: false,
        error: '問題情報が見つかりません',
      };
    }

    const questionId = quizControl.current_question_id;

    // 問題情報を取得
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('text, image_url')
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      return {
        success: false,
        error: '問題が見つかりません',
      };
    }

    // 選択肢を取得
    const { data: choices, error: choicesError } = await supabase
      .from('choices')
      .select('id, text, image_url, is_correct, order_num')
      .eq('question_id', questionId)
      .order('order_num', { ascending: true });

    if (choicesError || !choices) {
      return {
        success: false,
        error: '選択肢が見つかりません',
      };
    }

    // ユーザーの回答を取得
    const { data: answer } = await supabase
      .from('answers')
      .select('choice_id, is_correct, response_time_ms')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .single();

    return {
      success: true,
      data: {
        questionText: question.text,
        questionImageUrl: question.image_url,
        choices: choices.map((c) => ({
          id: c.id,
          text: c.text,
          imageUrl: c.image_url,
          orderNum: c.order_num,
          isCorrect: c.is_correct,
        })),
        userAnswer: answer
          ? {
              choiceId: answer.choice_id,
              isCorrect: answer.is_correct,
              responseTimeMs: answer.response_time_ms,
            }
          : null,
      },
    };
  } catch (error) {
    console.error('Failed to get answer result:', error);
    return {
      success: false,
      error: 'エラーが発生しました',
    };
  }
}
