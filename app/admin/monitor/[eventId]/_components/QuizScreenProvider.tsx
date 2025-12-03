"use client";

import { useQuizScreenMonitoring } from "../_hooks/useQuizScreenMonitoring";
import { QuizScreenContextProvider } from "../_context/QuizScreenContext";
import type { QuizScreen } from "@/app/_lib/types/quiz";

interface QuizScreenProviderProps {
  children: React.ReactNode;
  eventId: number;
  initialScreen: QuizScreen;
}

/**
 * クイズ画面状態プロバイダーコンポーネント
 *
 * 責務:
 * - useQuizScreenMonitoring で current_screen をリアルタイム監視
 * - QuizScreenContext でEventId と currentScreen を提供
 */
export function QuizScreenProvider({
  children,
  eventId,
  initialScreen,
}: QuizScreenProviderProps) {
  const currentScreen = useQuizScreenMonitoring(eventId, initialScreen);

  return (
    <QuizScreenContextProvider value={{ eventId, currentScreen }}>
      {children}
    </QuizScreenContextProvider>
  );
}
