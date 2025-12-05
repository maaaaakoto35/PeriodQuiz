"use client";

import { useRealtimeUserCount } from "@/app/(admin)/admin/control/_hooks";
import { MonitorHeader } from "../MonitorHeader";
import { useQuizScreenContext } from "@/app/admin/monitor/[eventId]/_context/QuizScreenContext";
import styles from "./MonitorWaiting.module.css";

/**
 * モニター画面 - 待機中
 *
 * クイズ開始を待っている状態を表示
 * リアルタイムで参加者数を更新
 */
export function MonitorWaiting() {
  const { eventId } = useQuizScreenContext();
  const { userCount, isLoading: userCountLoading } = useRealtimeUserCount({
    eventId,
  });

  return (
    <div className={styles.container}>
      <MonitorHeader />

      <div className={styles.content}>
        <div className={styles.spinnerWrapper}>
          <div className={styles.spinner}></div>
        </div>

        <h1 className={styles.title}>クイズ開始待機中</h1>

        <p className={styles.description}>
          主催者がクイズを開始するまで、このまましばらくお待ちください
        </p>

        <div className={styles.userCountBox}>
          <p className={styles.userCountLabel}>参加者数</p>
          <p className={styles.userCountValue}>
            {userCountLoading ? "読み込み中..." : `${userCount}名`}
          </p>
        </div>
      </div>
    </div>
  );
}
