"use client";

import type { SessionHeartbeatStatus } from "@/app/_lib/hooks/useSessionHeartbeat";

interface SessionStatusIndicatorProps {
  status: SessionHeartbeatStatus;
  error: Error | null;
}

/**
 * セッションステータスをユーザーフレンドリーなテキストに変換
 */
function getStatusText(status: SessionHeartbeatStatus): string {
  switch (status) {
    case "connected":
      return "セッション確立中";
    case "updating":
      return "セッション更新中...";
    case "error":
      return "セッション接続エラー";
    case "idle":
    default:
      return "セッション初期化中...";
  }
}

/**
 * セッションステータスの色を取得
 */
function getStatusColor(status: SessionHeartbeatStatus): string {
  switch (status) {
    case "connected":
      return "text-green-600";
    case "updating":
      return "text-yellow-600";
    case "error":
      return "text-red-600";
    case "idle":
    default:
      return "text-gray-600";
  }
}

/**
 * セッションステータスのバッジ色を取得
 */
function getStatusBadgeColor(status: SessionHeartbeatStatus): string {
  switch (status) {
    case "connected":
      return "bg-green-100 border-green-300";
    case "updating":
      return "bg-yellow-100 border-yellow-300";
    case "error":
      return "bg-red-100 border-red-300";
    case "idle":
    default:
      return "bg-gray-100 border-gray-300";
  }
}

/**
 * セッションステータスインジケーターコンポーネント
 *
 * セッションの接続状態を視覚的に表示します
 */
export function SessionStatusIndicator({
  status,
  error,
}: SessionStatusIndicatorProps) {
  return (
    <>
      {/* セッションステータスインジケーター */}
      <div
        className={`
        p-4 rounded-lg border-2
        ${getStatusBadgeColor(status)}
        `}
      >
        <div className="flex items-center justify-center gap-2">
          {/* ステータスアイコン */}
          <div
            className={`
            w-3 h-3 rounded-full
            ${status === "connected" ? "bg-green-600 animate-pulse" : ""}
            ${status === "updating" ? "bg-yellow-600 animate-bounce" : ""}
            ${status === "error" ? "bg-red-600" : ""}
            ${status === "idle" ? "bg-gray-600" : ""}
            `}
          ></div>
          <span className={`text-sm font-semibold ${getStatusColor(status)}`}>
            {getStatusText(status)}
          </span>
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            <span className="font-semibold">⚠️ エラー:</span>{" "}
            セッション接続に問題があります。ページをリロードしてください。
          </p>
        </div>
      )}
    </>
  );
}
