import { useMonitorEventInfoContext } from "@/app/admin/monitor/[eventId]/_context/MonitorEventInfoContext";
import styles from "./QuestionPanel.module.css";

interface QuestionPanelProps {
  questionText: string;
}

/**
 * モニター画面 - 正解発表の問題表示パネル
 */
export function QuestionPanel({ questionText }: QuestionPanelProps) {
  const { eventInfo } = useMonitorEventInfoContext();

  return (
    <div className={styles.root}>
      {/* Q アイコン */}
      <div className={styles.qIcon}>Q</div>

      {/* 問題文 */}
      <div className={styles.sentence}>{questionText}</div>

      {/* 問題番号 */}
      <div className={styles.questionNumber}>{eventInfo?.questionNumber}</div>
    </div>
  );
}
