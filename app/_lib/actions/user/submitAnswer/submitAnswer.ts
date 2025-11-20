'use server';

import { createClient } from '@/app/_lib/supabase/server';
import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { validateSession } from '../validateSession';

export interface SubmitAnswerInput {
  eventId: number;
  choiceId: number;
}

export type SubmitAnswerResult =
  | {
      success: true;
      data: {
        answerId: number;
      };
    }
  | {
      success: false;
      error: string;
    };

/**
 * ユーザーの回答を送信
 * - 既存の回答チェック
 * - 回答時間の計算（サーバー側）
 * - 正解判定
 * - answers テーブルに挿入
 */
export async function submitAnswer(
  input: SubmitAnswerInput
): Promise<SubmitAnswerResult> {
  try {
    const { eventId, choiceId } = input;

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
    const supabaseAdmin = createAdminClient();

    // quiz_control から現在の問題IDとピリオドIDを取得
    const { data: quizControl, error: quizControlError } = await supabaseAdmin
      .from('quiz_control')
      .select('current_question_id, current_period_id')
      .eq('event_id', eventId)
      .single();

    if (quizControlError || !quizControl || !quizControl.current_question_id || !quizControl.current_period_id) {
      return {
        success: false,
        error: 'クイズ情報が見つかりません',
      };
    }

    const questionId = quizControl.current_question_id;
    const periodId = quizControl.current_period_id;

    // 既に回答済みかチェック
    const { data: existingAnswer, error: checkError } = await supabase
      .from('answers')
      .select('id')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .single();

    if (checkError?.code !== 'PGRST116' && existingAnswer) {
      // PGRST116 = "No rows found"
      return {
        success: false,
        error: 'この問題には既に回答済みです',
      };
    }

    // 選択肢の正解判定を取得
    const { data: choice, error: choiceError } = await supabase
      .from('choices')
      .select('is_correct')
      .eq('id', choiceId)
      .eq('question_id', questionId)
      .single();

    if (choiceError || !choice) {
      return {
        success: false,
        error: '選択肢が見つかりません',
      };
    }

    // question_displays から displayed_at を取得（回答時間計算用）
    const { data: questionDisplay, error: displayError } = await supabaseAdmin
      .from('question_displays')
      .select('displayed_at')
      .eq('question_id', questionId)
      .eq('period_id', periodId)
      .single();

    if (displayError || !questionDisplay) {
      console.log('[submitAnswer] Question display fetch error:', displayError);
      return {
        success: false,
        error: '問題表示情報が見つかりません',
      };
    }

    // 回答時間の計算
    const displayedAt = new Date(questionDisplay.displayed_at).getTime();
    const answeredAt = Date.now();
    const responseTimeMs = answeredAt - displayedAt;

    // 回答を挿入
    const { data: answer, error: insertError } = await supabase
      .from('answers')
      .insert({
        user_id: userId,
        question_id: questionId,
        choice_id: choiceId,
        is_correct: choice.is_correct,
        response_time_ms: responseTimeMs,
        answered_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError || !answer) {
      console.error('[submitAnswer] Insert error:', insertError);
      return {
        success: false,
        error: '回答の保存に失敗しました',
      };
    }

    return {
      success: true,
      data: {
        answerId: answer.id,
      },
    };
  } catch (error) {
    console.error('[submitAnswer] Error:', error);
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
