"use client";

import { type FinalResultData } from "@/app/_lib/actions/user";
import styles from "./UserScoreCard.module.css";

interface UserScoreCardProps {
  userResult: FinalResultData["userResult"];
  isChampion: boolean;
  formatTime: (ms: number) => string;
}

/**
 * ユーザースコアカードコンポーネント
 * ユーザーの順位、ニックネーム、正解数、合計時間を表示
 * 優勝者の場合は特別な強調表示
 */
export function UserScoreCard({
  userResult,
  isChampion,
  formatTime,
}: UserScoreCardProps) {
  return (
    <div
      className={
        isChampion
          ? styles.userResultBox
          : `${styles.userResultBox} ${styles.notChampion}`
      }
    >
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>順位</span>
          <p className={styles.statValue}>
            {userResult.rank === 1 ? "🏆" : userResult.rank}位
          </p>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statLabel}>ニックネーム</span>
          <p className={styles.statValue} style={{ fontSize: "1.5rem" }}>
            {userResult.nickname}
          </p>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statLabel}>全体正解数</span>
          <p className={styles.statValue}>{userResult.correctCount}問</p>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statLabel}>全体合計時間</span>
          <p className={styles.statValue}>
            {formatTime(userResult.totalResponseTimeMs)}秒
          </p>
        </div>
      </div>

      {/* 優勝者メッセージ */}
      {isChampion && (
        <div className={styles.championsMessage}>
          <p className={styles.championsEmoji}>🎉 優勝です！ 🎉</p>
          <p className={styles.championsText}>
            全員の中でチャンピオンです！おめでとうございます！
          </p>
        </div>
      )}
    </div>
  );
}
