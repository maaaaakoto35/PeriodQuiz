'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { Database } from '@/app/_lib/types/database';
import { getNextQuestion, createQuestionDisplay, getNextPeriod } from '../utils';

/**
 * question画面への遷移処理
 * - 初回（waiting → question）の場合: 第1ピリオドの第1問を取得
 * - 2回目以降（break/answer → question）: 次の問題を決定し、question_displays を insert
 * - 次の問題が存在しない場合: currentQuestionId: null を返す（ピリオド結果画面へ遷移）
 */
export async function handleQuestionTransition(
  supabase: ReturnType<typeof createAdminClient>,
  currentControl: Database['public']['Tables']['quiz_control']['Row'],
  eventId: number
): Promise<
  | { success: true; currentPeriodId: number; currentQuestionId: number | null }
  | { success: false; error: string }
> {
  try {
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

      const nextQuestionId = await getNextQuestion(
        supabase,
        firstPeriod.id,
        null
      );

      if (!nextQuestionId) {
        // 最初のピリオドに問題がない場合、ピリオド結果画面へ
        return {
          success: true,
          currentPeriodId: firstPeriod.id,
          currentQuestionId: null,
        };
      }

      await createQuestionDisplay(supabase, nextQuestionId, firstPeriod.id);

      return {
        success: true,
        currentPeriodId: firstPeriod.id,
        currentQuestionId: nextQuestionId,
      };
    }

    // break または answer → question の場合は次の問題を取得
    if (currentControl.current_screen === 'break' || currentControl.current_screen === 'answer') {
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
        // 次の問題がない場合、ピリオド結果画面へ
        return {
          success: false,
          error: 'これ以上の問題が存在しません。ピリオド結果画面へ遷移してください。',
        };
      }

      await createQuestionDisplay(
        supabase,
        nextQuestionId,
        currentControl.current_period_id
      );

      return {
        success: true,
        currentPeriodId: currentControl.current_period_id,
        currentQuestionId: nextQuestionId,
      };
    }

    // period_result → question の場合は次ピリオドの第1問を取得
    if (currentControl.current_screen === 'period_result') {
      if (!currentControl.current_period_id) {
        return {
          success: false,
          error: 'ピリオド情報が見つかりません',
        };
      }

      const nextPeriodId = await getNextPeriod(supabase, currentControl.current_period_id, eventId);

      if (!nextPeriodId) {
        return {
          success: false,
          error: '次のピリオドが見つかりません。最終問題を終えた可能性があります',
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
          error: '次のピリオドが見つかりません。最終問題を終えた可能性があります',
        };
      }

      await createQuestionDisplay(supabase, nextQuestionId, nextPeriodId);

      return {
        success: true,
        currentPeriodId: nextPeriodId,
        currentQuestionId: nextQuestionId,
      };
    }

    // question_reading → question の場合は既存の問題情報を使用して question_displays を insert
    if (currentControl.current_screen === 'question_reading') {
      if (!currentControl.current_period_id || !currentControl.current_question_id) {
        return {
          success: false,
          error: '問題情報が見つかりません',
        };
      }

      // question_reading では既に問題が決定しているので、question_displays を insert
      await createQuestionDisplay(
        supabase,
        currentControl.current_question_id,
        currentControl.current_period_id
      );

      return {
        success: true,
        currentPeriodId: currentControl.current_period_id,
        currentQuestionId: currentControl.current_question_id,
      };
    }

    return {
      success: false,
      error: '無効な画面遷移です',
    };
  } catch (error) {
    console.error('[handleQuestionTransition] Error:', error);
    const message = error instanceof Error ? error.message : '不明なエラー';
    return {
      success: false,
      error: `問題の次を決定できませんでした: ${message}`,
    };
  }
}
