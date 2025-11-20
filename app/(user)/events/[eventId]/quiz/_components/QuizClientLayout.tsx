"use client";

import { ReactNode, useState } from "react";
import { useSessionHeartbeat } from "@/app/_lib/hooks/useSessionHeartbeat";
import { useQuizRealtimeListener } from "../_hooks/useQuizRealtimeListener";
import { useScreenNavigation } from "../_hooks/useScreenNavigation";
import { SessionContext } from "../_context/SessionContext";
import type { SessionHeartbeatStatus } from "@/app/_lib/hooks/useSessionHeartbeat";
import type { QuizScreen } from "@/app/_lib/types/quiz";
import { SessionStatusNotification } from "@/app/(user)/events/[eventId]/quiz/_components/SessionStatusNotification";

interface QuizClientLayoutProps {
  initialEventId: number;
  initialEventName: string;
  initialUserId: number;
  initialCurrentScreen: QuizScreen;
  children: ReactNode;
}

export function QuizClientLayout({
  initialEventId,
  initialEventName,
  initialUserId,
  initialCurrentScreen,
  children,
}: QuizClientLayoutProps) {
  const [heartbeatStatus, setHeartbeatStatus] =
    useState<SessionHeartbeatStatus>("idle");
  const [heartbeatError, setHeartbeatError] = useState<Error | null>(null);
  const [currentScreen, setCurrentScreen] =
    useState<QuizScreen>(initialCurrentScreen);

  useSessionHeartbeat({
    enabled: true,
    heartbeatInterval: 15 * 1000,
    onStatusChange: setHeartbeatStatus,
    onError: setHeartbeatError,
  });

  // Realtimeでscreen変更を監視
  useQuizRealtimeListener({
    eventId: initialEventId,
    onScreenChange: setCurrentScreen,
  });

  // currentScreen の変更を監視して画面遷移を行う
  useScreenNavigation({
    currentScreen,
    eventId: initialEventId,
  });

  return (
    <SessionContext.Provider
      value={{
        eventId: initialEventId,
        eventName: initialEventName,
        userId: initialUserId,
        heartbeatStatus,
        heartbeatError,
        currentScreen,
      }}
    >
      {children}
      <SessionStatusNotification />
    </SessionContext.Provider>
  );
}
