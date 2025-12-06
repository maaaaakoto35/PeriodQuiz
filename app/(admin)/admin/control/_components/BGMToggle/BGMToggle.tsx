"use client";

import { useState } from "react";
import { updateBgmEnabled } from "@/app/_lib/actions/admin";
import styles from "./BGMToggle.module.css";

interface BGMToggleProps {
  eventId: number;
  initialEnabled: boolean;
}

/**
 * BGM ON/OFF トグルボタン
 *
 * 責務:
 * - BGMの有効/無効を切り替える
 * - Server Actionを呼び出してquiz_controlを更新
 */
export function BGMToggle({ eventId, initialEnabled }: BGMToggleProps) {
  const [bgmEnabled, setBgmEnabled] = useState(initialEnabled);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    setIsUpdating(true);
    setError(null);

    const newEnabled = !bgmEnabled;
    const result = await updateBgmEnabled({
      eventId,
      enabled: newEnabled,
    });

    setIsUpdating(false);

    if (result.success) {
      setBgmEnabled(result.data.bgmEnabled);
    } else {
      setError(result.error);
      // エラー時は元の状態に戻す
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <span className={styles.label}>モニター画面BGM</span>
        <button
          onClick={handleToggle}
          disabled={isUpdating}
          className={`${styles.toggleButton} ${bgmEnabled ? styles.enabled : styles.disabled}`}
          aria-label={bgmEnabled ? "BGMをオフにする" : "BGMをオンにする"}
        >
          {isUpdating ? "更新中..." : bgmEnabled ? "ON" : "OFF"}
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
