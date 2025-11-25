import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAnswerResult } from './getAnswerResult';

// Mock modules
vi.mock('@/app/_lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('../validateSession', () => ({
  validateSession: vi.fn(),
}));

import { createClient } from '@/app/_lib/supabase/server';
import { validateSession } from '../validateSession';

describe('getAnswerResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('成功ケース', () => {
    it('問題、選択肢、回答情報を取得できる', async () => {
      // モックセッション
      vi.mocked(validateSession).mockResolvedValue({
        valid: true,
        user: {
          id: 'test-user-id',
        },
      } as any);

      // モックSupabase
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'quiz_control') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { current_question_id: 1 },
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
                    data: {
                      text: 'What is 2 + 2?',
                      image_url: 'https://example.com/image.jpg',
                    },
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
                  order: vi.fn().mockResolvedValue({
                    data: [
                      {
                        id: 1,
                        text: '4',
                        image_url: null,
                        is_correct: true,
                        order_num: 1,
                      },
                      {
                        id: 2,
                        text: '5',
                        image_url: null,
                        is_correct: false,
                        order_num: 2,
                      },
                    ],
                    error: null,
                  }),
                }),
              }),
            };
          }

          if (table === 'answers') {
            // 最初のqueryで回答取得、2回目のqueryで集計取得
            let callCount = 0;
            return {
              select: vi.fn().mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                  // 回答取得
                  return {
                    eq: vi
                      .fn()
                      .mockReturnValue({
                        eq: vi
                          .fn()
                          .mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                              data: {
                                choice_id: 1,
                                is_correct: true,
                                response_time_ms: 5000,
                              },
                              error: null,
                            }),
                          }),
                      }),
                  };
                } else {
                  // 集計取得
                  return {
                    eq: vi
                      .fn()
                      .mockReturnValue({
                        data: [
                          { choice_id: 1 },
                          { choice_id: 1 },
                          { choice_id: 2 },
                        ],
                        error: null,
                      }),
                  };
                }
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

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await getAnswerResult(1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.questionText).toBe('What is 2 + 2?');
        expect(result.data.questionImageUrl).toBe(
          'https://example.com/image.jpg'
        );
        expect(result.data.choices).toHaveLength(2);
        expect(result.data.userAnswer).toEqual({
          choiceId: 1,
          isCorrect: true,
          responseTimeMs: 5000,
        });
      }
    });

    it('ユーザーが回答していない場合、userAnswerはnullになる', async () => {
      vi.mocked(validateSession).mockResolvedValue({
        valid: true,
        user: {
          id: 'test-user-id',
        },
      } as any);

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'quiz_control') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { current_question_id: 1 },
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
                    data: {
                      text: 'Question?',
                      image_url: null,
                    },
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
                  order: vi.fn().mockResolvedValue({
                    data: [
                      {
                        id: 1,
                        text: 'Option 1',
                        image_url: null,
                        is_correct: true,
                        order_num: 1,
                      },
                    ],
                    error: null,
                  }),
                }),
              }),
            };
          }

          if (table === 'answers') {
            let callCount = 0;
            return {
              select: vi.fn().mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                  // 回答なし
                  return {
                    eq: vi
                      .fn()
                      .mockReturnValue({
                        eq: vi
                          .fn()
                          .mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                              data: null,
                              error: null,
                            }),
                          }),
                      }),
                  };
                } else {
                  // 集計取得
                  return {
                    eq: vi
                      .fn()
                      .mockReturnValue({
                        data: [],
                        error: null,
                      }),
                  };
                }
              }),
            };
          }

          return {};
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await getAnswerResult(1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userAnswer).toBeNull();
      }
    });
  });

  describe('エラーケース', () => {
    it('セッションが見つからない場合、エラーを返す', async () => {
      vi.mocked(validateSession).mockResolvedValue({
        valid: false,
        error: 'セッションが見つかりません',
      } as any);

      const result = await getAnswerResult(1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('セッションが見つかりません');
      }
    });

    it('問題情報が見つからない場合、エラーを返す', async () => {
      vi.mocked(validateSession).mockResolvedValue({
        valid: true,
        user: {
          id: 'test-user-id',
        },
      } as any);

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'quiz_control') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'not found' },
                  }),
                }),
              }),
            };
          }
          return {};
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await getAnswerResult(1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('問題情報が見つかりません');
      }
    });

    it('問題テキストが見つからない場合、エラーを返す', async () => {
      vi.mocked(validateSession).mockResolvedValue({
        valid: true,
        user: {
          id: 'test-user-id',
        },
      } as any);

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'quiz_control') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { current_question_id: 1 },
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
                    data: null,
                    error: { message: 'not found' },
                  }),
                }),
              }),
            };
          }

          return {};
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await getAnswerResult(1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('問題が見つかりません');
      }
    });

    it('選択肢が見つからない場合、エラーを返す', async () => {
      vi.mocked(validateSession).mockResolvedValue({
        valid: true,
        user: {
          id: 'test-user-id',
        },
      } as any);

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'quiz_control') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { current_question_id: 1 },
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
                    data: {
                      text: 'Question?',
                      image_url: null,
                    },
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
                  order: vi.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'not found' },
                  }),
                }),
              }),
            };
          }

          return {};
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await getAnswerResult(1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('選択肢が見つかりません');
      }
    });

    it('予期しないエラーが発生した場合、エラーを返す', async () => {
      vi.mocked(validateSession).mockRejectedValue(
        new Error('Unexpected error')
      );

      const result = await getAnswerResult(1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('エラーが発生しました');
      }
    });
  });
});
