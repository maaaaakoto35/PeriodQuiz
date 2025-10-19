import { redirect } from "next/navigation";
import { validateSession } from "@/app/_lib/actions/user";
import { NicknameForm } from "./_components/NicknameForm";

type PageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function EventPage({ params }: PageProps) {
  const { eventId: eventIdStr } = await params;
  const eventId = parseInt(eventIdStr, 10);

  // イベントIDが無効な場合
  if (isNaN(eventId)) {
    throw new Error("Invalid event ID");
  }

  // 既にセッションがある場合は待機画面にリダイレクト
  const session = await validateSession();
  if (session.valid && session.user.event_id === eventId) {
    redirect(`/events/${eventId}/waiting`);
  }

  return (
    <main
      className="
      flex items-center justify-center
      min-h-screen
      p-4
      bg-gradient-to-br from-blue-50 to-indigo-100
    "
    >
      <NicknameForm eventId={eventId} />
    </main>
  );
}
