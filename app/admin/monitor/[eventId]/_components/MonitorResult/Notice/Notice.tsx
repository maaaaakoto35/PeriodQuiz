"use client";

import styles from "./Notice.module.css";

interface NoticeProps {
  isPeriod?: boolean;
}

/**
 * ピリオド結果画面の右側に表示される装飾パネル
 */
export function Notice({ isPeriod }: NoticeProps) {
  const Text = () => {
    if (isPeriod) {
      return (
        <>
          早押しベスト
          <span className={styles.textCombine}>10</span>
        </>
      );
    }

    return "個人成績ランキング";
  };

  return (
    <div className={styles.notice}>
      <div className={styles.noticeText}>
        <Text />
      </div>
    </div>
  );
}
