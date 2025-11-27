'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';

export interface RankingEntry {
  rank: number;
  userId: number;
  nickname: string;
  correctCount: number;
  totalResponseTimeMs: number;
}

export interface PeriodResultData {
  periodId: number;
  periodName: string;
  ranking: RankingEntry[];
}

export type GetPeriodResultsForMonitorResult =
  | {
      success: true;
      data: PeriodResultData;
    }
  | {
      success: false;
      error: string;
    };

/**
 * モニター画面用 - ピリオド集計結果を取得
 * - 現在のピリオドIDを取得
 * - ピリオドランキングを取得（上位10位）
 */
export async function getPeriodResultsForMonitor(
  eventId: number
): Promise<GetPeriodResultsForMonitorResult> {
  try {
    const supabase = createAdminClient();

    // 現在のピリオドIDを取得
    const { data: quizControl, error: controlError } = await supabase
      .from('quiz_control')
      .select('current_period_id')
      .eq('event_id', eventId)
      .single();

    if (controlError || !quizControl?.current_period_id) {
      return {
        success: false,
        error: 'ピリオド情報が見つかりません',
      };
    }

    const periodId = quizControl.current_period_id;

    // ピリオド名を取得
    const { data: period, error: periodError } = await supabase
      .from('periods')
      .select('name')
      .eq('id', periodId)
      .single();

    if (periodError || !period) {
      return {
        success: false,
        error: 'ピリオド名が見つかりません',
      };
    }

    // period_rankings ビューから全ランキングを取得
    const { data: allRankings, error: rankingsError } = await supabase
      .from('period_rankings')
      .select('user_id, nickname, correct_count, total_response_time_ms')
      .eq('period_id', periodId)
      .eq('event_id', eventId)
      .order('correct_count', { ascending: false })
      .order('total_response_time_ms', { ascending: true });

    if (rankingsError || !allRankings) {
      return {
        success: false,
        error: 'ランキング情報が見つかりません',
      };
    }

    // ランキングに順位を付与し、上位10位を抽出
    const rankingWithPosition = allRankings.map((entry, index: number) => ({
      rank: index + 1,
      userId: entry.user_id as number,
      nickname: entry.nickname as string,
      correctCount: entry.correct_count as number,
      totalResponseTimeMs: entry.total_response_time_ms as number,
    }));

    const topRanking = rankingWithPosition.slice(0, 10);

    return {
      success: true,
      data: {
        periodId,
        periodName: period.name,
        ranking: topRanking,
      },
    };
  } catch (error) {
    console.error('getPeriodResultsForMonitor error:', error);
    return {
      success: false,
      error: 'ピリオド結果の読み込みに失敗しました',
    };
  }
}
