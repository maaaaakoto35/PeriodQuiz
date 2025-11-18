import { getQuizzes } from "@/app/_lib/actions/admin/quizzes";
import { QuizForm } from "../../_components/QuizForm";

interface EditQuizPageProps {
  params: Promise<{
    id: string;
    periodId: string;
    quizId: string;
  }>;
}

export default async function EditQuizPage({ params }: EditQuizPageProps) {
  const { id: eventId, periodId, quizId } = await params;

  // クイズ一覧を取得して、該当のクイズを探す
  const result = await getQuizzes({
    periodId: Number(periodId),
  });

  if (!result.success || !result.data) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">クイズの読み込みに失敗しました</p>
      </div>
    );
  }

  const quiz = result.data.find((q) => q.id === Number(quizId));

  if (!quiz) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">クイズが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">クイズ編集</h1>
        <p className="mt-2 text-gray-600">クイズ内容を編集してください</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <QuizForm
          periodId={Number(periodId)}
          eventId={Number(eventId)}
          initialData={quiz}
        />
      </div>
    </div>
  );
}
