import { getQuizzes } from "@/app/_lib/actions/admin/quizzes";
import { QuizList } from "./_components/QuizList";

interface QuizzesPageProps {
  params: Promise<{
    id: string;
    periodId: string;
  }>;
}

export default async function QuizzesPage({ params }: QuizzesPageProps) {
  const { id: eventId, periodId } = await params;

  const result = await getQuizzes({
    periodId: Number(periodId),
  });

  if (!result.success) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">クイズ一覧</h1>
        <a
          href={`/admin/events/${eventId}/periods/${periodId}/quizzes/new`}
          className="
            rounded-md bg-blue-600 px-4 py-2
            text-sm font-medium text-white
            hover:bg-blue-700
            transition-colors
          "
        >
          新規クイズ作成
        </a>
      </div>

      <QuizList
        quizzes={result.data || []}
        eventId={Number(eventId)}
        periodId={Number(periodId)}
      />
    </div>
  );
}
