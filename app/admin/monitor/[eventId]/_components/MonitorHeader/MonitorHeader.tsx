import styles from "./MonitorHeader.module.css";

interface MonitorAnswerHeaderProps {
  eventName: string;
  periodName?: string;
}

/**
 * モニター画面用のヘッダー
 */
export function MonitorHeader({
  eventName,
  periodName,
}: MonitorAnswerHeaderProps) {
  return (
    <div className={styles.root}>
      <div>
        {/* イベント名 */}
        <div className={styles.eventName}>{eventName}</div>

        {/* ピリオド名 */}
        {periodName && <div className={styles.periodName}>{periodName}</div>}
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
