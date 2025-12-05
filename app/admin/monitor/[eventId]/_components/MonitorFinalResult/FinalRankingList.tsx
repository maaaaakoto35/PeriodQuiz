"use client";

import { useState } from "react";
import { RankingRow } from "../MonitorResult";
import styles from "./FinalRankingList.module.css";
import { RankingEntry } from "@/app/_lib/actions/user";

const ITEMS_PER_PAGE = 10;

/**
 * 最終ランキングリスト
 *
 * 10位ごとにページング表示
 * 下位のページから表示される（逆順でページ化）
 */
export function FinalRankingList({ rankings }: { rankings: RankingEntry[] }) {
  // ランキングを10位ごとにページング
  // ページ順を入れ替えし、最下位が含まれるページを最初のページにする
  const totalPages = Math.ceil(rankings.length / ITEMS_PER_PAGE);

  // ランキング上位から10位ごとにページを作成
  const pages = Array.from({ length: totalPages }, (_, i) =>
    rankings.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE)
  );

  // ページの順番を入れ替え（逆順に）
  const reversedPages = pages.reverse();

  // 初期表示：最初のページ（最下位が含まれるページ）
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // 現在のページのランキング（各ページ内ではランキングの上から表示）
  const currentPageRankings = reversedPages[currentPageIndex] || [];

  if (rankings.length === 0) {
    return (
      <div className={styles.emptyState}>ランキングデータがありません</div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.rankingContent}>
        {currentPageRankings.map((entry) => (
          <RankingRow
            key={`${entry.rank}-${entry.userId}`}
            rank={entry.rank}
            nickname={entry.nickname}
            correctCount={entry.correctCount}
            time={entry.totalResponseTimeMs / 1000}
          />
        ))}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() =>
              setCurrentPageIndex((prev) =>
                prev === 0 ? totalPages - 1 : prev - 1
              )
            }
          >
            ←
          </button>
          <span className={styles.pageInfo}>
            {currentPageIndex + 1} / {totalPages}
          </span>
          <button
            className={styles.pageButton}
            onClick={() =>
              setCurrentPageIndex((prev) =>
                prev === totalPages - 1 ? 0 : prev + 1
              )
            }
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
