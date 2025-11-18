import Link from "next/link";
import type { QuizWithChoices } from "@/app/_lib/actions/admin/quizzes";

interface QuizListItemProps {
  quiz: QuizWithChoices;
  index: number;
  total: number;
  eventId: number;
  periodId: number;
  isLoading: boolean;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function QuizListItem({
  quiz,
  index,
  total,
  eventId,
  periodId,
  isLoading,
  onDelete,
  onMoveUp,
  onMoveDown,
}: QuizListItemProps) {
  const canMoveUp = index > 0;
  const canMoveDown = index < total - 1;

  return (
    <div
      className="
        flex items-center justify-between
        rounded-lg border border-gray-200 bg-white p-4
        transition-shadow hover:shadow-md
      "
    >
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">
            #{index + 1}
          </span>
          <h3 className="text-lg font-medium text-gray-900">{quiz.text}</h3>
          {quiz.image_url && (
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              📷 画像あり
            </span>
          )}
        </div>
        <div className="mt-1 ml-12 text-sm text-gray-600">
          選択肢: {quiz.choices.length}個
        </div>
      </div>

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
          href={`/admin/events/${eventId}/periods/${periodId}/quizzes/${quiz.id}/preview`}
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
          href={`/admin/events/${eventId}/periods/${periodId}/quizzes/${quiz.id}/edit`}
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
    </div>
  );
}
