"use client";

import { ReactNode, useState } from "react";
import { useSessionHeartbeat } from "@/app/_lib/hooks/useSessionHeartbeat";
import { SessionContext } from "../_context/SessionContext";
import { SessionStatusNotification } from "./SessionStatusNotification";
import type { SessionHeartbeatStatus } from "@/app/_lib/hooks/useSessionHeartbeat";

interface QuizClientLayoutProps {
  initialEventId: number;
  initialUserId: number;
  children: ReactNode;
}

export function QuizClientLayout({
  initialEventId,
  initialUserId,
  children,
}: QuizClientLayoutProps) {
  const [heartbeatStatus, setHeartbeatStatus] =
    useState<SessionHeartbeatStatus>("idle");
  const [heartbeatError, setHeartbeatError] = useState<Error | null>(null);

  useSessionHeartbeat({
    eventId: initialEventId,
    userId: initialUserId,
    enabled: true,
    heartbeatInterval: 15 * 1000,
    onStatusChange: setHeartbeatStatus,
    onError: setHeartbeatError,
  });

  return (
    <SessionContext.Provider
      value={{
        eventId: initialEventId,
        userId: initialUserId,
        heartbeatStatus,
        heartbeatError,
      }}
    >
      {children}
      <SessionStatusNotification
        status={heartbeatStatus}
        error={heartbeatError}
      />
    </SessionContext.Provider>
  );
}
