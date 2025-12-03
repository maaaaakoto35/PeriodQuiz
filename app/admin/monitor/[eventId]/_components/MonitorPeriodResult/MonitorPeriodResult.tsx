"use client";

import { useEffect, useState } from "react";
import {
  EventInfo,
  getEventInfoForMonitor,
  getPeriodResultsForMonitor,
  type PeriodResultData,
} from "@/app/_lib/actions/admin";
import { MonitorHeader } from "@/app/admin/monitor/[eventId]/_components/MonitorHeader";
import { RankingRow, Notice } from "./components";
import styles from "./MonitorPeriodResult.module.css";

interface MonitorPeriodResultProps {
  eventId: number;
}

/**
 * モニター画面 - ピリオド結果
 *
 * ピリオド終了時のランキングを表示
 */
export function MonitorPeriodResult({ eventId }: MonitorPeriodResultProps) {
  const [data, setData] = useState<PeriodResultData | null>(null);
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetch = async () => {
      const eventInfo = await getEventInfoForMonitor(eventId);
      const result = await getPeriodResultsForMonitor(eventId);

      if (!isMounted) return;

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }

      if (eventInfo) {
        setEventInfo(eventInfo);
      }

      setLoading(false);
    };

    fetch();
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
