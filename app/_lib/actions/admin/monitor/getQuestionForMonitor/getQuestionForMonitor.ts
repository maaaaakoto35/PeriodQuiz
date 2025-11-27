'use server';

import { GetQuestionWithChoicesResult, QuestionWithChoices } from '@/app/_lib/actions/user/getQuestionWithChoices/getQuestionWithChoices';
import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { Database } from '@/app/_lib/types/database';

/**
 * モニター画面向け - 現在の問題と選択肢を取得
 *
 * getQuestionWithChoices と共通のロジックを使用
 * 管理者向けなのでセッション検証は不要
 */
export async function getQuestionForMonitor(
  eventId: number
): Promise<GetQuestionWithChoicesResult> {
  try {
    const supabase = createAdminClient();

    // 現在の問題IDを取得
    const { data: quizControl, error: controlError } = await supabase
      .from('quiz_control')
      .select('current_question_id')
      .eq('event_id', eventId)
      .single();

    if (controlError || !quizControl?.current_question_id) {
      return {
        success: false,
        error: '問題情報が見つかりません',
      };
    }

    // 問題と選択肢を取得（getQuestionWithChoices と同じロジック）
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
      .eq('id', quizControl.current_question_id)
      .single();

    if (questionError || !question) {
      return {
        success: false,
        error: '問題の取得に失敗しました',
      };
    }

    // 型キャストして返す
    const typedQuestion = question as Database['public']['Tables']['questions']['Row'] & {
      choices: Database['public']['Tables']['choices']['Row'][];
    };

    const data: QuestionWithChoices = {
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
      displayed_at: null,
    };

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[getQuestionForMonitor] Error:', error);
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
