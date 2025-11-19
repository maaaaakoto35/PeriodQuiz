'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { checkAdminAuth } from '../checkAdminAuth';
import { QuizScreen } from '@/app/_lib/types/quiz';
import { QUIZ_TRANSITION_RULES } from '@/app/_lib/constants/quiz-transition';
import { Database } from '@/app/_lib/types/database';

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
      };
    }
  | {
      success: false;
      error: string;
    };

/**
 * クイズ進行状態を更新する
 * 画面遷移のバリデーション、自動更新ロジック、次問題・次ピリオド決定を実行
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

    // answer画面に遷移時: question_displays.closed_at を update
    if (nextScreen === 'answer') {
      const result = await handleAnswerTransition(
        supabase,
        currentControl
      );
      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }
      updateData.question_closed_at = new Date().toISOString();
    }

    // period_result画面に遷移時: 次ピリオドに自動移行する準備
    if (nextScreen === 'period_result') {
      const result = await handlePeriodResultTransition(
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
      // period_result画面では、次のperiodをセットする
      updateData.current_period_id = result.nextPeriodId;
      updateData.current_question_id = null;
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
        currentPeriodId: updateData.current_period_id ?? currentControl.current_period_id,
        currentQuestionId: updateData.current_question_id ?? currentControl.current_question_id,
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

/**
 * question画面への遷移処理
 * - 次の問題を決定
 * - 次ピリオドまたは次問題を決定
 */
async function handleQuestionTransition(
  supabase: ReturnType<typeof createAdminClient>,
  currentControl: Database['public']['Tables']['quiz_control']['Row'],
  eventId: number
): Promise<
  | { success: true; currentPeriodId: number; currentQuestionId: number }
  | { success: false; error: string }
> {
  // 初回（waiting → question）の場合は第1ピリオドの第1問を取得
  if (currentControl.current_screen === 'waiting') {
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

    const { data: firstQuestion, error: qError } = await supabase
      .from('period_questions')
      .select('question_id')
      .eq('period_id', firstPeriod.id)
      .order('order_num', { ascending: true })
      .limit(1)
      .single();

    if (qError || !firstQuestion) {
      return {
        success: false,
        error: '問題が見つかりません',
      };
    }

    // question_displays を insert
    const { error: displayError } = await supabase
      .from('question_displays')
      .insert({
        question_id: firstQuestion.question_id,
        period_id: firstPeriod.id,
        displayed_at: new Date().toISOString(),
      });

    if (displayError) {
      console.error('[handleQuestionTransition] Display insert error:', displayError);
      return {
        success: false,
        error: '問題表示記録の作成に失敗しました',
      };
    }

    return {
      success: true,
      currentPeriodId: firstPeriod.id,
      currentQuestionId: firstQuestion.question_id,
    };
  }

  // 次問題への遷移の場合
  if (
    currentControl.current_screen === 'answer' ||
    currentControl.current_screen === 'break'
  ) {
    const currentPeriodId = currentControl.current_period_id;
    const currentQuestionId = currentControl.current_question_id;

    if (!currentPeriodId || !currentQuestionId) {
      return {
        success: false,
        error: '現在の状態が不正です',
      };
    }

    // 現在の問題の順序を取得
    const { data: currentPQ, error: cpqError } = await supabase
      .from('period_questions')
      .select('order_num')
      .eq('period_id', currentPeriodId)
      .eq('question_id', currentQuestionId)
      .single();

    if (cpqError || !currentPQ) {
      return {
        success: false,
        error: '現在の問題情報が見つかりません',
      };
    }

    // 次の問題を探す
    const { data: nextPQ, error: npqError } = await supabase
      .from('period_questions')
      .select('question_id')
      .eq('period_id', currentPeriodId)
      .gt('order_num', currentPQ.order_num)
      .order('order_num', { ascending: true })
      .limit(1)
      .single();

    if (!npqError && nextPQ) {
      // 次の問題が存在
      // question_displays を insert
      const { error: displayError } = await supabase
        .from('question_displays')
        .insert({
          question_id: nextPQ.question_id,
          period_id: currentPeriodId,
          displayed_at: new Date().toISOString(),
        });

      if (displayError) {
        console.error('[handleQuestionTransition] Display insert error:', displayError);
        return {
          success: false,
          error: '問題表示記録の作成に失敗しました',
        };
      }

      return {
        success: true,
        currentPeriodId,
        currentQuestionId: nextPQ.question_id,
      };
    }

    // 次の問題が存在しない場合、ピリオド結果画面を表示する旨を返す
    return {
      success: false,
      error: '次のピリオドに移行する前にperiod_result画面を表示してください',
    };
  }

  // period_result → question の場合
  if (currentControl.current_screen === 'period_result') {
    // currentControl.current_period_id には次ピリオドが既にセットされている
    const nextPeriodId = currentControl.current_period_id;

    if (!nextPeriodId) {
      return {
        success: false,
        error: 'ピリオドの問題が見つかりません。最終問題を終えた可能性があります。',
      };
    }

    const { data: firstQuestion, error: fqError } = await supabase
      .from('period_questions')
      .select('question_id')
      .eq('period_id', nextPeriodId)
      .order('order_num', { ascending: true })
      .limit(1)
      .single();

    if (fqError || !firstQuestion) {
      return {
        success: false,
        error: 'ピリオドの問題が見つかりません。最終問題を終えた可能性があります。',
      };
    }

    // question_displays を insert
    const { error: displayError } = await supabase
      .from('question_displays')
      .insert({
        question_id: firstQuestion.question_id,
        period_id: nextPeriodId,
        displayed_at: new Date().toISOString(),
      });

    if (displayError) {
      console.error('[handleQuestionTransition] Display insert error:', displayError);
      return {
        success: false,
        error: '問題表示記録の作成に失敗しました',
      };
    }

    return {
      success: true,
      currentPeriodId: nextPeriodId,
      currentQuestionId: firstQuestion.question_id,
    };
  }

  return {
    success: false,
    error: '無効な遷移です',
  };
}

/**
 * answer画面への遷移処理
 */
async function handleAnswerTransition(
  supabase: ReturnType<typeof createAdminClient>,
  currentControl: Database['public']['Tables']['quiz_control']['Row']
): Promise<{ success: true } | { success: false; error: string }> {
  const currentPeriodId = currentControl.current_period_id;
  const currentQuestionId = currentControl.current_question_id;

  if (!currentPeriodId || !currentQuestionId) {
    return {
      success: false,
      error: '現在の状態が不正です',
    };
  }

  // question_displays の closed_at を update
  const { error: displayError } = await supabase
    .from('question_displays')
    .update({
      closed_at: new Date().toISOString(),
    })
    .eq('period_id', currentPeriodId)
    .eq('question_id', currentQuestionId);

  if (displayError) {
    console.error('[handleAnswerTransition] Display update error:', displayError);
    return {
      success: false,
      error: '問題表示記録の更新に失敗しました',
    };
  }

  return { success: true };
}

/**
 * period_result画面への遷移処理
 * 次のピリオドを決定
 */
async function handlePeriodResultTransition(
  supabase: ReturnType<typeof createAdminClient>,
  currentControl: Database['public']['Tables']['quiz_control']['Row'],
  eventId: number
): Promise<
  | { success: true; nextPeriodId: number | null }
  | { success: false; error: string }
> {
  const currentPeriodId = currentControl.current_period_id;

  if (!currentPeriodId) {
    return {
      success: false,
      error: 'ピリオド情報が見つかりません',
    };
  }

  // 現在のピリオドの order_num を取得
  const currentOrderNum = await getPeriodOrderNum(supabase, currentPeriodId);

  // 次のピリオドを取得
  const { data: nextPeriod, error: periodError } = await supabase
    .from('periods')
    .select('id')
    .eq('event_id', eventId)
    .gt('order_num', currentOrderNum)
    .order('order_num', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (periodError) {
    console.error('[handlePeriodResultTransition] Period fetch error:', periodError);
    return {
      success: false,
      error: 'ピリオド情報の取得に失敗しました',
    };
  }

  // 次のピリオドが存在しない場合、null を返す（最終結果画面へ）
  return {
    success: true,
    nextPeriodId: nextPeriod?.id ?? null,
  };
}

/**
 * ピリオドの order_num を取得
 */
async function getPeriodOrderNum(supabase: ReturnType<typeof createAdminClient>, periodId: number): Promise<number> {
  const { data, error } = await supabase
    .from('periods')
    .select('order_num')
    .eq('id', periodId)
    .single();

  if (error || !data) {
    throw new Error('ピリオド情報が見つかりません');
  }

  return data.order_num;
}
