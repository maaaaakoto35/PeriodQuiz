import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUsers } from './getUsers';

// Mock modules
vi.mock('@/app/_lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/app/_lib/supabase/server';

describe('getUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ユーザーデータを取得する', async () => {
    const mockData = [
      {
        id: 1,
        nickname: 'テスト太郎',
        created_at: '2025-10-19T19:01:22Z',
        events: { name: 'イベント1' },
      },
      {
        id: 2,
        nickname: 'makoto',
        created_at: '2025-10-19T19:20:42Z',
        events: { name: 'イベント1' },
      },
    ];

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      }),
    };

    (createClient as any).mockResolvedValue(mockSupabase);

    const result = await getUsers();

    expect(result).toHaveLength(2);
    expect(result[0].nickname).toBe('テスト太郎');
    expect(result[1].nickname).toBe('makoto');
  });

  it('複数のイベントに参加しているユーザーはイベント名がグループ化される', async () => {
    const mockData = [
      {
        id: 1,
        nickname: 'makoto',
        created_at: '2025-10-19T19:20:42Z',
        events: { name: 'イベント1' },
      },
      {
        id: 1,
        nickname: 'makoto',
        created_at: '2025-10-19T19:20:42Z',
        events: { name: 'イベント2' },
      },
    ];

    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      }),
    };

    (createClient as any).mockResolvedValue(mockSupabase);

    const result = await getUsers();

    expect(result).toHaveLength(1);
    expect(result[0].eventNames).toEqual(['イベント1', 'イベント2']);
  });

  it('エラーが発生した場合、例外をスロー', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error'),
          }),
        }),
      }),
    };

    (createClient as any).mockResolvedValue(mockSupabase);

    try {
      await getUsers();
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      if (error instanceof Error) {
        expect(error.message).toContain('取得に失敗しました');
      }
    }
  });
});
