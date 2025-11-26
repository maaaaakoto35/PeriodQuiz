"use client";

import {
  useQuizControlState,
  useQuizControlTransition,
  type QuizControlState,
} from "../_hooks";
import { CurrentStateDisplay } from "./CurrentStateDisplay";
import { TransitionButtons } from "./TransitionButtons";
import { ErrorAlert } from "./ErrorAlert";

interface QuizControlPanelProps {
  eventId: number;
  initialState: QuizControlState;
  initialUserCount: number;
}

/**
 * クイズ制御パネル
 *
 * 責務:
 * 1. 状態管理（useQuizControlState）
 * 2. 遷移ロジック（useQuizControlTransition）
 * 3. UIコンポーネント組み合わせ
 *
 * useEffect なし（初期ロードはサーバーで実行）
 * 状態管理と遷移ロジックは custom hooks に委譲
 */
export function QuizControlPanel({
  eventId,
  initialState,
  initialUserCount,
}: QuizControlPanelProps) {
  const {
    state,
    setState,
    isUpdating,
    setIsUpdating,
    error,
    setError,
    userCount,
    setUserCount,
  } = useQuizControlState(initialState);

  const { handleTransition, getPossibleTransitions } = useQuizControlTransition(
    {
      eventId,
      state,
      onUpdateState: setState,
      onSetIsUpdating: setIsUpdating,
      onSetError: setError,
    }
  );

  // 初期化時に initialUserCount をセット
  if (userCount === 0 && initialUserCount > 0) {
    setUserCount(initialUserCount);
  }

  if (!state) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-center text-red-600">制御パネルが利用できません</p>
      </div>
    );
  }

  const possibleTransitions = getPossibleTransitions();

  return (
    <div className="space-y-6">
      <CurrentStateDisplay
        state={state}
        userCount={userCount}
        eventId={eventId}
        onReset={() => {
          setState({
            currentScreen: "waiting",
            currentPeriodId: null,
            currentQuestionId: null,
          });
        }}
        isUpdating={isUpdating}
      />

      {error && <ErrorAlert message={error} />}

      <TransitionButtons
        onTransition={handleTransition}
        possibleTransitions={possibleTransitions}
        isUpdating={isUpdating}
      />
    </div>
  );
}
