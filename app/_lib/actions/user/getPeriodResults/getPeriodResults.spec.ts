import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getPeriodResults } from './getPeriodResults';

// Mock modules
vi.mock('@/app/_lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('../validateSession', () => ({
  validateSession: vi.fn(),
}));

vi.mock('../getQuizStatus', () => ({
  getQuizStatus: vi.fn(),
}));

import { createClient } from '@/app/_lib/supabase/server';
import { validateSession } from '../validateSession';
import { getQuizStatus } from '../getQuizStatus';

describe('getPeriodResults', () => {
  const mockEventId = 1;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('セッション検証', () => {
    it('セッションが無効な場合、エラーを返す', async () => {
      (validateSession as any).mockResolvedValue({
        valid: false,
      });

      const result = await getPeriodResults(mockEventId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('セッションが見つかりません');
      }
    });
  });

  describe('クイズステータス取得', () => {
    it('クイズステータス取得が失敗した場合、エラーを返す', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: 1 },
      });

      (getQuizStatus as any).mockResolvedValue({
        success: false,
        error: 'クイズ状態が見つかりません',
      });

      const result = await getPeriodResults(mockEventId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('ピリオド情報が見つかりません');
      }
    });

    it('currentPeriodId が null の場合、エラーを返す', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: 1 },
      });

      (getQuizStatus as any).mockResolvedValue({
        success: true,
        data: {
          currentPeriodId: null,
        },
      });

      const result = await getPeriodResults(mockEventId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('ピリオド情報が見つかりません');
      }
    });
  });

  describe('ピリオド名取得', () => {
    it('ピリオド名が見つからない場合、エラーを返す', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: 1 },
      });

      (getQuizStatus as any).mockResolvedValue({
        success: true,
        data: {
          currentPeriodId: 1,
        },
      });

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await getPeriodResults(mockEventId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('ピリオド名が見つかりません');
      }
    });
  });

  describe('ランキング取得', () => {
    it('ランキング情報が見つからない場合、エラーを返す', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: 1 },
      });

      (getQuizStatus as any).mockResolvedValue({
        success: true,
        data: {
          currentPeriodId: 1,
        },
      });

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'periods') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { name: 'Period 1' },
                    error: null,
                  }),
                }),
              }),
            };
          }

          if (table === 'period_rankings') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      order: vi.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Not found' },
                      }),
                    }),
                  }),
                }),
              }),
            };
          }

          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          };
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await getPeriodResults(mockEventId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('ランキング情報が見つかりません');
      }
    });
  });

  describe('ユーザー成績取得', () => {
    it('ユーザーの成績が見つからない場合、エラーを返す', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: 999 }, // ランキングに存在しないユーザーID
      });

      (getQuizStatus as any).mockResolvedValue({
        success: true,
        data: {
          currentPeriodId: 1,
        },
      });

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'periods') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { name: 'Period 1' },
                    error: null,
                  }),
                }),
              }),
            };
          }

          if (table === 'period_rankings') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      order: vi.fn().mockResolvedValue({
                        data: [
                          {
                            user_id: 1,
                            nickname: 'User1',
                            correct_count: 10,
                            total_response_time_ms: 50000,
                          },
                          {
                            user_id: 2,
                            nickname: 'User2',
                            correct_count: 8,
                            total_response_time_ms: 60000,
                          },
                        ],
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            };
          }

          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          };
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await getPeriodResults(mockEventId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('ユーザーの成績が見つかりません');
      }
    });
  });

  describe('成功シナリオ', () => {
    it('正しくピリオド結果を取得できる', async () => {
      const userId = 1;
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: userId },
      });

      (getQuizStatus as any).mockResolvedValue({
        success: true,
        data: {
          currentPeriodId: 1,
        },
      });

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'periods') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { name: 'Period 1' },
                    error: null,
                  }),
                }),
              }),
            };
          }

          if (table === 'period_rankings') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      order: vi.fn().mockResolvedValue({
                        data: [
                          {
                            user_id: 1,
                            nickname: 'User1',
                            correct_count: 10,
                            total_response_time_ms: 50000,
                          },
                          {
                            user_id: 2,
                            nickname: 'User2',
                            correct_count: 8,
                            total_response_time_ms: 60000,
                          },
                          {
                            user_id: 3,
                            nickname: 'User3',
                            correct_count: 8,
                            total_response_time_ms: 65000,
                          },
                        ],
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            };
          }

          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          };
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await getPeriodResults(mockEventId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.periodId).toBe(1);
        expect(result.data.periodName).toBe('Period 1');
        expect(result.data.ranking).toHaveLength(3);
        expect(result.data.ranking[0]).toEqual({
          rank: 1,
          userId: 1,
          nickname: 'User1',
          correctCount: 10,
          totalResponseTimeMs: 50000,
        });
        expect(result.data.userResult.userId).toBe(userId);
        expect(result.data.userResult.rank).toBe(1);
        expect(result.data.userResult.nickname).toBe('User1');
      }
    });

    it('上位10位を超えるランキングの場合、上位10位のみを返す', async () => {
      const userId = 5;
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: userId },
      });

      (getQuizStatus as any).mockResolvedValue({
        success: true,
        data: {
          currentPeriodId: 1,
        },
      });

      // 15件のランキングデータを作成
      const rankingData = Array.from({ length: 15 }, (_, i) => ({
        user_id: i + 1,
        nickname: `User${i + 1}`,
        correct_count: 10 - Math.floor(i / 2),
        total_response_time_ms: 50000 + i * 1000,
      }));

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'periods') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { name: 'Period 1' },
                    error: null,
                  }),
                }),
              }),
            };
          }

          if (table === 'period_rankings') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      order: vi.fn().mockResolvedValue({
                        data: rankingData,
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            };
          }

          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          };
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await getPeriodResults(mockEventId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ranking).toHaveLength(10);
        expect(result.data.ranking[0].rank).toBe(1);
        expect(result.data.ranking[9].rank).toBe(10);
        // ユーザーの順位は全体のランキングから取得
        expect(result.data.userResult.rank).toBe(userId);
      }
    });

    it('ユーザーが下位の場合、正しい順位を返す', async () => {
      const userId = 15;
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: userId },
      });

      (getQuizStatus as any).mockResolvedValue({
        success: true,
        data: {
          currentPeriodId: 1,
        },
      });

      // 20件のランキングデータを作成
      const rankingData = Array.from({ length: 20 }, (_, i) => ({
        user_id: i + 1,
        nickname: `User${i + 1}`,
        correct_count: 10 - Math.floor(i / 3),
        total_response_time_ms: 50000 + i * 500,
      }));

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'periods') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { name: 'Period 1' },
                    error: null,
                  }),
                }),
              }),
            };
          }

          if (table === 'period_rankings') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                      order: vi.fn().mockResolvedValue({
                        data: rankingData,
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
            };
          }

          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          };
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await getPeriodResults(mockEventId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ranking).toHaveLength(10);
        expect(result.data.userResult.rank).toBe(15);
        expect(result.data.userResult.userId).toBe(userId);
        expect(result.data.userResult.nickname).toBe('User15');
      }
    });
  });

  describe('エラーハンドリング', () => {
    it('予期しないエラーが発生した場合、エラーメッセージを返す', async () => {
      (validateSession as any).mockRejectedValue(new Error('Unexpected error'));

      const result = await getPeriodResults(mockEventId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('ピリオド結果の読み込みに失敗しました');
      }
    });
  });
});
