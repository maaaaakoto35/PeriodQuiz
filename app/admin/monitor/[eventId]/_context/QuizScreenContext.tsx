"use client";

import { createContext, useContext } from "react";
import type { QuizScreen } from "@/app/_lib/types/quiz";

/**
 * クイズ画面状態のコンテキスト値
 *
 * 責務:
 * - eventId: 現在のイベントID
 * - currentScreen: 現在の画面状態
 */
interface QuizScreenContextValue {
  eventId: number;
  currentScreen: QuizScreen;
}

const QuizScreenContext = createContext<QuizScreenContextValue | undefined>(
  undefined
);

/**
 * QuizScreenContext を使用するカスタムフック
 *
 * @returns QuizScreenContextValue
 * @throws コンテキストプロバイダーの外で呼び出された場合、エラーをスロー
 */
export function useQuizScreenContext(): QuizScreenContextValue {
  const context = useContext(QuizScreenContext);
  if (!context) {
    throw new Error(
      "useQuizScreenContext must be used within QuizScreenProvider"
    );
  }
  return context;
}

/**
 * QuizScreenContext プロバイダーコンポーネント
 */
export function QuizScreenContextProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: QuizScreenContextValue;
}) {
  return (
    <QuizScreenContext.Provider value={value}>
      {children}
    </QuizScreenContext.Provider>
  );
}
