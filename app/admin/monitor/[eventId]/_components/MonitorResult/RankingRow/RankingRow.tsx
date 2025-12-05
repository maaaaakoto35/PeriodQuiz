"use client";

import { useState } from "react";
import styles from "./RankingRow.module.css";

interface RankingRowProps {
  rank: number;
  nickname: string;
  correctCount: number;
  time: number;
}

/**
 * ランキング行コンポーネント
 *
 * 1位と2位以降で異なるスタイルを適用
 */
export function RankingRow({
  rank,
  nickname,
  correctCount,
  time,
}: RankingRowProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const isTopThree = rank <= 3;
  const isFirstPlace = rank === 1;
  const rootClassName = isFirstPlace ? styles.rootRank1 : styles.rootRank2Plus;
  const rankClassName = isFirstPlace ? styles.rankRank1 : styles.rank;
  const correctCountClassName = isFirstPlace
    ? styles.correctCountRank1
    : styles.correctCountRank2Plus;
  const timeClassName = isFirstPlace ? styles.timeRank1 : styles.time;

  return (
    <div className={rootClassName}>
      {/* 順位 */}
      <div className={rankClassName}>{rank}</div>

      {/* ニックネーム */}
      <div className={styles.name}>
        {isTopThree && !isRevealed ? (
          <button
            onClick={() => setIsRevealed(true)}
            className={styles.revealButton}
          >
            表示
          </button>
        ) : (
          nickname
        )}
      </div>

      {/* 正解数 */}
      <div className={correctCountClassName}>{correctCount}問</div>

      {/* 解答時間 */}
      <div className={timeClassName}>{time.toFixed(2)}</div>
    </div>
  );
}
