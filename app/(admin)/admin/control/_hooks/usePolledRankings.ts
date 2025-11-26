'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/app/_lib/supabase/client';
import { type RankingsData } from '@/app/_lib/types/ranking';

interface UseRealtimeRankingsOptions {
  eventId: number;
  periodId: number;
  enabled?: boolean;
  pollInterval?: number; // ポーリング間隔（ミリ秒、デフォルト: 5秒）
}

interface UseRealtimeRankingsReturn {
  rankings: RankingsData | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * ピリオドランキングとイベント全体ランキングをポーリングで取得
 * 5秒ごとにランキングデータを更新
 *
 * @param eventId イベントID
 * @param periodId ピリオドID
 * @param enabled 購読を有効にするか（デフォルト: true）
 * @param pollInterval ポーリング間隔（デフォルト: 5000ms）
 * @returns ランキングデータ、ローディング状態、エラー
 */
export function usePolledRankings({
  eventId,
  periodId,
  enabled = true,
  pollInterval = 5000,
}: UseRealtimeRankingsOptions): UseRealtimeRankingsReturn {
  const [rankings, setRankings] = useState<RankingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  // ランキングデータを再計算
  const refetchRankings = useCallback(async () => {
    try {
      // ピリオドランキングを取得
      const { data: periodData, error: periodError } = await supabase
        .from('period_rankings')
        .select('user_id, nickname, correct_count, total_response_time_ms, answered_count')
        .eq('event_id', eventId)
        .eq('period_id', periodId)
        .order('correct_count', { ascending: false })
        .order('total_response_time_ms', { ascending: true })
        .limit(10);

      if (periodError) throw periodError;

      // イベント全体ランキングを取得
      const { data: eventData, error: eventError } = await supabase
        .from('event_rankings')
        .select('user_id, nickname, correct_count, total_response_time_ms, answered_count')
        .eq('event_id', eventId)
        .order('correct_count', { ascending: false })
        .order('total_response_time_ms', { ascending: true })
        .limit(10);

      if (eventError) throw eventError;

      // データをランキング形式に変換
      const periodRankings = (periodData || []).map((entry, index) => ({
        rank: index + 1,
        userId: entry.user_id as number,
        nickname: entry.nickname as string,
        correctCount: entry.correct_count as number,
        totalResponseTimeMs: entry.total_response_time_ms as number,
        answeredCount: entry.answered_count as number,
      }));

      const eventRankings = (eventData || []).map((entry, index) => ({
        rank: index + 1,
        userId: entry.user_id as number,
        nickname: entry.nickname as string,
        correctCount: entry.correct_count as number,
        totalResponseTimeMs: entry.total_response_time_ms as number,
        answeredCount: entry.answered_count as number,
      }));

      setRankings({
        period: {
          eventId,
          periodId,
          entries: periodRankings,
        },
        event: {
          eventId,
          entries: eventRankings,
        },
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch rankings'));
    } finally {
      setIsLoading(false);
    }
  }, [eventId, periodId, supabase]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // 初回取得
    refetchRankings();

    // 5秒ごとのポーリング
    const pollTimer = setInterval(() => {
      refetchRankings();
    }, pollInterval);

    return () => {
      clearInterval(pollTimer);
    };
  }, [enabled, eventId, periodId, pollInterval, refetchRankings]);

  return {
    rankings,
    isLoading,
    error,
  };
}

