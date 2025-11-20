import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getQuizStatus } from './getQuizStatus';

// Mock modules - BEFORE importing getQuizStatus
vi.mock('@/app/_lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('../validateSession', () => ({
  validateSession: vi.fn(),
}));

import { createClient } from '@/app/_lib/supabase/server';
import { validateSession } from '../validateSession';

describe('getQuizStatus', () => {
  const mockEventId = 1;

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

      const result = await getQuizStatus(mockEventId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('セッションが見つかりません');
      }
    });
  });

  describe('クイズ制御情報取得', () => {
    it('quiz_control が見つからない場合、エラーを返す', async () => {
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

      const result = await getQuizStatus(mockEventId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('クイズ状態が見つかりません');
      }
    });
  });

  describe('成功シナリオ', () => {
    it('正しくクイズ状態を取得できる', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: 1 },
      });

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  current_screen: 'question',
                  current_period_id: 1,
                  current_question_id: 5,
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await getQuizStatus(mockEventId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.eventId).toBe(mockEventId);
        expect(result.data.currentScreen).toBe('question');
        expect(result.data.currentPeriodId).toBe(1);
        expect(result.data.currentQuestionId).toBe(5);
      }
    });

    it('current_period_id が null の場合も返す', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: 1 },
      });

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  current_screen: 'waiting',
                  current_period_id: null,
                  current_question_id: null,
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await getQuizStatus(mockEventId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentScreen).toBe('waiting');
        expect(result.data.currentPeriodId).toBeNull();
        expect(result.data.currentQuestionId).toBeNull();
      }
    });

    it('複数の画面状態に対応できる', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: 1 },
      });

      const screens = [
        'waiting' as const,
        'question' as const,
        'answer' as const,
        'period_result' as const,
        'final_result' as const,
      ];

      for (const screen of screens) {
        const mockSupabase = {
          from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    current_screen: screen,
                    current_period_id: 1,
                    current_question_id: 1,
                  },
                  error: null,
                }),
              }),
            }),
          }),
        };

        (createClient as any).mockResolvedValue(mockSupabase);

        const result = await getQuizStatus(mockEventId);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.currentScreen).toBe(screen);
        }
      }
    });
  });

  describe('エラーハンドリング', () => {
    it('予期しないエラーをキャッチして返す', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: 1 },
      });

      (createClient as any).mockRejectedValue(new Error('Database error'));

      const result = await getQuizStatus(mockEventId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Database error');
      }
    });

    it('validateSession がエラーをスローした場合', async () => {
      (validateSession as any).mockRejectedValue(new Error('Session error'));

      const result = await getQuizStatus(mockEventId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Session error');
      }
    });
  });
});
