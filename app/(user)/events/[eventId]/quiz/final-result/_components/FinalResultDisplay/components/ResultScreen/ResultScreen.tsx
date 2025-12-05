"use client";

import { type FinalResultData } from "@/app/_lib/actions/user";
import { UserScoreCard } from "../";
import styles from "./ResultScreen.module.css";

interface ResultScreenProps {
  data: FinalResultData;
}

/**
 * 最終結果画面コンポーネント
 * 全体ランキング、ユーザーの順位と成績、ピリオドチャンピオンを表示
 */
export function ResultScreen({ data }: ResultScreenProps) {
  const { eventName, userResult, periodChampions } = data;
  const isChampion = userResult.rank === 1;

  // 回答時間をミリ秒から秒に変換
  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(1);
  };

  return (
    <>
      {/* ヘッダー */}
      <div className={styles.header}>
        <h1 className={styles.title}>最終結果</h1>
        <p className={styles.eventName}>{eventName}</p>
      </div>

      {/* メインコンテンツ */}
      <div className={styles.content}>
        {/* ユーザーの順位と成績 */}
        <div>
          <h2 className={styles.sectionTitle}>あなたの成績</h2>
          <UserScoreCard
            userResult={userResult}
            isChampion={isChampion}
            formatTime={formatTime}
          />
        </div>

        {/* 区切り線 */}
        {periodChampions.length > 0 && <div className={styles.divider} />}

        {/* ピリオドチャンピオン一覧 */}
        {periodChampions.length > 0 && (
          <div>
            <h2 className={styles.sectionTitle}>各ピリオドのチャンピオン</h2>
            <div className={styles.periodChampionsGrid}>
              {periodChampions.map((champion) => (
                <div
                  key={champion.periodId}
                  className={styles.periodChampionCard}
                >
                  <h3 className={styles.periodChampionCardTitle}>
                    {champion.periodName}
                  </h3>
                  <div>
                    <div className={styles.periodChampionItem}>
                      <span className={styles.periodChampionLabel}>
                        チャンピオン
                      </span>
                      <span className={styles.periodChampionValue}>
                        {champion.nickname}
                      </span>
                    </div>
                    <div className={styles.periodChampionItem}>
                      <span className={styles.periodChampionLabel}>正解数</span>
                      <span className={styles.periodChampionCorrectCount}>
                        {champion.correctCount}問
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* フッター */}
      <div className={styles.footer}>ご参加ありがとうございました！</div>
    </>
  );
}
