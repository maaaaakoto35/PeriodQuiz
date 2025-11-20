'use client';

import { useCallback } from 'react';
import { createClient } from '@/app/_lib/supabase/client';
import {
  updateQuizControl,
  type UpdateQuizControlResult,
} from '@/app/_lib/actions/admin/updateQuizControl';
import { QuizScreen } from '@/app/_lib/types/quiz';
import { QUIZ_TRANSITION_RULES } from '@/app/_lib/constants/quiz-transition';
import type { QuizControlState } from './useQuizControlState';

export interface UseQuizControlTransitionParams {
  eventId: number;
  state: QuizControlState | null;
  onUpdateState: (newState: QuizControlState) => void;
  onSetIsUpdating: (updating: boolean) => void;
  onSetError: (error: string | null) => void;
}

interface UseQuizControlTransitionReturn {
  handleTransition: (nextScreen: QuizScreen) => Promise<void>;
  getPossibleTransitions: () => QuizScreen[];
}

/**
 * クイズ画面遷移ロジック
 * 
 * 責務:
 * - Server Actionを呼び出して画面遷移実行
 * - 遷移前のバリデーション
 * - 状態更新とエラーハンドリング
 * - 可能な遷移先の判定
 */
export function useQuizControlTransition({
  eventId,
  state,
  onUpdateState,
  onSetIsUpdating,
  onSetError,
}: UseQuizControlTransitionParams): UseQuizControlTransitionReturn {
  const supabase = createClient();

  const handleTransition = useCallback(
    async (nextScreen: QuizScreen) => {
      if (!state) return;

      onSetIsUpdating(true);
      onSetError(null);

      try {
        const result: UpdateQuizControlResult = await updateQuizControl({
          eventId,
          nextScreen,
        });

        // 失敗時は状態を更新しない
        if (!result.success) {
          onSetError(result.error);
          return;
        }

        // 成功時のみ状態を更新
        // ピリオド情報と質問情報も取得して更新
        let periodName = '';
        if (result.data.currentPeriodId) {
          const { data: period } = await supabase
            .from('periods')
            .select('name')
            .eq('id', result.data.currentPeriodId)
            .single();
          periodName = period?.name || '';
        }

        let questionText = '';
        if (result.data.currentQuestionId) {
          const { data: question } = await supabase
            .from('questions')
            .select('text')
            .eq('id', result.data.currentQuestionId)
            .single();
          questionText = question?.text || '';
        }

        onUpdateState({
          currentScreen: result.data.currentScreen,
          currentPeriodId: result.data.currentPeriodId,
          currentQuestionId: result.data.currentQuestionId,
          periodName,
          questionText,
        });
      } catch (err) {
        console.error('Failed to update quiz control:', err);
        onSetError('状態更新に失敗しました');
      } finally {
        onSetIsUpdating(false);
      }
    },
    [eventId, state, supabase, onUpdateState, onSetIsUpdating, onSetError]
  );

  const getPossibleTransitions = useCallback(() => {
    if (!state) return [];
    return QUIZ_TRANSITION_RULES[state.currentScreen] || [];
  }, [state]);

  return {
    handleTransition,
    getPossibleTransitions,
  };
}
