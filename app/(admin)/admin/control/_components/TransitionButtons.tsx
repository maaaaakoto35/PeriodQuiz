"use client";

import { QuizScreen } from "@/app/_lib/types/quiz";
import { SCREEN_NAMES, BUTTON_COLORS, ALL_SCREENS } from "../_constants";

interface TransitionButtonsProps {
  onTransition: (nextScreen: QuizScreen) => Promise<void>;
  possibleTransitions: QuizScreen[];
  isUpdating: boolean;
}

/**
 * 画面遷移ボタンを表示するコンポーネント
 *
 * 表示内容:
 * - すべての画面状態への遷移ボタン
 * - 可能な遷移のみを有効化
 * - 更新中は全ボタンを無効化
 */
export function TransitionButtons({
  onTransition,
  possibleTransitions,
  isUpdating,
}: TransitionButtonsProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">画面遷移</h2>
      <p className="mb-6 text-xs text-gray-600">
        ピリオド結果画面は20秒間、最終結果画面は120秒間「モニターをご覧ください！」を表示します
      </p>

      <div className="space-y-2">
        {ALL_SCREENS.map((nextScreen) => {
          const colors = BUTTON_COLORS[nextScreen];
          const isEnabled = possibleTransitions.includes(nextScreen);

          return (
            <button
              key={nextScreen}
              onClick={() => onTransition(nextScreen)}
              disabled={isUpdating || !isEnabled}
              className={`
                w-full rounded-lg border-2 px-4 py-3 text-left
                transition-colors
                font-medium
                ${colors.bg} ${colors.border} ${colors.text}
                ${isEnabled ? colors.hover : "hover:opacity-50"}
                disabled:cursor-not-allowed disabled:opacity-40
              `}
            >
              {SCREEN_NAMES[nextScreen]} へ移行
            </button>
          );
        })}
      </div>
    </div>
  );
}
