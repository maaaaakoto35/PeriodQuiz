"use client";

import { createContext, useContext } from "react";
import type { SessionHeartbeatStatus } from "@/app/_lib/hooks/useSessionHeartbeat";

interface SessionContextValue {
  eventId: number;
  userId: number;
  heartbeatStatus: SessionHeartbeatStatus;
  heartbeatError: Error | null;
}

export const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);

export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error(
      "useSessionContext must be used within SessionContext.Provider"
    );
  }
  return context;
}
