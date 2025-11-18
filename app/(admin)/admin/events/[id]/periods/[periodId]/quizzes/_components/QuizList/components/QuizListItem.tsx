import { QuizControlButtons } from "./QuizControlButtons";
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

      <QuizControlButtons
        quizId={quiz.id}
        eventId={eventId}
        periodId={periodId}
        index={index}
        total={total}
        isLoading={isLoading}
        onDelete={onDelete}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
      />
    </div>
  );
}
