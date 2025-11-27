'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import type {
  RankingEntry,
  PeriodChampion,
} from '@/app/_lib/actions/user/getFinalResults/getFinalResults';

export interface FinalResultDataForMonitor {
  eventId: number;
  eventName: string;
  ranking: RankingEntry[];
  periodChampions: PeriodChampion[];
}

export type GetFinalResultForMonitorResult =
  | {
      success: true;
      data: FinalResultDataForMonitor;
    }
  | {
      success: false;
      error: string;
    };

/**
 * モニター画面用の最終結果を取得
 * - 全体ランキングを取得（上位20位）
 * - 各ピリオドのチャンピオン（1位）を取得
 * - イベント情報を取得
 */
export async function getFinalResultForMonitor(
  eventId: number
): Promise<GetFinalResultForMonitorResult> {
  try {
    const supabase = createAdminClient();

    // イベント情報を取得
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('name')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return {
        success: false,
        error: 'イベント情報が見つかりません',
      };
    }

    // event_rankings ビューから全体ランキングを取得
    const { data: allRankings, error: rankingsError } = await supabase
      .from('event_rankings')
      .select('user_id, nickname, correct_count, total_response_time_ms')
      .eq('event_id', eventId)
      .order('correct_count', { ascending: false })
      .order('total_response_time_ms', { ascending: true });

    if (rankingsError || !allRankings) {
      return {
        success: false,
        error: 'ランキング情報が見つかりません',
      };
    }

    // ランキングに順位を付与し、上位20位を抽出
    const rankingWithPosition = allRankings.map((entry: any, index: number) => ({
      rank: index + 1,
      userId: entry.user_id as number,
      nickname: entry.nickname as string,
      correctCount: entry.correct_count as number,
      totalResponseTimeMs: entry.total_response_time_ms as number,
    }));

    const topRanking = rankingWithPosition.slice(0, 20);

    // 各ピリオドのチャンピオン（1位）を取得
    const { data: periods, error: periodsError } = await supabase
      .from('periods')
      .select('id, name')
      .eq('event_id', eventId)
      .order('order_num', { ascending: true });

    if (periodsError || !periods) {
      return {
        success: false,
        error: 'ピリオド情報が見つかりません',
      };
    }

    const periodChampions: PeriodChampion[] = [];

    for (const period of periods) {
      const { data: periodRankings, error: periodRankingsError } = await supabase
        .from('period_rankings')
        .select('user_id, nickname, correct_count')
        .eq('period_id', period.id)
        .eq('event_id', eventId)
        .order('correct_count', { ascending: false })
        .order('total_response_time_ms', { ascending: true })
        .limit(1)
        .single();

      if (!periodRankingsError && periodRankings) {
        periodChampions.push({
          periodId: period.id,
          periodName: period.name,
          userId: periodRankings.user_id as number,
          nickname: periodRankings.nickname as string,
          correctCount: periodRankings.correct_count as number,
        });
      }
    }

    return {
      success: true,
      data: {
        eventId,
        eventName: event.name,
        ranking: topRanking,
        periodChampions,
      },
    };
  } catch (error) {
    console.error('getFinalResultForMonitor error:', error);
    return {
      success: false,
      error: '最終結果の読み込みに失敗しました',
    };
  }
}
