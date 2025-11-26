import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getFinalResults } from './getFinalResults';

// Mock modules
vi.mock('@/app/_lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('../validateSession', () => ({
  validateSession: vi.fn(),
}));

import { createClient } from '@/app/_lib/supabase/server';
import { validateSession } from '../validateSession';

describe('getFinalResults', () => {
  const mockEventId = 1;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('セッション検証', () => {
    it('セッションが無効な場合、エラーを返す', async () => {
      (validateSession as any).mockResolvedValue({
        valid: false,
      });

      const result = await getFinalResults(mockEventId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('セッションが見つかりません');
      }
    });
  });

  describe('イベント情報取得', () => {
    it('イベント情報が見つからない場合、エラーを返す', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: 1 },
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

      const result = await getFinalResults(mockEventId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('イベント情報が見つかりません');
      }
    });
  });

  describe('ランキング取得', () => {
    it('ランキング情報が見つからない場合、エラーを返す', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: 1 },
      });

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'events') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { name: 'Test Event' },
                    error: null,
                  }),
                }),
              }),
            };
          }

          if (table === 'event_rankings') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({
                      data: null,
                      error: { message: 'Not found' },
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

      const result = await getFinalResults(mockEventId);

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

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'events') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { name: 'Test Event' },
                    error: null,
                  }),
                }),
              }),
            };
          }

          if (table === 'event_rankings') {
            return {
              select: vi.fn().mockReturnValue({
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

      const result = await getFinalResults(mockEventId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('ユーザーの成績が見つかりません');
      }
    });
  });

  describe('ピリオド情報取得', () => {
    it('ピリオド情報が見つからない場合、エラーを返す', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: 1 },
      });

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'events') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { name: 'Test Event' },
                    error: null,
                  }),
                }),
              }),
            };
          }

          if (table === 'event_rankings') {
            return {
              select: vi.fn().mockReturnValue({
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
                      ],
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }

          if (table === 'periods') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Not found' },
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

      const result = await getFinalResults(mockEventId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('ピリオド情報が見つかりません');
      }
    });
  });

  describe('成功シナリオ', () => {
    it('正しく最終結果を取得できる', async () => {
      const userId = 1;
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: userId },
      });

      const rankingData = [
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
      ];

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'events') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { name: 'Test Event' },
                    error: null,
                  }),
                }),
              }),
            };
          }

          if (table === 'event_rankings') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({
                      data: rankingData,
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }

          if (table === 'periods') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: [
                      { id: 1, name: 'Period 1' },
                      { id: 2, name: 'Period 2' },
                    ],
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
                      order: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                          single: vi.fn().mockResolvedValue({
                            data: {
                              user_id: 1,
                              nickname: 'User1',
                              correct_count: 10,
                            },
                            error: null,
                          }),
                        }),
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

      const result = await getFinalResults(mockEventId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.eventName).toBe('Test Event');
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
        expect(result.data.periodChampions).toHaveLength(2);
        expect(result.data.periodChampions[0].periodName).toBe('Period 1');
        expect(result.data.periodChampions[1].periodName).toBe('Period 2');
      }
    });

    it('上位20位を超えるランキングの場合、上位20位のみを返す', async () => {
      const userId = 5;
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: userId },
      });

      // 25人のランキングデータを作成
      const rankingData = Array.from({ length: 25 }, (_, i) => ({
        user_id: i + 1,
        nickname: `User${i + 1}`,
        correct_count: 25 - i,
        total_response_time_ms: 50000 + i * 1000,
      }));

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'events') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { name: 'Test Event' },
                    error: null,
                  }),
                }),
              }),
            };
          }

          if (table === 'event_rankings') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({
                      data: rankingData,
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }

          if (table === 'periods') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
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

      const result = await getFinalResults(mockEventId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ranking).toHaveLength(20);
        expect(result.data.ranking[0].rank).toBe(1);
        expect(result.data.ranking[19].rank).toBe(20);
        // ユーザーの順位は全体のランキングから取得
        expect(result.data.userResult.rank).toBe(userId);
      }
    });

    it('ユーザーがランキング外（20位以下）の場合、ユーザー情報のみ取得', async () => {
      const userId = 25;
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: userId },
      });

      // 25人のランキングデータを作成
      const rankingData = Array.from({ length: 25 }, (_, i) => ({
        user_id: i + 1,
        nickname: `User${i + 1}`,
        correct_count: 25 - i,
        total_response_time_ms: 50000 + i * 1000,
      }));

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'events') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { name: 'Test Event' },
                    error: null,
                  }),
                }),
              }),
            };
          }

          if (table === 'event_rankings') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({
                      data: rankingData,
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }

          if (table === 'periods') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
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

      const result = await getFinalResults(mockEventId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ranking).toHaveLength(20);
        expect(result.data.userResult.rank).toBe(25);
        expect(result.data.userResult.userId).toBe(userId);
        expect(result.data.userResult.nickname).toBe('User25');
      }
    });
  });

  describe('エラーハンドリング', () => {
    it('予期しないエラーが発生した場合、エラーメッセージを返す', async () => {
      (validateSession as any).mockRejectedValue(new Error('Unexpected error'));

      const result = await getFinalResults(mockEventId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('最終結果の読み込みに失敗しました');
      }
    });
  });
});
