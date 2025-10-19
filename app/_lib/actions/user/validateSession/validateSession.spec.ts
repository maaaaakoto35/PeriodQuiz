import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateSession } from './validateSession';

// Mock modules
vi.mock('@/app/_lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

import { createClient } from '@/app/_lib/supabase/server';
import { cookies } from 'next/headers';

describe('validateSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('セッション検証', () => {
    it('セッションIDが見つからない場合はエラーを返す', async () => {
      const mockCookieStore = {
        get: vi.fn().mockReturnValue(undefined),
      };

      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const result = await validateSession();

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe('セッションが見つかりません');
      }
    });

    it('無効なセッションIDの場合はエラーを返す', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'no rows' },
              }),
            }),
          }),
        }),
      };

      const mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: 'invalid-session-id' }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const result = await validateSession();

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toBe('セッションが無効です');
      }
    });

    it('有効なセッションの場合ユーザー情報を返す', async () => {
      const mockUser = {
        id: 1,
        event_id: 1,
        nickname: 'テスト太郎',
        session_id: 'test-session-id',
        created_at: '2025-10-19T00:00:00Z',
        last_active_at: '2025-10-19T00:00:00Z',
      };

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn()
                .mockReturnValueOnce({
                  data: mockUser,
                  error: null,
                })
                .mockReturnValueOnce({
                  select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                      single: vi.fn(),
                    }),
                  }),
                }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              throwOnError: vi.fn().mockResolvedValue({}),
            }),
          }),
        }),
      };

      const mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: 'test-session-id' }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const result = await validateSession();

      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.user).toEqual(mockUser);
      }
    });

    it('URLパラメータ経由のセッションID検証に対応', async () => {
      const mockUser = {
        id: 1,
        event_id: 1,
        nickname: 'テスト太郎',
        session_id: 'url-session-id',
        created_at: '2025-10-19T00:00:00Z',
        last_active_at: '2025-10-19T00:00:00Z',
      };

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUser,
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              throwOnError: vi.fn().mockResolvedValue({}),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await validateSession('url-session-id');

      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.user.session_id).toBe('url-session-id');
      }
    });
  });
});
