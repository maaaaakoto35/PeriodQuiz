"use client";

import { useSessionContext } from "../_context/SessionContext";
import type { SessionHeartbeatStatus } from "@/app/_lib/hooks/useSessionHeartbeat";

function getStatusStyle(status: SessionHeartbeatStatus) {
  const styles = {
    connected: {
      dot: "bg-emerald-500",
      text: "text-slate-700",
    },
    error: {
      dot: "bg-red-500",
      text: "text-slate-700",
    },
    idle: {
      dot: "bg-gray-400",
      text: "text-slate-700",
    },
  };
  return styles[status] || styles.idle;
}

function getStatusLabel(status: SessionHeartbeatStatus): string {
  const labels = {
    connected: "接続中",
    error: "接続エラー",
    idle: "準備中",
  };
  return labels[status] || labels.idle;
}

export function SessionStatusNotification() {
  const { heartbeatStatus, heartbeatError } = useSessionContext();
  const style = getStatusStyle(heartbeatStatus);
  const label = getStatusLabel(heartbeatStatus);

  // エラーがある場合はエラー表示優先
  if (heartbeatError) {
    return (
      <div className="fixed top-2 left-2 z-50">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚠️</span>
            <p className="text-sm font-semibold text-red-700">接続エラー</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded transition-colors"
          >
            リロード
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-2 left-2 z-50">
      <div className="bg-white rounded-lg p-2.5 shadow-sm border border-slate-200 flex items-center gap-2 max-w-xs">
        <div
          className={`w-2.5 h-2.5 rounded-full ${style.dot} animate-pulse flex-shrink-0`}
        />
        <span className={`text-xs font-medium ${style.text} whitespace-nowrap`}>
          {label}
        </span>
      </div>
    </div>
  );
}
