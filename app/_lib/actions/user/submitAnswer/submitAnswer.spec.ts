import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { submitAnswer } from './submitAnswer';

// Mock modules - BEFORE importing submitAnswer
vi.mock('@/app/_lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/app/_lib/supabase/server-admin', () => ({
  createAdminClient: vi.fn(),
}));

vi.mock('../validateSession', () => ({
  validateSession: vi.fn(),
}));

import { createClient } from '@/app/_lib/supabase/server';
import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { validateSession } from '../validateSession';

describe('submitAnswer', () => {
  const mockUserId = 1;
  const mockEventId = 1;
  const mockQuestionId = 1;
  const mockChoiceId = 1;
  const mockPeriodId = 1;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('セッション検証', () => {
    it('セッションが無効な場合、エラーを返す', async () => {
      (validateSession as any).mockResolvedValue({
        valid: false,
      });

      const result = await submitAnswer({
        eventId: mockEventId,
        choiceId: mockChoiceId,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('セッションが見つかりません');
      }
    });
  });

  describe('クイズ情報取得', () => {
    it('クイズ情報が見つからない場合、エラーを返す', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: mockUserId },
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
      (createAdminClient as any).mockReturnValue(mockSupabase);

      const result = await submitAnswer({
        eventId: mockEventId,
        choiceId: mockChoiceId,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('クイズ情報が見つかりません');
      }
    });
  });

  describe('回答済みチェック', () => {
    it('既に回答済みの場合、エラーを返す', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: mockUserId },
      });

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'quiz_control') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      current_question_id: mockQuestionId,
                      current_period_id: mockPeriodId,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'answers') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: { id: 1 }, // 既に回答済み
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);
      (createAdminClient as any).mockReturnValue(mockSupabase);

      const result = await submitAnswer({
        eventId: mockEventId,
        choiceId: mockChoiceId,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('既に回答済みです');
      }
    });
  });

  describe('選択肢検証', () => {
    it('選択肢が見つからない場合、エラーを返す', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: mockUserId },
      });

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'quiz_control') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      current_question_id: mockQuestionId,
                      current_period_id: mockPeriodId,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'answers') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: null,
                      error: { code: 'PGRST116' }, // No rows found
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'choices') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: null,
                      error: { message: 'Not found' },
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);
      (createAdminClient as any).mockReturnValue(mockSupabase);

      const result = await submitAnswer({
        eventId: mockEventId,
        choiceId: mockChoiceId,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('選択肢が見つかりません');
      }
    });
  });

  describe('成功シナリオ', () => {
    it('正しい入力で回答を送信できる', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: mockUserId },
      });

      const mockAnswerId = 42;
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'quiz_control') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      current_question_id: mockQuestionId,
                      current_period_id: mockPeriodId,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'answers') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: null,
                      error: { code: 'PGRST116' }, // No rows found
                    }),
                  }),
                }),
              }),
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: mockAnswerId },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'choices') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: { is_correct: true },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          if (table === 'question_displays') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: { displayed_at: '2025-01-01T12:00:00Z' },
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);
      (createAdminClient as any).mockReturnValue(mockSupabase);

      const result = await submitAnswer({
        eventId: mockEventId,
        choiceId: mockChoiceId,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.answerId).toBeDefined();
      }
    });
  });

  describe('エラーハンドリング', () => {
    it('予期しないエラーをキャッチして返す', async () => {
      (validateSession as any).mockRejectedValue(new Error('Unexpected error'));

      const result = await submitAnswer({
        eventId: mockEventId,
        choiceId: mockChoiceId,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Unexpected error');
      }
    });
  });
});
