import { getQuestionWithChoices } from "@/app/_lib/actions/user";
import { getQuizStatus } from "@/app/_lib/actions/user";
import { QuestionDisplay } from "./_components/QuestionDisplay";

interface QuestionPageProps {
  params: Promise<{ eventId: string }>;
}

/**
 * クイズ問題表示ページ（Server Component）
 * - サーバーサイドで問題と選択肢を取得
 * - QuestionDisplay（Client Component）に渡す
 */
export default async function QuestionPage({ params }: QuestionPageProps) {
  const { eventId: eventIdStr } = await params;
  const eventId = parseInt(eventIdStr, 0);

  // クイズの状態を取得
  const statusResult = await getQuizStatus(eventId);
  if (!statusResult.success) {
    return (
      <div
        className="
        flex flex-col items-center justify-center
        w-full h-screen
        bg-gray-50
        space-y-4
      "
      >
        <p className="text-lg font-semibold text-red-600">エラー</p>
        <p className="text-gray-600">クイズ状態の取得に失敗しました</p>
      </div>
    );
  }

  // 問題と選択肢を取得
  const result = await getQuestionWithChoices({ eventId });

  if (!result.success) {
    return (
      <div
        className="
        flex flex-col items-center justify-center
        w-full h-screen
        bg-gray-50
        space-y-4
      "
      >
        <p className="text-lg font-semibold text-red-600">エラー</p>
        <p className="text-gray-600">
          {result.error || "問題の読み込みに失敗しました"}
        </p>
      </div>
    );
  }

  const { data } = result;

  return (
    <div
      className="
      flex items-center justify-center
      w-full min-h-screen
      bg-gray-50 p-4
    "
    >
      <QuestionDisplay
        eventId={eventId}
        questionText={data.text}
        questionImageUrl={data.image_url}
        choices={data.choices.map(
          (choice: {
            id: number;
            text: string;
            image_url: string | null;
            order_num: number;
          }) => ({
            id: choice.id,
            text: choice.text,
            imageUrl: choice.image_url,
            orderNum: choice.order_num,
          })
        )}
      />
    </div>
  );
}
