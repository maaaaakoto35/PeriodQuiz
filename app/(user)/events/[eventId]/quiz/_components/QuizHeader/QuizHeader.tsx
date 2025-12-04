"use client";

import styles from "./QuizHeader.module.css";

/**
 * モニター画面用のヘッダー
 */
export function QuizHeader() {
  return (
    <div className={styles.root}>
      {/* ロゴ */}
      <img
        className={styles.img}
        src="/period-quiz-logo.svg"
        alt="PeriodQuiz Logo"
      />
    </div>
  );
}
