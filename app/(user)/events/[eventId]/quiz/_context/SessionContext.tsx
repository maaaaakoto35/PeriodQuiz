"use client";

import { createContext, useContext } from "react";
import type { SessionHeartbeatStatus } from "@/app/_lib/hooks/useSessionHeartbeat";
import type { QuizScreen } from "@/app/_lib/types/quiz";

interface SessionContextValue {
  eventId: number;
  eventName: string;
  userId: number;
  heartbeatStatus: SessionHeartbeatStatus;
  heartbeatError: Error | null;
  currentScreen: QuizScreen | null;
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
