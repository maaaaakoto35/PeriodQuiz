"use client";

import { type PeriodResultData } from "@/app/_lib/actions/user";
import styles from "./UserScoreCard.module.css";

interface UserScoreCardProps {
  userResult: PeriodResultData["userResult"];
  isChampion: boolean;
}

/**
 * ユーザー成績表示カード
 * 順位、ニックネーム、正解数、合計時間を表示
 */
export function UserScoreCard({ userResult, isChampion }: UserScoreCardProps) {
  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(1);
  };

  return (
    <div
      className={`${styles.card} ${
        isChampion ? styles.champion : styles.normal
      }`}
    >
      <div className={styles.cardContent}>
        <div>
          <span className={styles.label}>順位</span>
          <p
            className={`${styles.rankValue} ${
              isChampion ? styles.championText : styles.normalText
            }`}
          >
            {userResult.rank === 1 ? "🏆" : userResult.rank}位
          </p>
        </div>

        <div>
          <span className={styles.label}>ニックネーム</span>
          <p className={styles.nickname}>{userResult.nickname}</p>
        </div>

        <div>
          <span className={styles.label}>正解数</span>
          <p className={styles.correctCount}>{userResult.correctCount}問</p>
        </div>

        <div>
          <span className={styles.label}>合計時間</span>
          <p className={styles.totalTime}>
            {formatTime(userResult.totalResponseTimeMs)}秒
          </p>
        </div>
      </div>

      {/* チャンピオンメッセージ */}
      {isChampion && (
        <div className={styles.championMessage}>
          <p className={styles.championText2}>🎉 チャンピオンです！ 🎉</p>
          <p className={styles.congratulations}>おめでとうございます！</p>
        </div>
      )}
    </div>
  );
}
