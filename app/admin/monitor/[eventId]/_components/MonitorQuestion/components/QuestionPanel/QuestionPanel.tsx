import styles from "./QuestionPanel.module.css";

interface QuestionPanelProps {
  questionText: string;
  questionNumber: number;
}

/**
 * モニター画面 - 正解発表の問題表示パネル
 */
export function QuestionPanel({
  questionText,
  questionNumber,
}: QuestionPanelProps) {
  return (
    <div className={styles.root}>
      {/* Q アイコン */}
      <div className={styles.qIcon}>Q</div>

      {/* 問題文 */}
      <div className={styles.sentence}>{questionText}</div>

      {/* 問題番号 */}
      <div className={styles.questionNumber}>{questionNumber}</div>
    </div>
  );
}
