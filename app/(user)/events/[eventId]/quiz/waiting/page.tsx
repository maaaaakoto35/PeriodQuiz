import { redirect } from "next/navigation";
import { validateSession } from "@/app/_lib/actions/user";
import { WaitingState } from "@/app/(user)/events/[eventId]/quiz/waiting/_components/WaitingState";
import styles from "./page.module.css";

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
    <div className={styles.root}>
      <WaitingState user={user} />
    </div>
  );
}
