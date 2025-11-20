'use client';

import { useState } from 'react';
import { submitAnswer, SubmitAnswerInput } from '@/app/_lib/actions/user';

interface UseQuestionAnswerState {
  selectedChoiceId: number | null;
  isSubmitting: boolean;
  isAnswered: boolean;
  error: string | null;
}

/**
 * クイズ回答ロジックをカプセル化したカスタムフック
 * - 選択肢の選択管理
 * - 回答送信の状態管理
 * - 回答済み状態の管理
 */
export function useQuestionAnswer() {
  const [state, setState] = useState<UseQuestionAnswerState>({
    selectedChoiceId: null,
    isSubmitting: false,
    isAnswered: false,
    error: null,
  });

  const selectChoice = (choiceId: number) => {
    if (!state.isAnswered) {
      setState((prev) => ({
        ...prev,
        selectedChoiceId: choiceId,
        error: null,
      }));
    }
  };

  const submit = async (eventId: number) => {
    if (!state.selectedChoiceId || state.isAnswered) {
      setState((prev) => ({
        ...prev,
        error: '選択肢を選んでから送信してください',
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      error: null,
    }));

    const input: SubmitAnswerInput = {
      eventId,
      choiceId: state.selectedChoiceId,
    };

    const result = await submitAnswer(input);

    if (!result.success) {
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: result.error,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isSubmitting: false,
      isAnswered: true,
    }));
  };

  const reset = () => {
    setState({
      selectedChoiceId: null,
      isSubmitting: false,
      isAnswered: false,
      error: null,
    });
  };

  return {
    selectedChoiceId: state.selectedChoiceId,
    isSubmitting: state.isSubmitting,
    isAnswered: state.isAnswered,
    error: state.error,
    selectChoice,
    submit,
    reset,
  };
}
