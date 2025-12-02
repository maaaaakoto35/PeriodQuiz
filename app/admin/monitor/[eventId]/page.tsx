import { createClient } from "@/app/_lib/supabase/server";
import { MonitorSection } from "./_components/MonitorSection";
import type { QuizScreen } from "@/app/_lib/types/quiz";

interface MonitorPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

/**
 * モニター画面ページ（Server Component）
 *
 * 責務:
 * - eventId でイベント情報と初期画面状態を取得
 * - MonitorSection に初期データを渡す
 */
export default async function MonitorPage({ params }: MonitorPageProps) {
  const { eventId: eventIdStr } = await params;
  const eventId = parseInt(eventIdStr, 10);

  // イベントIDが無効な場合
  if (isNaN(eventId)) {
    throw new Error("Invalid event ID");
  }

  // イベント情報と初期画面状態を取得
  const supabase = await createClient();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, name")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    throw new Error("Event not found");
  }

  const { data: quizControl, error: quizControlError } = await supabase
    .from("quiz_control")
    .select("current_screen")
    .eq("event_id", eventId)
    .single();

  if (quizControlError || !quizControl) {
    throw new Error("Failed to fetch quiz control state");
  }

  return (
    <MonitorSection
      eventId={eventId}
      initialScreen={quizControl.current_screen as QuizScreen}
    />
  );
}
