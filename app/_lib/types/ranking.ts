/**
 * Ranking related type definitions
 */

export interface RankingEntry {
  rank: number;
  userId: number;
  nickname: string;
  correctCount: number;
  totalResponseTimeMs: number;
  answeredCount: number;
}

export interface PeriodRankings {
  eventId: number;
  periodId: number;
  entries: RankingEntry[];
}

export interface EventRankings {
  eventId: number;
  entries: RankingEntry[];
}

export interface RankingsData {
  period: PeriodRankings;
  event: EventRankings;
}
