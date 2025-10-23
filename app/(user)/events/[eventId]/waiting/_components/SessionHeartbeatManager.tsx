"use client";

import { useState } from "react";
import {
  useSessionHeartbeat,
  type SessionHeartbeatStatus,
} from "@/app/_lib/hooks/useSessionHeartbeat";
import { SessionStatusIndicator } from "./SessionStatusIndicator";

interface SessionHeartbeatManagerProps {
  eventId: number;
  userId: number;
}

/**
 * セッションハートビート管理コンポーネント（Client Component）
 *
 * セッションの更新とステータス表示を管理します
 */
export function SessionHeartbeatManager({
  eventId,
  userId,
}: SessionHeartbeatManagerProps) {
  const [heartbeatStatus, setHeartbeatStatus] =
    useState<SessionHeartbeatStatus>("idle");
  const [error, setError] = useState<Error | null>(null);

  // セッションハートビートを開始
  useSessionHeartbeat({
    eventId,
    userId,
    enabled: true,
    heartbeatInterval: 15 * 1000, // 15秒
    onStatusChange: setHeartbeatStatus,
    onError: setError,
  });

  return <SessionStatusIndicator status={heartbeatStatus} error={error} />;
}
