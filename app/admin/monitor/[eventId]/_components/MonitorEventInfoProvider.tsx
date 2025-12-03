"use client";

import { MonitorEventInfoContextProvider } from "../_context/MonitorEventInfoContext";
import { useQuizScreenContext } from "../_context/QuizScreenContext";
import { useEventInfoFetch } from "../_hooks/useEventInfoFetch";

interface MonitorEventInfoProviderProps {
  children: React.ReactNode;
}

/**
 * モニター画面のイベント情報プロバイダーコンポーネント
 *
 * 責務:
 * - useQuizScreenContext から eventId と currentScreen を取得
 * - useEventInfoFetch でイベント情報を取得・管理
 * - MonitorEventInfoContext でイベント情報を提供
 */
export function MonitorEventInfoProvider({
  children,
}: MonitorEventInfoProviderProps) {
  const { eventId, currentScreen } = useQuizScreenContext();
  const { eventInfo, loading, error } = useEventInfoFetch(
    eventId,
    currentScreen
  );

  return (
    <MonitorEventInfoContextProvider
      value={{
        eventInfo,
        loading,
        error,
      }}
    >
      {children}
    </MonitorEventInfoContextProvider>
  );
}
