"use client";

import { useEffect } from "react";
import {
  useQuizControlState,
  useQuizControlTransition,
  usePolledRankings,
  useRealtimeUserCount,
  type QuizControlState,
} from "../_hooks";
import { CurrentStateDisplay } from "./CurrentStateDisplay";
import { TransitionButtons } from "./TransitionButtons";
import { ErrorAlert } from "./ErrorAlert";
import { RankingsPanel } from "./RankingsPanel";

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
 * 3. リアルタイム参加者数取得（useRealtimeUserCount）
 * 4. UIコンポーネント組み合わせ
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

  // リアルタイムユーザー数取得フック
  const { userCount: realtimeUserCount } = useRealtimeUserCount({
    eventId,
    initialCount: initialUserCount,
  });

  // ランキング購読フック（currentPeriodIdが設定されている場合のみ有効）
  const { rankings, isLoading: rankingsLoading } = usePolledRankings({
    eventId,
    periodId: state?.currentPeriodId || 0,
    enabled: !!state?.currentPeriodId,
  });

  // リアルタイム参加者数が更新されたときに状態を更新
  useEffect(() => {
    setUserCount(realtimeUserCount);
  }, [realtimeUserCount, setUserCount]);

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

      {/* ランキング表示セクション */}
      {state.currentPeriodId && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            進行状況確認
          </h2>
          <RankingsPanel rankings={rankings} isLoading={rankingsLoading} />
        </div>
      )}
    </div>
  );
}
