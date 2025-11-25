import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getBreakImages } from './getBreakImages';
import * as adminAuth from '@/app/_lib/actions/admin/checkAdminAuth';
import * as supabaseServer from '@/app/_lib/supabase/server-admin';

vi.mock('@/app/_lib/actions/admin/checkAdminAuth');
vi.mock('@/app/_lib/supabase/server-admin');

describe('getBreakImages', () => {
  const eventId = 1;
  const mockImages = [
    {
      id: '1',
      image_url: 'https://example.com/image1.jpg',
      created_at: '2025-01-02T00:00:00Z',
    },
    {
      id: '2',
      image_url: 'https://example.com/image2.jpg',
      created_at: '2025-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('管理者認証が通らない場合はエラーを返す', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockResolvedValue({
      authenticated: false,
    });

    const result = await getBreakImages(eventId);

    expect(result).toEqual({
      success: false,
      error: '管理者権限がありません',
    });
    expect(adminAuth.checkAdminAuth).toHaveBeenCalled();
  });

  it('イベントが存在しない場合はエラーを返す', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockResolvedValue({
      authenticated: true,
    });

    const mockSupabaseClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
      }),
    };

    vi.mocked(supabaseServer.createAdminClient).mockReturnValue(
      mockSupabaseClient as any
    );

    const result = await getBreakImages(eventId);

    expect(result).toEqual({
      success: false,
      error: 'イベントが見つかりません',
    });
  });

  it('正常に画像一覧を取得できる', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockResolvedValue({
      authenticated: true,
    });

    const mockSupabaseClient = {
      from: vi.fn((table: string) => {
        if (table === 'events') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi
                  .fn()
                  .mockResolvedValue({ data: { id: eventId } }),
              }),
            }),
          };
        }
        if (table === 'event_break_images') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockImages, error: null }),
              }),
            }),
          };
        }
      }),
    };

    vi.mocked(supabaseServer.createAdminClient).mockReturnValue(
      mockSupabaseClient as any
    );

    const result = await getBreakImages(eventId);

    expect(result).toEqual({
      success: true,
      images: mockImages,
    });
  });

  it('データベースエラーをハンドルする', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockResolvedValue({
      authenticated: true,
    });

    const mockSupabaseClient = {
      from: vi.fn((table: string) => {
        if (table === 'events') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi
                  .fn()
                  .mockResolvedValue({ data: { id: eventId } }),
              }),
            }),
          };
        }
        if (table === 'event_break_images') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Database error' },
                }),
              }),
            }),
          };
        }
      }),
    };

    vi.mocked(supabaseServer.createAdminClient).mockReturnValue(
      mockSupabaseClient as any
    );

    const result = await getBreakImages(eventId);

    expect(result).toEqual({
      success: false,
      error: 'データベース取得に失敗しました',
    });
  });

  it('画像がない場合は空配列を返す', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockResolvedValue({
      authenticated: true,
    });

    const mockSupabaseClient = {
      from: vi.fn((table: string) => {
        if (table === 'events') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi
                  .fn()
                  .mockResolvedValue({ data: { id: eventId } }),
              }),
            }),
          };
        }
        if (table === 'event_break_images') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          };
        }
      }),
    };

    vi.mocked(supabaseServer.createAdminClient).mockReturnValue(
      mockSupabaseClient as any
    );

    const result = await getBreakImages(eventId);

    expect(result).toEqual({
      success: true,
      images: [],
    });
  });

  it('予期しないエラーをキャッチする', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockRejectedValue(
      new Error('Unexpected error')
    );

    const result = await getBreakImages(eventId);

    expect(result).toEqual({
      success: false,
      error: '予期しないエラーが発生しました',
    });
  });
});
