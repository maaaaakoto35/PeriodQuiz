'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/app/_lib/supabase/client';

interface UseRealtimeUserCountOptions {
  eventId: number;
  initialCount?: number;
}

interface UseRealtimeUserCountReturn {
  userCount: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * イベントの参加者数をリアルタイムで取得
 * Supabase Realtimeで users テーブルのINSERT/DELETE/UPDATEイベントを購読
 *
 * @param eventId イベントID
 * @param initialCount 初期参加者数
 * @returns 参加者数、ローディング状態、エラー
 */
export function useRealtimeUserCount({
  eventId,
  initialCount = 0,
}: UseRealtimeUserCountOptions): UseRealtimeUserCountReturn {
  const [userCount, setUserCount] = useState<number>(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  // 参加者数を再取得
  const refetchUserCount = useCallback(async () => {
    try {
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      if (countError) throw countError;

      setUserCount(count || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user count'));
    } finally {
      setIsLoading(false);
    }
  }, [eventId, supabase]);

  useEffect(() => {
    setIsLoading(true);
    // 初回取得
    refetchUserCount();

    // Realtimeで users テーブルを購読
    const subscription = supabase
      .channel(`realtime-users-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE すべてのイベント
          schema: 'public',
          table: 'users',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          // テーブルの変更を検知したら、参加者数を再取得
          refetchUserCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [eventId, refetchUserCount, supabase]);

  return {
    userCount,
    isLoading,
    error,
  };
}
