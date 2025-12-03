"use client";

import { useMonitorEventInfoContext } from "@/app/admin/monitor/[eventId]/_context/MonitorEventInfoContext";
import styles from "./MonitorHeader.module.css";

/**
 * モニター画面用のヘッダー
 */
export function MonitorHeader() {
  const { eventInfo } = useMonitorEventInfoContext();

  console.log("MonitorHeader render", { eventInfo });

  return (
    <div className={styles.root}>
      <div>
        {/* イベント名 */}
        <div className={styles.eventName}>{eventInfo?.eventName || ""}</div>

        {/* ピリオド名 */}
        {eventInfo?.periodName && (
          <div className={styles.periodName}>{eventInfo.periodName}</div>
        )}
      </div>

      {/* ロゴ */}
      <img
        className="self-stretch h-20"
        src="/period-quiz-logo.svg"
        alt="PeriodQuiz Logo"
      />
    </div>
  );
}
