'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { type AnswerData } from '@/app/_lib/actions/user/getAnswerResult/getAnswerResult';
import { type Choice } from '@/app/(user)/events/[eventId]/quiz/_components';

// Admin向けの型定義
export type MonitorAnswerData = AnswerData;

export type GetAnswerForMonitorResult =
  | {
      success: true;
      data: MonitorAnswerData;
    }
  | {
      success: false;
      error: string;
    };

/**
 * モニター画面向け - 正解情報を取得
 *
 * getAnswerResult と同じロジックを使用
 * 管理者向けなのでセッション検証は不要
 */
export async function getAnswerForMonitor(
  eventId: number
): Promise<GetAnswerForMonitorResult> {
  try {
    const supabase = createAdminClient();

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

    // 選択肢を取得（is_correct と answer_text を含む）
    const { data: choices, error: choicesError } = await supabase
      .from('choices')
      .select('id, text, image_url, is_correct, order_num, answer_text')
      .eq('question_id', questionId)
      .order('order_num', { ascending: true });

    if (choicesError || !choices) {
      return {
        success: false,
        error: '選択肢が見つかりません',
      };
    }

    // 各選択肢の選択人数を取得
    const { data: selectionCounts } = await supabase
      .from('answers')
      .select('choice_id')
      .eq('question_id', questionId);

    const selectionCountMap = new Map<number, number>();
    selectionCounts?.forEach((a) => {
      const count = selectionCountMap.get(a.choice_id) || 0;
      selectionCountMap.set(a.choice_id, count + 1);
    });

    const choicesData: Choice[] = choices.map((c) => ({
      id: c.id,
      text: c.text,
      imageUrl: c.image_url,
      orderNum: c.order_num,
      isCorrect: c.is_correct,
      selectionCount: selectionCountMap.get(c.id) || 0,
      answerText: c.answer_text,
    }));

    return {
      success: true,
      data: {
        questionText: question.text,
        questionImageUrl: question.image_url,
        choices: choicesData,
        userAnswer: null, // 管理者向けなので個別ユーザー回答は不要
      },
    };
  } catch (error) {
    console.error('[getAnswerForMonitor] Error:', error);
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
