import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getQuestionWithChoices } from './getQuestionWithChoices';

// Mock modules - BEFORE importing getQuestionWithChoices
vi.mock('@/app/_lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('../validateSession', () => ({
  validateSession: vi.fn(),
}));

import { createClient } from '@/app/_lib/supabase/server';
import { validateSession } from '../validateSession';

describe('getQuestionWithChoices', () => {
  const mockEventId = 1;
  const mockQuestionId = 1;
  const mockDisplayedAt = '2025-01-01T12:00:00Z';

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

      const result = await getQuestionWithChoices({ eventId: mockEventId });

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

      const result = await getQuestionWithChoices({ eventId: mockEventId });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('現在の問題情報が見つかりません');
      }
    });

    it('current_question_id が null の場合、エラーを返す', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: 1 },
      });

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { current_question_id: null },
                error: null,
              }),
            }),
          }),
        }),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await getQuestionWithChoices({ eventId: mockEventId });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('現在の問題情報が見つかりません');
      }
    });
  });

  describe('問題と選択肢の取得', () => {
    it('問題が見つからない場合、エラーを返す', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: 1 },
      });

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => ({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockImplementation(function (this: any) {
              if (table === 'quiz_control') {
                return {
                  single: vi.fn().mockResolvedValue({
                    data: { current_question_id: mockQuestionId },
                    error: null,
                  }),
                };
              } else if (table === 'questions') {
                return {
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Not found' },
                  }),
                };
              }
              return this;
            }),
          }),
        })),
      };

      (createClient as any).mockResolvedValue(mockSupabase);

      const result = await getQuestionWithChoices({ eventId: mockEventId });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('問題の取得に失敗しました');
      }
    });
  });

  describe('成功シナリオ', () => {
    it('問題と選択肢を正しく取得できる', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: 1 },
      });

      const mockQuestion = {
        id: mockQuestionId,
        text: 'テスト問題',
        image_url: '/test.png',
        choices: [
          {
            id: 1,
            text: '選択肢1',
            image_url: null,
            order_num: 1,
          },
          {
            id: 2,
            text: '選択肢2',
            image_url: null,
            order_num: 2,
          },
        ],
      };

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'quiz_control') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { current_question_id: mockQuestionId },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'questions') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockQuestion,
                    error: null,
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
                    order: vi.fn().mockReturnValue({
                      limit: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                          data: { displayed_at: mockDisplayedAt },
                          error: null,
                        }),
                      }),
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

      const result = await getQuestionWithChoices({ eventId: mockEventId });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(mockQuestionId);
        expect(result.data.text).toBe('テスト問題');
        expect(result.data.image_url).toBe('/test.png');
        expect(result.data.choices).toHaveLength(2);
        expect(result.data.choices[0].text).toBe('選択肢1');
        expect(result.data.displayed_at).toBe(mockDisplayedAt);
      }
    });

    it('is_correct 情報はクライアントに返さない', async () => {
      (validateSession as any).mockResolvedValue({
        valid: true,
        user: { id: 1 },
      });

      const mockQuestion = {
        id: mockQuestionId,
        text: 'テスト問題',
        image_url: null,
        choices: [
          {
            id: 1,
            text: '選択肢1',
            image_url: null,
            order_num: 1,
          },
        ],
      };

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'quiz_control') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { current_question_id: mockQuestionId },
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === 'questions') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockQuestion,
                    error: null,
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
                    order: vi.fn().mockReturnValue({
                      limit: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                          data: { displayed_at: mockDisplayedAt },
                          error: null,
                        }),
                      }),
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

      const result = await getQuestionWithChoices({ eventId: mockEventId });

      expect(result.success).toBe(true);
      if (result.success) {
        // is_correct が含まれていないことを確認
        expect(result.data.choices[0]).not.toHaveProperty('is_correct');
      }
    });
  });

  describe('エラーハンドリング', () => {
    it('予期しないエラーをキャッチして返す', async () => {
      (validateSession as any).mockRejectedValue(new Error('Unexpected error'));

      const result = await getQuestionWithChoices({ eventId: mockEventId });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Unexpected error');
      }
    });
  });
});
