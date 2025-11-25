import { describe, it, expect, beforeEach, vi } from 'vitest';
import { uploadBreakImage } from './uploadBreakImage';
import * as adminAuth from '@/app/_lib/actions/admin/checkAdminAuth';
import * as supabaseServer from '@/app/_lib/supabase/server-admin';

vi.mock('@/app/_lib/actions/admin/checkAdminAuth');
vi.mock('@/app/_lib/supabase/server-admin');

describe('uploadBreakImage', () => {
  const eventId = 1;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('管理者認証が通らない場合はエラーを返す', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockResolvedValue({
      authenticated: false,
    });

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const result = await uploadBreakImage(eventId, mockFile);

    expect(result).toEqual({
      success: false,
      error: '管理者権限がありません',
    });
  });

  it('対応していない形式のファイルはエラーを返す', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockResolvedValue({
      authenticated: true,
    });

    const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
    const result = await uploadBreakImage(eventId, mockFile);

    expect(result.success).toBe(false);
    expect(result.error).toContain('対応していない画像形式');
  });

  it('4MB を超えるファイルはエラーを返す', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockResolvedValue({
      authenticated: true,
    });

    const largeBuffer = new ArrayBuffer(5 * 1024 * 1024);
    const mockFile = new File([largeBuffer], 'large.jpg', {
      type: 'image/jpeg',
    });

    const result = await uploadBreakImage(eventId, mockFile);

    expect(result.success).toBe(false);
    expect(result.error).toContain('ファイルサイズが大きすぎます');
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

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const result = await uploadBreakImage(eventId, mockFile);

    expect(result).toEqual({
      success: false,
      error: 'イベントが見つかりません',
    });
  });

  it('予期しないエラーをキャッチする', async () => {
    vi.mocked(adminAuth.checkAdminAuth).mockRejectedValue(
      new Error('Unexpected error')
    );

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const result = await uploadBreakImage(eventId, mockFile);

    expect(result.success).toBe(false);
    expect(result.error).toBe('予期しないエラーが発生しました。時間をおいて再度お試しください。');
  });
});
