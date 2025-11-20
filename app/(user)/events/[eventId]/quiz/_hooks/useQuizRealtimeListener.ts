"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/app/_lib/supabase/client";
import type { QuizScreen } from "@/app/_lib/types/quiz";

interface UseQuizRealtimeListenerProps {
  eventId: number;
  onScreenChange: (screen: QuizScreen) => void;
}

/**
 * Realtime購読でクイズ制御の変更を監視し、screen変更時にコールバックを実行
 * eventId と onScreenChange は props で受け取る
 *
 * 注意: onScreenChange は依存配列に含めず、useRef で最新の参照を保持する
 * これにより、購読の頻繁な再設定を防ぎ、Realtimeイベントの受信を確実にする
 */
export function useQuizRealtimeListener({
  eventId,
  onScreenChange,
}: UseQuizRealtimeListenerProps) {
  useEffect(() => {
    const supabase = createClient();
    let subscription: ReturnType<typeof supabase.channel> | null = null;

    const subscribeToQuizControl = async () => {
      subscription = supabase
        .channel(`quiz-control:${eventId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "quiz_control",
            filter: `event_id=eq.${eventId}`,
          },
          (payload) => {
            const newScreen = (payload.new as { current_screen: QuizScreen })
              ?.current_screen;

            if (newScreen) {
              onScreenChange(newScreen);
            }
          }
        )
        .subscribe();
    };

    subscribeToQuizControl();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [eventId, onScreenChange]);
}
