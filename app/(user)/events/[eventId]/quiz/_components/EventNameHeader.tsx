"use client";

import { useSessionContext } from "../_context/SessionContext";

/**
 * イベント名ヘッダーコンポーネント
 * - useSessionContext でイベント名を取得（Client Component 必須）
 */
export function EventNameHeader() {
  const { eventName } = useSessionContext();

  return (
    <div className="mb-4">
      <h1
        className="
        text-2xl font-bold text-white
        drop-shadow-lg
      "
      >
        {eventName}
      </h1>
    </div>
  );
}
