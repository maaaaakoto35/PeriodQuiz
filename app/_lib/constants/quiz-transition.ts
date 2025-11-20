import { QuizScreen } from "@/app/_lib/types/quiz";

/**
 * クイズ画面遷移ルール
 * 各画面状態から遷移可能な次の画面状態を定義
 */
export const QUIZ_TRANSITION_RULES: Record<QuizScreen, QuizScreen[]> = {
  waiting: ["question"],
  question: ["answer"],
  answer: ["question", "break", "period_result"],
  break: ["question", "period_result"],
  period_result: ["question", "final_result"],
  final_result: [],
};
