import { redirect } from "next/navigation";
import {
  validateSession,
  getSessionErrorReason,
} from "@/app/_lib/actions/user";
import { NicknameForm } from "./_components/NicknameForm";
import type { SessionErrorReason } from "@/app/_lib/actions/user";

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

  // セッション無効な場合のエラー理由を判定
  let errorReason: SessionErrorReason = null;
  if (!session.valid) {
    errorReason = await getSessionErrorReason(eventId);
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
      <NicknameForm eventId={eventId} errorReason={errorReason} />
    </main>
  );
}
