"use client";

import { useEffect, useState } from "react";
import { getFinalResultForMonitor } from "@/app/_lib/actions/admin";
import type { FinalResultDataForMonitor } from "@/app/_lib/actions/admin";
import { MonitorHeader } from "@/app/admin/monitor/[eventId]/_components/MonitorHeader";
import { useQuizScreenContext } from "@/app/admin/monitor/[eventId]/_context/QuizScreenContext";
import { RankingRow, Notice } from "../MonitorResult";
import styles from "./MonitorFinalResult.module.css";

/**
 * モニター画面 - 最終結果
 *
 * クイズ終了時の最終ランキングを表示
 */
export function MonitorFinalResult() {
  const { eventId } = useQuizScreenContext();
  const [data, setData] = useState<FinalResultDataForMonitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFinalResult = async () => {
      const result = await getFinalResultForMonitor(eventId);

      if (!isMounted) return;

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    fetchFinalResult();

    return () => {
      isMounted = false;
    };
  }, [eventId]);

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

  const rankings = data.ranking;
  const eventName = data.eventName;

  return (
    <div className={styles.root}>
      {/* ヘッダー */}
      <MonitorHeader />

      {/* コンテンツエリア */}
      <div className={styles.main}>
        {/* 左側: ランキングリスト */}
        <div className={styles.rankingList}>
          {rankings.length > 0 ? (
            rankings.map((entry) => (
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

        {/* 右側: 「個人成績ランキング」通知 */}
        <Notice />
      </div>
    </div>
  );
}
