'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { type RankingsData, type RankingEntry } from '@/app/_lib/types/ranking';

/**
 * ピリオドランキングとイベント全体ランキングを取得
 * 上位10件ずつ返却
 *
 * @param eventId イベントID
 * @param periodId ピリオドID
 * @returns ピリオドランキングとイベント全体ランキング
 */
export async function getRankings(
  eventId: number,
  periodId: number
): Promise<RankingsData | null> {
  const supabase = await createAdminClient();

  try {
    // 1. ピリオドランキングを取得（Top 10）
    const { data: periodData, error: periodError } = await supabase
      .from('period_rankings')
      .select('user_id, nickname, correct_count, total_response_time_ms, answered_count')
      .eq('event_id', eventId)
      .eq('period_id', periodId)
      .order('correct_count', { ascending: false })
      .order('total_response_time_ms', { ascending: true })
      .limit(10);

    if (periodError) {
      console.error('Failed to fetch period rankings:', periodError);
      return null;
    }

    // 2. イベント全体ランキングを取得（Top 10）
    const { data: eventData, error: eventError } = await supabase
      .from('event_rankings')
      .select('user_id, nickname, correct_count, total_response_time_ms, answered_count')
      .eq('event_id', eventId)
      .order('correct_count', { ascending: false })
      .order('total_response_time_ms', { ascending: true })
      .limit(10);

    if (eventError) {
      console.error('Failed to fetch event rankings:', eventError);
      return null;
    }

    // 3. データをランキング形式に変換
    const periodRankings: RankingEntry[] = (periodData || []).map((entry, index) => ({
      rank: index + 1,
      userId: entry.user_id as number,
      nickname: entry.nickname as string,
      correctCount: entry.correct_count as number,
      totalResponseTimeMs: entry.total_response_time_ms as number,
      answeredCount: entry.answered_count as number,
    }));

    const eventRankings: RankingEntry[] = (eventData || []).map((entry, index) => ({
      rank: index + 1,
      userId: entry.user_id as number,
      nickname: entry.nickname as string,
      correctCount: entry.correct_count as number,
      totalResponseTimeMs: entry.total_response_time_ms as number,
      answeredCount: entry.answered_count as number,
    }));

    return {
      period: {
        eventId,
        periodId,
        entries: periodRankings,
      },
      event: {
        eventId,
        entries: eventRankings,
      },
    };
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return null;
  }
}
