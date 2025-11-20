"use client";

import { SCREEN_NAMES } from "../_constants";
import type { QuizControlState } from "../_hooks";

interface CurrentStateDisplayProps {
  state: QuizControlState;
  userCount: number;
}

/**
 * 現在の状態を表示するコンポーネント
 *
 * 表示内容:
 * - 現在の画面状態
 * - 参加者数
 * - 正答ユーザー数（将来実装）
 * - 現在のピリオド名
 * - 現在の質問テキスト
 */
export function CurrentStateDisplay({
  state,
  userCount,
}: CurrentStateDisplayProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">現在の状態</h2>

      <div className="mb-6 grid grid-cols-3 gap-6">
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase text-blue-600">
            画面状態
          </p>
          <p className="mt-2 text-2xl font-bold text-blue-900">
            {SCREEN_NAMES[state.currentScreen]}
          </p>
        </div>

        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-xs font-semibold uppercase text-green-600">
            参加者数
          </p>
          <p className="mt-2 text-2xl font-bold text-green-900">{userCount}</p>
        </div>

        <div className="rounded-lg bg-purple-50 p-4">
          <p className="text-xs font-semibold uppercase text-purple-600">
            正答ユーザー数(未実装)
          </p>
          <p className="mt-2 text-2xl font-bold text-purple-900">{userCount}</p>
        </div>
      </div>

      {state.periodName && (
        <div className="space-y-2 border-t border-gray-200 pt-4 text-sm text-gray-600">
          <p>
            <strong>現在のピリオド:</strong> {state.periodName}
          </p>
          {state.questionText && (
            <p>
              <strong>現在の質問:</strong> {state.questionText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
