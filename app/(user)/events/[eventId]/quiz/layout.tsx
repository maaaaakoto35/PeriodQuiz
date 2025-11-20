import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { validateSession } from "@/app/_lib/actions/user";
import { createClient } from "@/app/_lib/supabase/server";
import { QuizClientLayout } from "./_components/QuizClientLayout";
import type { QuizScreen } from "@/app/_lib/types/quiz";

interface QuizLayoutProps {
  children: ReactNode;
}

export default async function QuizLayout({ children }: QuizLayoutProps) {
  const session = await validateSession();

  if (!session.valid) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: quizControl, error } = await supabase
    .from("quiz_control")
    .select("current_screen")
    .eq("event_id", session.user.event_id)
    .single();

  if (error || !quizControl) {
    // デフォルト値としてwaitingを使用
    console.error("Failed to fetch quiz_control:", error);
    redirect("/");
  }

  // イベント名を取得
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("name")
    .eq("id", session.user.event_id)
    .single();

  if (eventError || !event) {
    console.error("Failed to fetch event:", eventError);
    redirect("/");
  }

  const currentScreen = (quizControl.current_screen as QuizScreen) || "waiting";

  return (
    <QuizClientLayout
      initialEventId={session.user.event_id}
      initialEventName={event.name}
      initialUserId={session.user.id}
      initialCurrentScreen={currentScreen}
    >
      {children}
    </QuizClientLayout>
  );
}
