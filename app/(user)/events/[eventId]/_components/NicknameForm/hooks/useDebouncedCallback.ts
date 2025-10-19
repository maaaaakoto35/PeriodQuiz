import { useCallback, useRef } from 'react';

/**
 * デバウンス付きコールバックを作成するhook
 *
 * @param callback - 実行するコールバック関数
 * @param delay - デバウンス遅延時間（ミリ秒）
 * @returns デバウンスされたコールバック関数
 */
export function useDebouncedCallback<Args extends unknown[], R>(
  callback: (...args: Args) => R | Promise<R>,
  delay: number
): (...args: Args) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Args) => {
      // 既存のタイマーをクリア
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 新しいタイマーを設定
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}
