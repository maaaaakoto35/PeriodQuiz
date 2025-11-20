'use client';

import { useState } from 'react';
import { QuizScreen } from '@/app/_lib/types/quiz';

export interface QuizControlState {
  currentScreen: QuizScreen;
  currentPeriodId: number | null;
  currentQuestionId: number | null;
  periodName?: string;
  questionText?: string;
}

interface UseQuizControlStateReturn {
  state: QuizControlState | null;
  setState: (newState: QuizControlState) => void;
  isUpdating: boolean;
  setIsUpdating: (updating: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  userCount: number;
  setUserCount: (count: number) => void;
}

/**
 * クイズ制御パネルの状態管理フック
 * 
 * 責務:
 * - 現在の画面状態（Screen, Period, Question情報）の管理
 * - 更新中フラグの管理
 * - エラーメッセージの管理
 * - 参加者数の管理
 */
export function useQuizControlState(
  initialState: QuizControlState | null
): UseQuizControlStateReturn {
  const [state, setState] = useState<QuizControlState | null>(initialState);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState(0);

  return {
    state,
    setState,
    isUpdating,
    setIsUpdating,
    error,
    setError,
    userCount,
    setUserCount,
  };
}
