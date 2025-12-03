"use client";

import { MonitorHeader } from "../MonitorHeader";
import styles from "./MonitorWaiting.module.css";

/**
 * モニター画面 - 待機中
 *
 * クイズ開始を待っている状態を表示
 */
export function MonitorWaiting() {
  return (
    <div className={styles.container}>
      <MonitorHeader />

      <div className={styles.content}>
        <div className={styles.spinnerWrapper}>
          <div className={styles.spinner}></div>
        </div>

        <h1 className={styles.title}>クイズ開始待機中</h1>

        <p className={styles.description}>
          主催者がクイズを開始するまで、このまましばらくお待ちください
        </p>

        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            このモニター画面は、ユーザー画面と同期して自動的に切り替わります
          </p>
        </div>
      </div>
    </div>
  );
}
