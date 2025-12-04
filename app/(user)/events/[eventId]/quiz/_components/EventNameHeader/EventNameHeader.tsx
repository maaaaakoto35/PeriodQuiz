"use client";

import { useSessionContext } from "../../_context/SessionContext";
import styles from "./EventNameHeader.module.css";

/**
 * イベント名ヘッダーコンポーネント
 * - useSessionContext でイベント名を取得（Client Component 必須）
 */
export function EventNameHeader() {
  const { eventName } = useSessionContext();

  return (
    <div>
      <h1 className={styles.title}>{eventName}</h1>
    </div>
  );
}
