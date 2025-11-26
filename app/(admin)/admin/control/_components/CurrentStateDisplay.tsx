"use client";

import { useState } from "react";
import { SCREEN_NAMES } from "../_constants";
import type { QuizControlState } from "../_hooks";
import { resetEvent } from "@/app/_lib/actions/admin";

interface CurrentStateDisplayProps {
  state: QuizControlState;
  userCount: number;
  eventId: number;
  onReset: () => void;
  isUpdating: boolean;
}

/**
 * 現在の状態を表示するコンポーネント
 *
 * 表示内容:
 * - 現在の画面状態
 * - 参加者数
 * - 現在のピリオド名
 * - 現在の質問テキスト
 * - リセットボタン（ヘッダー右側）
 */
export function CurrentStateDisplay({
  state,
  userCount,
  eventId,
  onReset,
  isUpdating,
}: CurrentStateDisplayProps) {
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    const message =
      "問題表示の記録とユーザーの回答データが全て削除されます。\nリセットしてもよろしいですか？";

    if (!window.confirm(message)) {
      return;
    }

    setIsResetting(true);

    try {
      const result = await resetEvent(eventId);

      if (!result.success) {
        alert(`リセットに失敗しました:\n${result.error}`);
        return;
      }

      // リセット成功時に onReset コールバック実行
      onReset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "不明なエラー";
      alert(`リセット処理中にエラーが発生しました:\n${message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">現在の状態</h2>
        <button
          onClick={handleReset}
          disabled={isUpdating || isResetting}
          className="rounded px-3 py-1.5 text-sm font-medium transition-colors
            bg-red-100 text-red-700 hover:bg-red-200
            disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResetting ? "リセット中..." : "リセット"}
        </button>
      </div>

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
