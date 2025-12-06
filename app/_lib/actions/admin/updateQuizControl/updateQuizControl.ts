'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { checkAdminAuth } from '../checkAdminAuth';
import { QuizScreen } from '@/app/_lib/types/quiz';
import { QUIZ_TRANSITION_RULES } from '@/app/_lib/constants/quiz-transition';
import {
  handleQuestionTransition,
  handleAnswerTransition,
} from './handlers';

export interface UpdateQuizControlInput {
  eventId: number;
  nextScreen: QuizScreen;
}

export type UpdateQuizControlResult =
  | {
      success: true;
      data: {
        currentScreen: QuizScreen;
        currentPeriodId: number | null;
        currentQuestionId: number | null;
        bgmEnabled: boolean;
      };
    }
  | {
      success: false;
      error: string;
    };

/**
 * クイズ進行状態を更新する
 * 画面遷移のバリデーション、自動更新ロジック、次問題・次ピリオド決定を実行
 *
 * 分割した責務:
 * - handleQuestionTransition: 問題選択ロジック
 * - handleAnswerTransition: 答え表示ロジック
 * - handlePeriodResultTransition: ピリオド進行ロジック
 */
export async function updateQuizControl(
  input: UpdateQuizControlInput
): Promise<UpdateQuizControlResult> {
  try {
    // 管理者認証チェック
    const authCheck = await checkAdminAuth();
    if (!authCheck.authenticated) {
      return {
        success: false,
        error: '認証が必要です',
      };
    }

    const { eventId, nextScreen } = input;
    const supabase = createAdminClient();

    // 現在の状態を取得
    const { data: currentControl, error: fetchError } = await supabase
      .from('quiz_control')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (fetchError || !currentControl) {
      return {
        success: false,
        error: 'クイズ制御情報が見つかりません',
      };
    }

    const currentScreen = currentControl.current_screen as QuizScreen;

    // 画面遷移のバリデーション
    const allowedTransitions = QUIZ_TRANSITION_RULES[currentScreen];
    if (!allowedTransitions.includes(nextScreen)) {
      return {
        success: false,
        error: `${currentScreen}から${nextScreen}への遷移は許可されていません`,
      };
    }

    // 次のスクリーン、ピリオド、問題を決定
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
      current_screen: nextScreen,
      updated_at: new Date().toISOString(),
    };

    // question画面に遷移時: question_displays を insert + 次問題決定
    if (nextScreen === 'question') {
      const result = await handleQuestionTransition(
        supabase,
        currentControl,
        eventId
      );
      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }
      updateData.current_period_id = result.currentPeriodId;
      updateData.current_question_id = result.currentQuestionId;
      updateData.question_displayed_at = new Date().toISOString();
    }

    // answer_check画面に遷移時: question_displays.closed_at を update
    if (nextScreen === 'answer_check') {
      const result = await handleAnswerTransition(supabase, currentControl);
      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }
      updateData.question_closed_at = new Date().toISOString();
    }

    // answer画面に遷移時: 特別な処理は不要（answer_checkで既にclosed_at設定済み）
    if (nextScreen === 'answer') {
      // answer_checkからanswerへの遷移では追加処理なし
    }

    // quiz_control を更新
    const { error: updateError } = await supabase
      .from('quiz_control')
      .update(updateData)
      .eq('event_id', eventId);

    if (updateError) {
      console.error('[updateQuizControl] Update error:', updateError);
      return {
        success: false,
        error: 'クイズ制御情報の更新に失敗しました',
      };
    }

    return {
      success: true,
      data: {
        currentScreen: nextScreen,
        currentPeriodId:
          updateData.current_period_id ?? currentControl.current_period_id,
        currentQuestionId:
          updateData.current_question_id ?? currentControl.current_question_id,
        bgmEnabled: currentControl.bgm_enabled,
      },
    };
  } catch (error) {
    console.error('[updateQuizControl] Error:', error);
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
