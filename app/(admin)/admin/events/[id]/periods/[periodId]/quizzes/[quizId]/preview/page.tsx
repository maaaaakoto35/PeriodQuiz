import Link from "next/link";
import { getQuizzes } from "@/app/_lib/actions/admin/quizzes";

interface PreviewQuizPageProps {
  params: Promise<{
    id: string;
    periodId: string;
    quizId: string;
  }>;
}

export default async function PreviewQuizPage({
  params,
}: PreviewQuizPageProps) {
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">クイズプレビュー</h1>
        <Link
          href={`/admin/events/${eventId}/periods/${periodId}/quizzes`}
          className="
            rounded-md bg-gray-200
            px-4 py-2
            text-gray-800 font-medium
            hover:bg-gray-300
            transition-colors
          "
        >
          一覧に戻る
        </Link>
      </div>

      {/* プレビュー表示 */}
      <div className="rounded-lg border border-gray-200 bg-white p-8">
        {/* 問題文と画像 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{quiz.text}</h2>
          {quiz.image_url && (
            <div className="mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={quiz.image_url}
                alt="問題画像"
                className="
                  max-w-md h-auto
                  rounded-lg object-cover
                "
              />
            </div>
          )}
        </div>

        {/* 選択肢 */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 mb-4">選択肢</h3>
          {quiz.choices.map((choice) => (
            <div
              key={choice.id}
              className="
                rounded-lg border-2 p-4
                transition-colors
                ${choice.is_correct
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-white'
                }
              "
            >
              <div className="flex items-start gap-3">
                <div
                  className="
                  flex h-8 w-8 items-center justify-center
                  rounded-full
                  flex-shrink-0
                  ${choice.is_correct
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                  font-medium text-sm
                "
                >
                  {choice.is_correct && "✓"}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{choice.text}</p>
                  {choice.image_url && (
                    <div className="mt-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={choice.image_url}
                        alt={choice.text}
                        className="
                          max-w-sm h-auto
                          rounded object-cover
                        "
                      />
                    </div>
                  )}
                  {choice.is_correct && (
                    <span
                      className="
                      mt-2 inline-block
                      px-2 py-1 rounded
                      bg-green-200 text-green-800
                      text-xs font-semibold
                    "
                    >
                      正解
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* アクションボタン */}
        <div className="mt-8 flex gap-3">
          <Link
            href={`/admin/events/${eventId}/periods/${periodId}/quizzes/${quiz.id}/edit`}
            className="
              rounded-md bg-blue-600
              px-4 py-2
              text-white font-medium
              hover:bg-blue-700
              transition-colors
            "
          >
            編集
          </Link>
          <Link
            href={`/admin/events/${eventId}/periods/${periodId}/quizzes`}
            className="
              rounded-md bg-gray-200
              px-4 py-2
              text-gray-800 font-medium
              hover:bg-gray-300
              transition-colors
            "
          >
            キャンセル
          </Link>
        </div>
      </div>
    </div>
  );
}
