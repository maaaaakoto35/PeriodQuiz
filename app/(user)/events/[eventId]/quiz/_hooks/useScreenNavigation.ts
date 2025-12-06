"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { QuizScreen } from "@/app/_lib/types/quiz";

interface UseScreenNavigationProps {
  currentScreen: QuizScreen | null;
  eventId: number;
}

/**
 * currentScreen の変更を監視して画面遷移を行う
 * currentScreen と eventId は props で受け取る
 */
export function useScreenNavigation({
  currentScreen,
  eventId,
}: UseScreenNavigationProps) {
  const router = useRouter();

  useEffect(() => {
    if (!currentScreen) return;

    console.log("[useScreenNavigation] Navigating to screen:", currentScreen);

    switch (currentScreen) {
      case "waiting":
        router.push(`/events/${eventId}/quiz/waiting`);
        break;
      case "question":
        // question/[id] ページでは current_question_id から問題を自動取得
        router.push(`/events/${eventId}/quiz/question/`);
        break;
      case "answer_check":
        router.push(`/events/${eventId}/quiz/answer-check/`);
        break;
      case "answer":
        router.push(`/events/${eventId}/quiz/answer/`);
        break;
      case "break":
        router.push(`/events/${eventId}/quiz/break`);
        break;
      case "period_result":
        router.push(`/events/${eventId}/quiz/period-result`);
        break;
      case "final_result":
        router.push(`/events/${eventId}/quiz/final-result`);
        break;
      default:
        console.warn("[useScreenNavigation] Unknown screen:", currentScreen);
    }
  }, [currentScreen, eventId, router]);
}
