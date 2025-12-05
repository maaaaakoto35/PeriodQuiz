"use client";

import { useState, useEffect } from "react";

/**
 * 結果表示制御カスタムフック
 *
 * 任意秒数のカウントダウン後に結果を表示する機能を提供
 *
 * @returns showResult - 結果を表示するかどうか
 * @returns waitingSeconds - 残りの待機時間（秒）
 */
export function useResultDisplay({ seconds } : { seconds: number }) {
  const [showResult, setShowResult] = useState(false);
  const [waitingSeconds, setWaitingSeconds] = useState(seconds);

  useEffect(() => {
    if (showResult) return;

    const interval = setInterval(() => {
      setWaitingSeconds((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setShowResult(true);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showResult]);

  return { showResult, waitingSeconds };
}
