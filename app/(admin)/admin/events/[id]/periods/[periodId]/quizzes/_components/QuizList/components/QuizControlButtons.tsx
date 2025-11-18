"use client";

import Link from "next/link";

interface QuizControlButtonsProps {
  quizId: number;
  eventId: number;
  periodId: number;
  index: number;
  total: number;
  isLoading: boolean;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function QuizControlButtons({
  quizId,
  eventId,
  periodId,
  index,
  total,
  isLoading,
  onDelete,
  onMoveUp,
  onMoveDown,
}: QuizControlButtonsProps) {
  const canMoveUp = index > 0;
  const canMoveDown = index < total - 1;

  return (
    <div className="flex items-center gap-2">
      {/* 上移動ボタン */}
      <button
        onClick={onMoveUp}
        disabled={!canMoveUp || isLoading}
        title="上へ移動"
        className="
          p-2 text-gray-400 hover:text-gray-600
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>

      {/* 下移動ボタン */}
      <button
        onClick={onMoveDown}
        disabled={!canMoveDown || isLoading}
        title="下へ移動"
        className="
          p-2 text-gray-400 hover:text-gray-600
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* プレビューリンク */}
      <Link
        href={`/admin/events/${eventId}/periods/${periodId}/quizzes/${quizId}/preview`}
        className="
          inline-flex items-center justify-center
          rounded-md px-3 py-2
          text-sm font-medium text-gray-600
          hover:bg-gray-50
          transition-colors
        "
      >
        プレビュー
      </Link>

      {/* 編集リンク */}
      <Link
        href={`/admin/events/${eventId}/periods/${periodId}/quizzes/${quizId}/edit`}
        className="
          inline-flex items-center justify-center
          rounded-md px-3 py-2
          text-sm font-medium text-blue-600
          hover:bg-blue-50
          transition-colors
        "
      >
        編集
      </Link>

      {/* 削除ボタン */}
      <button
        onClick={onDelete}
        disabled={isLoading}
        className="
          inline-flex items-center justify-center
          rounded-md px-3 py-2
          text-sm font-medium text-red-600
          hover:bg-red-50
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
      >
        削除
      </button>
    </div>
  );
}
