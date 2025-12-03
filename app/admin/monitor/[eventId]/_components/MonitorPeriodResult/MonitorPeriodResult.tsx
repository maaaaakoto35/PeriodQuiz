"use client";

import { useEffect, useState } from "react";
import {
  getPeriodResultsForMonitor,
  type PeriodResultData,
} from "@/app/_lib/actions/admin";
import { MonitorHeader } from "@/app/admin/monitor/[eventId]/_components/MonitorHeader";
import { useQuizScreenContext } from "@/app/admin/monitor/[eventId]/_context/QuizScreenContext";
import { useMonitorEventInfo } from "@/app/admin/monitor/[eventId]/_context/MonitorEventInfoContext";
import styles from "./MonitorPeriodResult.module.css";
import { Notice, RankingRow } from "../MonitorResult";

/**
 * モニター画面 - ピリオド結果
 *
 * ピリオド終了時のランキングを表示
 */
export function MonitorPeriodResult() {
  const { eventId, currentScreen } = useQuizScreenContext();
  const { eventInfo } = useMonitorEventInfo();
  const [data, setData] = useState<PeriodResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetch = async () => {
      const result = await getPeriodResultsForMonitor(eventId);

      if (!isMounted) return;

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }

      setLoading(false);
    };

    fetch();
    return () => {
      isMounted = false;
    };
  }, [eventId, currentScreen]);

  if (loading) {
    return (
      <div className={styles.root}>
        <div className={styles.emptyState}>
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-r-blue-600"></div>
            <p className="mt-4 text-gray-600">結果を読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.root}>
        <div className={styles.emptyState}>
          <p className="text-red-600 font-semibold">
            {error || "読み込み失敗"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {/* ヘッダー */}
      <MonitorHeader
        eventName={eventInfo?.eventName || ""}
        periodName={eventInfo?.periodName || ""}
      />

      {/* コンテンツエリア */}
      <div className={styles.main}>
        {/* 左側: ランキングリスト */}
        <div className={styles.rankingList}>
          {data.ranking.length > 0 ? (
            data.ranking.map((entry) => (
              <RankingRow
                key={`${entry.rank}-${entry.userId}`}
                rank={entry.rank}
                nickname={entry.nickname}
                correctCount={entry.correctCount}
                time={entry.totalResponseTimeMs / 1000}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              ランキングデータがありません
            </div>
          )}
        </div>

        {/* 右側: 「早押しベスト10」通知 */}
        <Notice isPeriod />
      </div>
    </div>
  );
}
