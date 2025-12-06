import { QuizScreen } from '@/app/_lib/types/quiz';

/**
 * 画面名マッピング
 */
export const SCREEN_NAMES: Record<QuizScreen, string> = {
  waiting: '待機中',
  question: '問題表示',
  answer_check: 'アンサーチェック',
  answer: '正解発表',
  break: '休憩',
  period_result: 'ピリオド結果',
  final_result: '最終結果',
};

/**
 * すべての画面状態の配列
 */
export const ALL_SCREENS: QuizScreen[] = [
  'waiting',
  'question',
  'answer_check',
  'answer',
  'break',
  'period_result',
  'final_result',
];
