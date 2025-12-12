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

    // question_reading画面に遷移時: 次問題決定（question_displays は insert しない）
    if (nextScreen === 'question_reading') {
      if (currentScreen === 'waiting') {
        // waiting → question_reading: 第1ピリオドの第1問を決定
        const { data: firstPeriod, error: periodError } = await supabase
          .from('periods')
          .select('id')
          .eq('event_id', eventId)
          .order('order_num', { ascending: true })
          .limit(1)
          .single();

        if (periodError || !firstPeriod) {
          return {
            success: false,
            error: 'ピリオドが見つかりません',
          };
        }

        const { data: firstQuestion, error: questionError } = await supabase
          .from('period_questions')
          .select('question_id')
          .eq('period_id', firstPeriod.id)
          .order('order_num', { ascending: true })
          .limit(1)
          .single();

        if (questionError || !firstQuestion) {
          return {
            success: false,
            error: '問題が見つかりません',
          };
        }

        updateData.current_period_id = firstPeriod.id;
        updateData.current_question_id = firstQuestion.question_id;
      } else if (
        currentScreen === 'answer' ||
        currentScreen === 'break' ||
        currentScreen === 'period_result'
      ) {
        // answer, break, period_result → question_reading: 次の問題を決定
        // handleQuestionTransitionを利用するが、question_displaysはinsertしない
        // 一時的にcurrent_screenを変更して呼び出す
        const tempControl = { ...currentControl, current_screen: currentScreen };
        const { data: periods } = await supabase
          .from('periods')
          .select('id, order_num')
          .eq('event_id', eventId)
          .order('order_num', { ascending: true });

        if (!periods || periods.length === 0) {
          return {
            success: false,
            error: 'ピリオドが見つかりません',
          };
        }

        // 次の問題を取得（getNextQuestion関数を直接使用）
        const { getNextQuestion, getNextPeriod } = await import('./utils');

        if (currentScreen === 'answer' || currentScreen === 'break') {
          // 同じピリオド内の次の問題を取得
          if (!currentControl.current_period_id) {
            return {
              success: false,
              error: 'ピリオド情報が見つかりません',
            };
          }

          const nextQuestionId = await getNextQuestion(
            supabase,
            currentControl.current_period_id,
            currentControl.current_question_id
          );

          if (nextQuestionId === null) {
            // 次の問題がない場合はエラー
            return {
              success: false,
              error:
                'これ以上の問題が存在しません。ピリオド結果画面へ遷移してください。',
            };
          }

          updateData.current_question_id = nextQuestionId;
        } else if (currentScreen === 'period_result') {
          // 次のピリオドの第1問を取得
          if (!currentControl.current_period_id) {
            return {
              success: false,
              error: 'ピリオド情報が見つかりません',
            };
          }

          const nextPeriodId = await getNextPeriod(
            supabase,
            currentControl.current_period_id,
            eventId
          );

          if (!nextPeriodId) {
            return {
              success: false,
              error:
                '次のピリオドが見つかりません。最終問題を終えた可能性があります',
            };
          }

          const nextQuestionId = await getNextQuestion(
            supabase,
            nextPeriodId,
            null
          );

          if (!nextQuestionId) {
            return {
              success: false,
              error:
                '次のピリオドに問題が見つかりません。最終問題を終えた可能性があります',
            };
          }

          updateData.current_period_id = nextPeriodId;
          updateData.current_question_id = nextQuestionId;
        }
      }
    }

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
