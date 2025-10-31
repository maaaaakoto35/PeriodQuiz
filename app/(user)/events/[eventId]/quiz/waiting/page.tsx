import { redirect } from "next/navigation";
import { validateSession } from "@/app/_lib/actions/user";
import { WaitingState } from "@/app/(user)/events/[eventId]/quiz/waiting/_components/WaitingState";

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
        <WaitingState user={user} />
      </div>
    </main>
  );
}
