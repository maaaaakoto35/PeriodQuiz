import { redirect } from "next/navigation";
import { validateSession } from "@/app/_lib/actions/user";
import { UnimplementedScreen } from "../waiting/_components/UnimplementedScreen";

type PageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

// TODO: US-003-03で実装する
export default async function AnswerPage({ params }: PageProps) {
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
        <UnimplementedScreen currentScreen="answer" />
      </div>
    </main>
  );
}
