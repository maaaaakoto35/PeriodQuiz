"use client";

import { type FinalResultData } from "@/app/_lib/actions/user";
import { WaitingScreen } from "@/app/(user)/events/[eventId]/_components/WaitingScreen";
import { useResultDisplay } from "@/app/(user)/events/[eventId]/quiz/_hooks/useResultDisplay";

import { ResultScreen } from "./components";
import styles from "./FinalResultDisplay.module.css";

interface FinalResultDisplayProps {
  data: FinalResultData;
}

/**
 * 最終結果表示コンポーネント（Client Component）
 *
 * 責務:
 * 1. 最初の120秒間はWaitingScreenを表示
 * 2. 120秒後にResultScreenでイベント名、全体ランキング、ユーザーの順位と成績を表示
 * 3. 優勝者（1位）の特別な強調表示
 * 4. 各ピリオドのチャンピオン一覧表示
 */
export function FinalResultDisplay({ data }: FinalResultDisplayProps) {
  const { showResult, waitingSeconds } = useResultDisplay({ seconds: 120 });

  // 120秒間の待機画面
  if (!showResult) {
    return <WaitingScreen waitingTimeSeconds={waitingSeconds} />;
  }

  return (
    <div className={styles.wrapper}>
      {/* メインコンテンツ */}
      <div className={styles.mainContent}>
        <ResultScreen data={data} />
      </div>
    </div>
  );
}
