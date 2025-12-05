"use client";

import { type PeriodResultData } from "@/app/_lib/actions/user";
import { ResultScreen } from "./components";
import { useResultDisplay } from "@/app/(user)/events/[eventId]/quiz/_hooks/useResultDisplay";

import styles from "./PeriodResultDisplay.module.css";
import { WaitingScreen } from "@/app/(user)/events/[eventId]/_components/WaitingScreen";

interface PeriodResultDisplayProps {
  data: PeriodResultData;
}

/**
 * ピリオド集計結果表示コンポーネント（Client Component）
 *
 * 責務:
 * 1. 20秒間「モニターをご覧ください！」を表示
 * 2. 20秒後にユーザーの順位と成績を表示（ランキング表は非表示）
 * 3. チャンピオン（1位）の強調表示
 */
export function PeriodResultDisplay({ data }: PeriodResultDisplayProps) {
  const { showResult, waitingSeconds } = useResultDisplay({ seconds: 20 });

  return (
    <div className={styles.container}>
      {/* メインコンテンツ */}
      <div className={styles.mainContent}>
        {!showResult ? (
          <WaitingScreen waitingTimeSeconds={waitingSeconds} />
        ) : (
          <ResultScreen data={data} />
        )}
      </div>
    </div>
  );
}
