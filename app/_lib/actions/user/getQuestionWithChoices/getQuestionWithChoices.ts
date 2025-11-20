'use server';

import { createClient } from '@/app/_lib/supabase/server';
import { validateSession } from '../validateSession';
import { Database } from '@/app/_lib/types/database';

export interface GetQuestionWithChoicesInput {
  eventId: number;
}

export interface QuestionWithChoices {
  id: number;
  text: string;
  image_url: string | null;
  choices: {
    id: number;
    text: string;
    image_url: string | null;
    order_num: number;
  }[];
  displayed_at: string | null; // question_displays.displayed_at
}

export type GetQuestionWithChoicesResult =
  | {
      success: true;
      data: QuestionWithChoices;
    }
  | {
      success: false;
      error: string;
    };

/**
 * 現在のクイズ問題と選択肢を取得
 * quiz_control.current_question_id から問題を取得し、
 * その問題に紐づく選択肢と displayed_at を返す
 */
export async function getQuestionWithChoices(
  input: GetQuestionWithChoicesInput
): Promise<GetQuestionWithChoicesResult> {
  try {
    const { eventId } = input;

    // セッション検証
    const sessionResult = await validateSession();
    if (!sessionResult.valid) {
      return {
        success: false,
        error: 'セッションが見つかりません',
      };
    }

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
        error: '現在の問題情報が見つかりません',
      };
    }

    const questionId = quizControl.current_question_id;

    // 問題と選択肢を取得
    // 注意: 正解情報(is_correct)は取得しない（クライアント側で表示させないため）
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select(
        `
        id,
        text,
        image_url,
        choices(id, text, image_url, order_num)
      `
      )
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      return {
        success: false,
        error: '問題の取得に失敗しました',
      };
    }

    // question_displays から displayed_at を取得
    const { data: questionDisplay, error: displayError } = await supabase
      .from('question_displays')
      .select('displayed_at')
      .eq('question_id', questionId)
      .eq('event_id', eventId)
      .order('displayed_at', { ascending: false })
      .limit(1)
      .single();

    if (displayError) {
      // displayed_at が無い場合は null で返す
      console.warn('[getQuestionWithChoices] question_displays not found:', {
        questionId,
        eventId,
      });
    }

    // 型キャストして返す
    const typedQuestion = question as Database['public']['Tables']['questions']['Row'] & {
      choices: Database['public']['Tables']['choices']['Row'][];
    };

    return {
      success: true,
      data: {
        id: typedQuestion.id,
        text: typedQuestion.text,
        image_url: typedQuestion.image_url,
        choices: typedQuestion.choices
          .sort((a, b) => a.order_num - b.order_num)
          .map((choice) => ({
            id: choice.id,
            text: choice.text,
            image_url: choice.image_url,
            order_num: choice.order_num,
          })),
        displayed_at: questionDisplay?.displayed_at ?? null,
      },
    };
  } catch (error) {
    console.error('[getQuestionWithChoices] Error:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: '予期しないエラーが発生しました',
    };
  }
}
