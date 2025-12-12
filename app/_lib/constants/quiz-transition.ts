import { QuizScreen } from "@/app/_lib/types/quiz";

/**
 * クイズ画面遷移ルール
 * 各画面状態から遷移可能な次の画面状態を定義
 */
export const QUIZ_TRANSITION_RULES: Record<QuizScreen, QuizScreen[]> = {
  waiting: ["question_reading"],
  question_reading: ["question"],
  question: ["answer_check"],
  answer_check: ["answer"],
  answer: ["question_reading", "break", "period_result"],
  break: ["question_reading", "period_result"],
  period_result: ["question_reading", "final_result"],
  final_result: [],
};
