import type { QuizScreen } from "../types/quiz";

/**
 * BGMトラック設定
 */
export interface BGMTrack {
  url: string;
  loop: boolean;
}

/**
 * BGMトラック設定
 *
 * 各画面に対応するBGMファイルのパスとループ設定を定義
 * - waiting, break: ループ再生
 * - その他: 1回のみ再生
 */
export const BGM_TRACKS: Record<QuizScreen, BGMTrack> = {
  waiting: {
    url: '/audio/waiting.mp3',
    loop: true,
  },
  question_reading: {
    url: '/audio/question_reading.mp3',
    loop: false,
  },
  question: {
    url: '/audio/question.mp3',
    loop: false,
  },
  answer_check: {
    url: '/audio/answer_check.mp3',
    loop: false,
  },
  answer: {
    url: '/audio/answer.mp3',
    loop: false,
  },
  break: {
    url: '/audio/break.mp3',
    loop: false,
  },
  period_result: {
    url: '/audio/period_result.mp3',
    loop: false,
  },
  final_result: {
    url: '/audio/final_result.mp3',
    loop: true,
  },
} as const;
