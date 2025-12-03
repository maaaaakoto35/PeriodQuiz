"use client";

import { useEffect, useState } from "react";
import { getEventInfoForMonitor } from "@/app/_lib/actions/admin";
import type { EventInfo } from "@/app/_lib/actions/admin";

interface EventInfoState {
  eventInfo: EventInfo | null;
  loading: boolean;
  error: string | null;
}

/**
 * モニター画面のイベント情報を取得するカスタムフック
 *
 * 責務:
 * - eventId と currentScreen に基づいて eventInfo を取得
 * - ローディング状態とエラー状態を管理
 * - アンマウント時のクリーンアップを処理
 *
 * @param eventId - イベントID
 * @param currentScreen - 現在の画面状態
 * @returns イベント情報と状態
 */
export function useEventInfoFetch(
  eventId: number,
  currentScreen: string
): EventInfoState {
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchEventInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        const info = await getEventInfoForMonitor(eventId);

        if (isMounted) {
          setEventInfo(info || null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "イベント情報の取得に失敗しました"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEventInfo();

    return () => {
      isMounted = false;
    };
  }, [eventId, currentScreen]);

  return {
    eventInfo,
    loading,
    error,
  };
}
