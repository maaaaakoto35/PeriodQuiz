'use server';

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resetEvent } from './resetEvent';
import { checkAdminAuth } from '../checkAdminAuth';
import { createAdminClient } from '@/app/_lib/supabase/server-admin';

// モック
vi.mock('../checkAdminAuth');
vi.mock('@/app/_lib/supabase/server-admin');

describe('resetEvent', () => {
  const mockEventId = 1;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    it('管理者認証が失敗した場合、エラーを返すこと', async () => {
      vi.mocked(checkAdminAuth).mockResolvedValue({
        authenticated: false,
      });

      const result = await resetEvent(mockEventId);

      expect(result).toEqual({
        success: false,
        error: '認証が必要です',
      });
    });

    it('イベントをリセットできること', async () => {
      const mockPeriods = [
        { id: 1 },
        { id: 2 },
      ];

      const mockUsers = [
        { id: 'user1' },
        { id: 'user2' },
      ];

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'quiz_control') {
            return {
              update: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          if (table === 'periods') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ data: mockPeriods, error: null }),
            };
          }
          if (table === 'question_displays') {
            return {
              delete: vi.fn().mockReturnThis(),
              in: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          if (table === 'users') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
            };
          }
          if (table === 'answers') {
            return {
              delete: vi.fn().mockReturnThis(),
              in: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          return {};
        }),
      };

      vi.mocked(checkAdminAuth).mockResolvedValue({
        authenticated: true,
      });
      vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

      const result = await resetEvent(mockEventId);

      expect(result).toEqual({
        success: true,
      });
      expect(mockSupabase.from).toHaveBeenCalledWith('quiz_control');
      expect(mockSupabase.from).toHaveBeenCalledWith('periods');
      expect(mockSupabase.from).toHaveBeenCalledWith('question_displays');
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockSupabase.from).toHaveBeenCalledWith('answers');
    });

    it('ピリオドが存在しない場合、question_displaysの削除をスキップすること', async () => {
      const mockUsers = [
        { id: 'user1' },
      ];

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'quiz_control') {
            return {
              update: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          if (table === 'periods') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            };
          }
          if (table === 'users') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
            };
          }
          if (table === 'answers') {
            return {
              delete: vi.fn().mockReturnThis(),
              in: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          return {};
        }),
      };

      vi.mocked(checkAdminAuth).mockResolvedValue({
        authenticated: true,
      });
      vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

      const result = await resetEvent(mockEventId);

      expect(result).toEqual({
        success: true,
      });
      // question_displays は呼ばれないはず
      const calls = mockSupabase.from.mock.calls.map((c: any[]) => c[0]);
      expect(calls).not.toContain('question_displays');
    });

    it('ユーザーが存在しない場合、answersの削除をスキップすること', async () => {
      const mockPeriods = [
        { id: 1 },
      ];

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'quiz_control') {
            return {
              update: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          if (table === 'periods') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ data: mockPeriods, error: null }),
            };
          }
          if (table === 'question_displays') {
            return {
              delete: vi.fn().mockReturnThis(),
              in: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          if (table === 'users') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            };
          }
          return {};
        }),
      };

      vi.mocked(checkAdminAuth).mockResolvedValue({
        authenticated: true,
      });
      vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

      const result = await resetEvent(mockEventId);

      expect(result).toEqual({
        success: true,
      });
      // answers は呼ばれないはず
      const calls = mockSupabase.from.mock.calls.map((c: any[]) => c[0]);
      expect(calls).not.toContain('answers');
    });
  });

  describe('エラーハンドリング', () => {
    it('quiz_control の更新に失敗した場合、エラーを返すこと', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Update failed' },
          }),
        }),
      };

      vi.mocked(checkAdminAuth).mockResolvedValue({
        authenticated: true,
      });
      vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

      const result = await resetEvent(mockEventId);

      expect(result).toEqual({
        success: false,
        error: 'クイズ制御情報の更新に失敗しました: Update failed',
      });
    });

    it('ピリオド取得に失敗した場合、エラーを返すこと', async () => {
      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'quiz_control') {
            return {
              update: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          if (table === 'periods') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Query failed' },
              }),
            };
          }
          return {};
        }),
      };

      vi.mocked(checkAdminAuth).mockResolvedValue({
        authenticated: true,
      });
      vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

      const result = await resetEvent(mockEventId);

      expect(result).toEqual({
        success: false,
        error: 'ピリオド取得に失敗しました: Query failed',
      });
    });

    it('question_displays の削除に失敗した場合、エラーを返すこと', async () => {
      const mockPeriods = [{ id: 1 }];

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'quiz_control') {
            return {
              update: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          if (table === 'periods') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ data: mockPeriods, error: null }),
            };
          }
          if (table === 'question_displays') {
            return {
              delete: vi.fn().mockReturnThis(),
              in: vi.fn().mockResolvedValue({
                error: { message: 'Delete failed' },
              }),
            };
          }
          return {};
        }),
      };

      vi.mocked(checkAdminAuth).mockResolvedValue({
        authenticated: true,
      });
      vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

      const result = await resetEvent(mockEventId);

      expect(result).toEqual({
        success: false,
        error: '問題表示記録の削除に失敗しました: Delete failed',
      });
    });

    it('ユーザー取得に失敗した場合、エラーを返すこと', async () => {
      const mockPeriods = [{ id: 1 }];

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'quiz_control') {
            return {
              update: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          if (table === 'periods') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ data: mockPeriods, error: null }),
            };
          }
          if (table === 'question_displays') {
            return {
              delete: vi.fn().mockReturnThis(),
              in: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          if (table === 'users') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Query failed' },
              }),
            };
          }
          return {};
        }),
      };

      vi.mocked(checkAdminAuth).mockResolvedValue({
        authenticated: true,
      });
      vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

      const result = await resetEvent(mockEventId);

      expect(result).toEqual({
        success: false,
        error: 'ユーザー取得に失敗しました: Query failed',
      });
    });

    it('回答データの削除に失敗した場合、エラーを返すこと', async () => {
      const mockPeriods = [{ id: 1 }];
      const mockUsers = [{ id: 'user1' }];

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'quiz_control') {
            return {
              update: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          if (table === 'periods') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ data: mockPeriods, error: null }),
            };
          }
          if (table === 'question_displays') {
            return {
              delete: vi.fn().mockReturnThis(),
              in: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          if (table === 'users') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ data: mockUsers, error: null }),
            };
          }
          if (table === 'answers') {
            return {
              delete: vi.fn().mockReturnThis(),
              in: vi.fn().mockResolvedValue({
                error: { message: 'Delete failed' },
              }),
            };
          }
          return {};
        }),
      };

      vi.mocked(checkAdminAuth).mockResolvedValue({
        authenticated: true,
      });
      vi.mocked(createAdminClient).mockReturnValue(mockSupabase as any);

      const result = await resetEvent(mockEventId);

      expect(result).toEqual({
        success: false,
        error: '回答データの削除に失敗しました: Delete failed',
      });
    });

    it('予期しないエラーが発生した場合、エラーを返すこと', async () => {
      vi.mocked(checkAdminAuth).mockRejectedValue(
        new Error('Unexpected error')
      );

      const result = await resetEvent(mockEventId);

      expect(result).toEqual({
        success: false,
        error: 'リセット処理中にエラーが発生しました: Unexpected error',
      });
    });
  });
});
