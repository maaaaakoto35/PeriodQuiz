"use client";

import { createContext, useContext } from "react";
import type { EventInfo } from "@/app/_lib/actions/admin";

/**
 * モニター画面のイベント情報コンテキスト値
 *
 * 責務:
 * - eventInfo: イベント情報（eventName, periodName, questionNumber）
 * - loading: データ取得中フラグ
 * - error: エラーメッセージ
 */
interface MonitorEventInfoContextValue {
  eventInfo: EventInfo | null;
  loading: boolean;
  error: string | null;
}

const MonitorEventInfoContext = createContext<
  MonitorEventInfoContextValue | undefined
>(undefined);

/**
 * MonitorEventInfoContext を使用するカスタムフック
 *
 * @returns MonitorEventInfoContextValue
 * @throws コンテキストプロバイダーの外で呼び出された場合、エラーをスロー
 */
export function useMonitorEventInfoContext(): MonitorEventInfoContextValue {
  const context = useContext(MonitorEventInfoContext);
  if (!context) {
    throw new Error(
      "useMonitorEventInfoContext must be used within MonitorEventInfoProvider"
    );
  }
  return context;
}

/**
 * MonitorEventInfoContext プロバイダーコンポーネント
 */
export function MonitorEventInfoContextProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: MonitorEventInfoContextValue;
}) {
  return (
    <MonitorEventInfoContext.Provider value={value}>
      {children}
    </MonitorEventInfoContext.Provider>
  );
}
