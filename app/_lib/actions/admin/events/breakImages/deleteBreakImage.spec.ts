import { describe, it, expect, beforeEach, vi } from 'vitest';
import { deleteBreakImage } from './deleteBreakImage';
import * as adminAuth from '@/app/_lib/actions/admin/checkAdminAuth';
import * as supabaseServer from '@/app/_lib/supabase/server-admin';

vi.mock('@/app/_lib/actions/admin/checkAdminAuth');
vi.mock('@/app/_lib/supabase/server-admin');

describe('deleteBreakImage', () => {
  const imageId = '1';
  const imageUrl =
    'https://bucket.supabase.co/storage/v1/object/public/images/break-images/1/123456.jpg';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('管理者認証が通らない場合はエラーを返す', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockResolvedValue({
      authenticated: false,
    });

    const result = await deleteBreakImage(imageId);

    expect(result).toEqual({
      success: false,
      error: '管理者権限がありません',
    });
  });

  it('画像が見つからない場合はエラーを返す', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockResolvedValue({
      authenticated: true,
    });

    const mockSupabaseClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    };

    vi.mocked(supabaseServer.createAdminClient).mockReturnValue(
      mockSupabaseClient as any
    );

    const result = await deleteBreakImage(imageId);

    expect(result).toEqual({
      success: false,
      error: '画像が見つかりません',
    });
  });

  it('画像情報の取得エラーをハンドルする', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockResolvedValue({
      authenticated: true,
    });

    const mockSupabaseClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Select error' },
            }),
          }),
        }),
      }),
    };

    vi.mocked(supabaseServer.createAdminClient).mockReturnValue(
      mockSupabaseClient as any
    );

    const result = await deleteBreakImage(imageId);

    expect(result).toEqual({
      success: false,
      error: '画像が見つかりません',
    });
  });

  it('ファイルパスが不正な場合はエラーを返す', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockResolvedValue({
      authenticated: true,
    });

    const invalidUrl = 'https://example.com/invalid';

    const mockSupabaseClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: imageId, image_url: invalidUrl },
              error: null,
            }),
          }),
        }),
      }),
    };

    vi.mocked(supabaseServer.createAdminClient).mockReturnValue(
      mockSupabaseClient as any
    );

    const result = await deleteBreakImage(imageId);

    expect(result).toEqual({
      success: false,
      error: 'ファイルパスの抽出に失敗しました',
    });
  });

  it('Storage からのファイル削除エラーをハンドルする', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockResolvedValue({
      authenticated: true,
    });

    const mockSupabaseClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: imageId, image_url: imageUrl },
              error: null,
            }),
          }),
        }),
        delete: vi.fn(),
      }),
      storage: {
        from: vi.fn().mockReturnValue({
          remove: vi
            .fn()
            .mockResolvedValue({ error: { message: 'Delete error' } }),
        }),
      },
    };

    vi.mocked(supabaseServer.createAdminClient).mockReturnValue(
      mockSupabaseClient as any
    );

    const result = await deleteBreakImage(imageId);

    expect(result).toEqual({
      success: false,
      error: 'ファイル削除に失敗しました',
    });
  });

  it('データベース削除エラーをハンドルする', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockResolvedValue({
      authenticated: true,
    });

    const mockSupabaseClient = {
      from: vi.fn((table: string) => {
        if (table === 'event_break_images') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: imageId, image_url: imageUrl },
                  error: null,
                }),
              }),
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                error: { message: 'Delete error' },
              }),
            }),
          };
        }
      }),
      storage: {
        from: vi.fn().mockReturnValue({
          remove: vi
            .fn()
            .mockResolvedValue({ error: null }),
        }),
      },
    };

    vi.mocked(supabaseServer.createAdminClient).mockReturnValue(
      mockSupabaseClient as any
    );

    const result = await deleteBreakImage(imageId);

    expect(result).toEqual({
      success: false,
      error: 'データベース削除に失敗しました',
    });
  });

  it('正常に画像を削除できる', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockResolvedValue({
      authenticated: true,
    });

    const mockSupabaseClient = {
      from: vi.fn((table: string) => {
        if (table === 'event_break_images') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: imageId, image_url: imageUrl },
                  error: null,
                }),
              }),
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                error: null,
              }),
            }),
          };
        }
      }),
      storage: {
        from: vi.fn().mockReturnValue({
          remove: vi
            .fn()
            .mockResolvedValue({ error: null }),
        }),
      },
    };

    vi.mocked(supabaseServer.createAdminClient).mockReturnValue(
      mockSupabaseClient as any
    );

    const result = await deleteBreakImage(imageId);

    expect(result).toEqual({
      success: true,
    });
  });

  it('異なる URL パターンに対応する', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockResolvedValue({
      authenticated: true,
    });

    const testUrl =
      'https://different-domain.com/storage/v1/object/public/images/break-images/2/987654.png';

    const mockSupabaseClient = {
      from: vi.fn((table: string) => {
        if (table === 'event_break_images') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: imageId, image_url: testUrl },
                  error: null,
                }),
              }),
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                error: null,
              }),
            }),
          };
        }
      }),
      storage: {
        from: vi.fn().mockReturnValue({
          remove: vi
            .fn()
            .mockResolvedValue({ error: null }),
        }),
      },
    };

    vi.mocked(supabaseServer.createAdminClient).mockReturnValue(
      mockSupabaseClient as any
    );

    const result = await deleteBreakImage(imageId);

    expect(result).toEqual({
      success: true,
    });

    // Storage.remove が正しいパスで呼ばれたことを確認
    const storageFrom = mockSupabaseClient.storage.from('images');
    const removeCall = storageFrom.remove.mock.calls[0];
    expect(removeCall[0]).toContain('break-images/2/987654.png');
  });

  it('予期しないエラーをキャッチする', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockRejectedValue(
      new Error('Unexpected error')
    );

    const result = await deleteBreakImage(imageId);

    expect(result).toEqual({
      success: false,
      error: '予期しないエラーが発生しました',
    });
  });
});
