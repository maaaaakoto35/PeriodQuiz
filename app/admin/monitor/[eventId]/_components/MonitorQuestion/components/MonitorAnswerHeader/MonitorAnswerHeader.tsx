import styles from "./MonitorAnswerHeader.module.css";

interface MonitorAnswerHeaderProps {
  eventName: string;
  periodName: string;
}

/**
 * モニター画面 - 正解発表ヘッダー
 */
export function MonitorAnswerHeader({
  eventName,
  periodName,
}: MonitorAnswerHeaderProps) {
  return (
    <div className={styles.root}>
      <div>
        {/* イベント名 */}
        <div className={styles.eventName}>{eventName}</div>

        {/* ピリオド名 */}
        <div className={styles.periodName}>{periodName}</div>
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
