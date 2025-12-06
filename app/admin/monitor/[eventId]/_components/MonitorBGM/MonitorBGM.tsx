"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/app/_lib/supabase/client";
import { BGM_TRACKS, type BGMTrack } from "@/app/_lib/constants/bgm";
import { useQuizScreenContext } from "../../_context/QuizScreenContext";
import type { QuizScreen } from "@/app/_lib/types/quiz";

interface MonitorBGMProps {
  eventId: number;
}

/**
 * モニター画面BGMコンポーネント
 *
 * 責務:
 * - 画面遷移時にBGMを自動切り替え
 * - bgm_enabled状態に応じて再生/停止制御
 * - Supabase Realtimeでbgm_enabled監視
 */
export function MonitorBGM({ eventId }: MonitorBGMProps) {
  const { currentScreen } = useQuizScreenContext();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [bgmEnabled, setBgmEnabled] = useState(false);
  const [currentBgmTrack, setCurrentBgmTrack] = useState<BGMTrack | null>(null);

  // bgm_enabled の初期値を取得し、Realtimeで監視
  useEffect(() => {
    const supabase = createClient();

    // 初期値取得
    const fetchBgmEnabled = async () => {
      const { data } = await supabase
        .from("quiz_control")
        .select("bgm_enabled")
        .eq("event_id", eventId)
        .single();

      if (data) {
        setBgmEnabled(data.bgm_enabled);
      }
    };

    fetchBgmEnabled();

    // Realtime監視
    const channel = supabase
      .channel(`quiz_control_bgm:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "quiz_control",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if ("bgm_enabled" in payload.new) {
            setBgmEnabled(payload.new.bgm_enabled as boolean);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [eventId]);

  // 画面遷移時にBGMトラックを更新
  useEffect(() => {
    const newBgmTrack = BGM_TRACKS[currentScreen as QuizScreen];
    setCurrentBgmTrack(newBgmTrack);
  }, [currentScreen]);

  // BGMトラックまたはbgm_enabled変更時に再生制御
  useEffect(() => {
    if (!audioRef.current || !currentBgmTrack) return;

    if (bgmEnabled) {
      // 新しいBGMをロードして再生
      audioRef.current.load();
      audioRef.current.play().catch((error) => {
        // 自動再生がブロックされた場合は無視
        console.warn("BGM autoplay blocked:", error);
      });
    } else {
      // BGM無効時は停止
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [currentBgmTrack, bgmEnabled]);

  if (!currentBgmTrack) return null;

  return (
    <audio
      ref={audioRef}
      src={currentBgmTrack.url}
      loop={currentBgmTrack.loop}
      preload="auto"
      style={{ display: "none" }}
    />
  );
}
