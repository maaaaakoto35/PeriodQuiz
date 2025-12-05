"use client";

import styles from "./WaitingScreen.module.css";

interface WaitingScreenProps {
  waitingTimeSeconds: number;
}

/**
 * 待機画面コンポーネント
 * 最初の5秒間「モニターをご覧ください！」を表示
 */
export function WaitingScreen({ waitingTimeSeconds }: WaitingScreenProps) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.emoji}>📺</div>
        <h1 className={styles.title}>モニターをご覧ください！</h1>
        <p className={styles.subtitle}>ランキングを発表中です...</p>
        <p className={styles.subtitle}>
          {waitingTimeSeconds}秒後に結果が表示されます...
        </p>
      </div>
    </div>
  );
}
