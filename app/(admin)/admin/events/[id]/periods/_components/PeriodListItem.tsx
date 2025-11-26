"use client";

import Link from "next/link";
import type { PeriodRecord } from "@/app/_lib/actions/admin/periods";

interface PeriodListItemProps {
  period: PeriodRecord;
  index: number;
  totalCount: number;
  onMoveUp: (index: number) => Promise<void>;
  onMoveDown: (index: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  eventId: number;
  isLoading: boolean;
}

export function PeriodListItem({
  period,
  index,
  totalCount,
  onMoveUp,
  onMoveDown,
  onDelete,
  eventId,
  isLoading,
}: PeriodListItemProps) {
  const canMoveUp = index > 0;
  const canMoveDown = index < totalCount - 1;

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
            #{period.order_num}
          </span>
          <h3 className="text-lg font-medium text-gray-900">{period.name}</h3>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* 上移動ボタン */}
        <button
          onClick={() => onMoveUp(index)}
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
          onClick={() => onMoveDown(index)}
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

        {/* 編集リンク */}
        <Link
          href={`/admin/events/${eventId}/periods/${period.id}/edit`}
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

        {/* クイズ管理リンク */}
        <Link
          href={`/admin/events/${eventId}/periods/${period.id}/quizzes`}
          className="
            inline-flex items-center justify-center
            rounded-md px-3 py-2
            text-sm font-medium text-green-600
            hover:bg-green-50
            transition-colors
          "
        >
          クイズ作成
        </Link>

        {/* 削除ボタン */}
        <button
          onClick={() => onDelete(period.id)}
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
