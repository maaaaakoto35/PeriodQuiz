import { QuizScreen } from '@/app/_lib/types/quiz';

export interface ButtonColorScheme {
  bg: string;
  border: string;
  hover: string;
  text: string;
}

/**
 * ボタンの色スキーム
 * 各画面状態に対応する Tailwind CSS クラス
 */
export const BUTTON_COLORS: Record<QuizScreen, ButtonColorScheme> = {
  waiting: {
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    hover: 'hover:bg-slate-100 hover:border-slate-400',
    text: 'text-slate-900',
  },
  question: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    hover: 'hover:bg-amber-100 hover:border-amber-400',
    text: 'text-amber-900',
  },
  answer: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    hover: 'hover:bg-emerald-100 hover:border-emerald-400',
    text: 'text-emerald-900',
  },
  break: {
    bg: 'bg-sky-50',
    border: 'border-sky-300',
    hover: 'hover:bg-sky-100 hover:border-sky-400',
    text: 'text-sky-900',
  },
  period_result: {
    bg: 'bg-violet-50',
    border: 'border-violet-300',
    hover: 'hover:bg-violet-100 hover:border-violet-400',
    text: 'text-violet-900',
  },
  final_result: {
    bg: 'bg-rose-50',
    border: 'border-rose-300',
    hover: 'hover:bg-rose-100 hover:border-rose-400',
    text: 'text-rose-900',
  },
};
