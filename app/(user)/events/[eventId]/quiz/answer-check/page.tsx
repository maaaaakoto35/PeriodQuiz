import { redirect } from "next/navigation";
import { validateSession, getAnswerResult } from "@/app/_lib/actions/user";
import { AnswerCheckDisplay } from "./_components";

type PageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

/**
 * クイズアンサーチェック表示ページ（Server Component）
 * - サーバーサイドで回答結果を取得
 * - AnswerCheckDisplay（Client Component）に渡す
 * - 回答数を表示するが、正解は表示しない
 */
export default async function AnswerCheckPage({ params }: PageProps) {
  const { eventId: eventIdStr } = await params;
  const eventId = parseInt(eventIdStr, 10);

  // イベントIDが無効な場合
  if (isNaN(eventId)) {
    throw new Error("Invalid event ID");
  }

  // セッション検証
  const session = await validateSession();
  if (!session.valid || session.user.event_id !== eventId) {
    redirect(`/events/${eventId}`);
  }

  // 回答結果を取得
  const result = await getAnswerResult(eventId);

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
          {result.error || "回答結果の読み込みに失敗しました"}
        </p>
      </div>
    );
  }

  const { data } = result;

  return (
    <AnswerCheckDisplay
      questionText={data.questionText}
      questionImageUrl={data.questionImageUrl}
      choices={data.choices}
      userAnswer={data.userAnswer}
    />
  );
}
