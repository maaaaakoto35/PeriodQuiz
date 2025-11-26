import { redirect } from "next/navigation";
import { validateSession, getPeriodResults } from "@/app/_lib/actions/user";
import { PeriodResultDisplay } from "./_components/PeriodResultDisplay";

type PageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

/**
 * ピリオド集計結果ページ（Server Component）
 * - サーバーサイドでピリオド集計結果を取得
 * - PeriodResultDisplay（Client Component）に渡す
 */
export default async function PeriodResultPage({ params }: PageProps) {
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

  // ピリオド集計結果を取得
  const result = await getPeriodResults(eventId);

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
          {result.error || "ピリオド結果の読み込みに失敗しました"}
        </p>
      </div>
    );
  }

  const { data } = result;

  return <PeriodResultDisplay data={data} />;
}
