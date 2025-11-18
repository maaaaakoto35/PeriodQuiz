"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteQuiz, reorderQuizzes } from "@/app/_lib/actions/admin/quizzes";
import { QuizListItem } from "./components/QuizListItem";
import { ErrorMessage } from "./components/ErrorMessage";
import { moveUp, moveDown } from "./utils/reorderQuizzes";
import type { QuizWithChoices } from "@/app/_lib/actions/admin/quizzes";

interface QuizListProps {
  quizzes: QuizWithChoices[];
  eventId: number;
  periodId: number;
}

export function QuizList({ quizzes, eventId, periodId }: QuizListProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [localQuizzes, setLocalQuizzes] = useState(quizzes);

  const handleDelete = async (id: number) => {
    if (!confirm("このクイズを削除してもよろしいですか？")) {
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const result = await deleteQuiz({ id });
      if (!result.success) {
        setError(result.error || "削除に失敗しました");
      } else {
        setLocalQuizzes((prev) => prev.filter((q) => q.id !== id));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const newQuizzes =
      direction === "up"
        ? moveUp(localQuizzes, index)
        : moveDown(localQuizzes, index);
    setLocalQuizzes(newQuizzes);

    const reorderedData = newQuizzes.map((q: QuizWithChoices, i: number) => ({
      id: q.id,
      orderNum: i + 1,
    }));

    setIsLoading(true);
    setError("");
    try {
      const result = await reorderQuizzes({
        periodId,
        quizzes: reorderedData,
      });
      if (!result.success) {
        setError(result.error || "順序変更に失敗しました");
        setLocalQuizzes(quizzes);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <ErrorMessage message={error} />

      {localQuizzes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">クイズがまだ作成されていません</p>
          <Link
            href={`/admin/events/${eventId}/periods/${periodId}/quizzes/new`}
            className="
              mt-4 inline-block
              rounded-md bg-blue-600 px-4 py-2
              text-sm font-medium text-white
              hover:bg-blue-700
              transition-colors
            "
          >
            新規クイズ作成
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {localQuizzes.map((quiz, index) => (
            <QuizListItem
              key={quiz.id}
              quiz={quiz}
              index={index}
              total={localQuizzes.length}
              eventId={eventId}
              periodId={periodId}
              isLoading={isLoading}
              onDelete={() => handleDelete(quiz.id)}
              onMoveUp={() => handleReorder(index, "up")}
              onMoveDown={() => handleReorder(index, "down")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
