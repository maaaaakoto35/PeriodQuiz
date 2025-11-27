"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/app/_lib/supabase/client";
import type { QuizScreen } from "@/app/_lib/types/quiz";

/**
 * quiz_control テーブルの current_screen をリアルタイム監視するカスタムフック
 *
 * 責務:
 * - Supabase Realtime リスナーのセットアップ
 * - current_screen 変更の検知
 * - リアルタイム接続のクリーンアップ
 *
 * @param eventId - イベントID
 * @param initialScreen - 初期画面
 * @returns 現在の画面状態
 */
export function useQuizScreenMonitoring(
  eventId: number,
  initialScreen: QuizScreen
): QuizScreen {
  const [currentScreen, setCurrentScreen] = useState<QuizScreen>(initialScreen);
  const realtimeUnsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Realtime リスナー設定
    const subscription = supabase
      .channel(`quiz_control:event_id=eq.${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "quiz_control",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const newScreen = payload.new.current_screen as QuizScreen;
          setCurrentScreen(newScreen);
        }
      )
      .subscribe();

    realtimeUnsubscribeRef.current = () => {
      subscription.unsubscribe();
    };

    return () => {
      if (realtimeUnsubscribeRef.current) {
        realtimeUnsubscribeRef.current();
      }
    };
  }, [eventId]);

  return currentScreen;
}
