"use client";

import { type PeriodResultData } from "@/app/_lib/actions/user";
import { UserScoreCard } from "../";
import styles from "./ResultScreen.module.css";

interface ResultScreenProps {
  data: PeriodResultData;
}

/**
 * 結果表示画面コンポーネント
 * ユーザーの順位と成績を表示
 */
export function ResultScreen({ data }: ResultScreenProps) {
  const { periodName, userResult } = data;
  const isChampion = userResult.rank === 1;

  return (
    <>
      {/* ヘッダー */}
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>ピリオド結果</h1>
        <p className={styles.periodName}>{periodName}</p>
      </div>

      {/* ユーザーの順位と成績 */}
      <div className={styles.content}>
        <h2 className={styles.contentTitle}>あなたの成績</h2>
        <UserScoreCard userResult={userResult} isChampion={isChampion} />
      </div>

      {/* フッター */}
      <div className={styles.footer}>次のピリオドへ進みます...</div>
    </>
  );
}
