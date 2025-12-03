"use server";

import { createClient } from "@/app/_lib/supabase/server";

export interface EventInfo {
  eventName: string;
  periodName: string;
  questionNumber: number;
}

/**
 * モニター画面用のイベント情報を取得
 *
 * @param eventId - イベントID
 * @returns イベント情報（eventName, periodName, questionNumber）
 */
export async function getEventInfoForMonitor(
  eventId: number
): Promise<EventInfo | null> {
  const supabase = await createClient();

  // イベント情報を取得
  const { data: event } = await supabase
    .from("events")
    .select("name")
    .eq("id", eventId)
    .single();

  if (!event) {
    return null;
  }

  // quiz_control から current_period_id と current_question_id を取得
  const { data: quizControl } = await supabase
    .from("quiz_control")
    .select("current_screen, current_period_id, current_question_id")
    .eq("event_id", eventId)
    .single();

  if (!quizControl?.current_period_id) {
    return {
      eventName: event.name,
      periodName: "",
      questionNumber: 0,
    }
  }

  // ピリオド情報を取得
  const { data: period } = await supabase
    .from("periods")
    .select("name, order_num")
    .eq("id", quizControl.current_period_id)
    .single();

  // 質問の総数を取得
  const { count } = await supabase
    .from("question_displays")
    .select("id, periods!inner(event_id)", { count: "exact" })
    .eq("periods.event_id", eventId);

  if (!period || !event) {
    return null;
  }

  return {
    eventName: event.name,
    periodName: quizControl.current_screen == "final_result" ? "最終結果" : period.name,
    questionNumber: count || 0,
  };
}
