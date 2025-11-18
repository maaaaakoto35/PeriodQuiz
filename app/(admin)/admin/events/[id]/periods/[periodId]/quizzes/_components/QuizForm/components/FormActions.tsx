"use client";

import Link from "next/link";

interface FormActionsProps {
  isSubmitting: boolean;
  isEditMode: boolean;
  eventId: number;
  periodId: number;
}

export function FormActions({
  isSubmitting,
  isEditMode,
  eventId,
  periodId,
}: FormActionsProps) {
  return (
    <div className="flex gap-3">
      <button
        type="submit"
        disabled={isSubmitting}
        className="
          rounded-md bg-blue-600
          px-4 py-2
          text-white font-medium
          hover:bg-blue-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
      >
        {isSubmitting
          ? "保存中..."
          : isEditMode
          ? "クイズを更新"
          : "クイズを作成"}
      </button>
      <Link
        href={`/admin/events/${eventId}/periods/${periodId}/quizzes`}
        className="
          rounded-md bg-gray-200
          px-4 py-2
          text-gray-800 font-medium
          hover:bg-gray-300
          transition-colors
          text-center
        "
      >
        キャンセル
      </Link>
    </div>
  );
}
