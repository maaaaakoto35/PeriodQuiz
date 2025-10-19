import { redirect } from "next/navigation";
import { validateSession } from "@/app/_lib/actions/user";

type PageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function WaitingPage({ params }: PageProps) {
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

  const { user } = session;

  return (
    <main
      className="
      flex flex-col items-center justify-center
      min-h-screen
      p-4
      bg-gradient-to-br from-blue-50 to-indigo-100
    "
    >
      <div
        className="
        w-full max-w-md
        p-8 space-y-6
        bg-white rounded-lg shadow-lg
        text-center
      "
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">参加完了!</h1>
          <p className="text-lg text-gray-600">
            ようこそ、
            <span className="font-semibold text-blue-600">{user.nickname}</span>
            さん
          </p>
        </div>

        <div
          className="
          p-6
          bg-blue-50 rounded-lg
          border-2 border-blue-200
        "
        >
          <div className="animate-pulse">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full opacity-75"></div>
          </div>
          <p className="text-xl font-semibold text-gray-800">
            クイズ開始をお待ちください
          </p>
          <p className="mt-2 text-sm text-gray-600">
            主催者がクイズを開始するまで、このまましばらくお待ちください
          </p>
        </div>

        <div className="pt-4 space-y-2 text-sm text-gray-500">
          <p>💡 このページを開いたままお待ちください</p>
          <p>📱 画面が自動的に切り替わります</p>
        </div>
      </div>
    </main>
  );
}
