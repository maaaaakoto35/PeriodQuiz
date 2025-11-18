import { QuizForm } from "../_components/QuizForm";

interface NewQuizPageProps {
  params: Promise<{
    id: string;
    periodId: string;
  }>;
}

export default async function NewQuizPage({ params }: NewQuizPageProps) {
  const { id: eventId, periodId } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">新規クイズ作成</h1>
        <p className="mt-2 text-gray-600">新しいクイズ問題を作成してください</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <QuizForm periodId={Number(periodId)} eventId={Number(eventId)} />
      </div>
    </div>
  );
}
