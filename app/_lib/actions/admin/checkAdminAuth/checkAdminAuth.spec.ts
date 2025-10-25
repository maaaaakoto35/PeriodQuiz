import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAdminAuth } from './checkAdminAuth';

// Mock modules
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/app/_lib/supabase/server-admin', () => ({
  verifyAdminSessionId: vi.fn(),
  updateAdminSessionHeartbeat: vi.fn(),
}));

describe('checkAdminAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return authenticated true with valid existing session', async () => {
    const { cookies } = await import('next/headers');
    const { verifyAdminSessionId, updateAdminSessionHeartbeat } = await import(
      '@/app/_lib/supabase/server-admin'
    );

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: 'valid-session-id' }),
      delete: vi.fn(),
    };

    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
    vi.mocked(verifyAdminSessionId).mockResolvedValue(true);
    vi.mocked(updateAdminSessionHeartbeat).mockResolvedValue(true);

    const result = await checkAdminAuth();

    expect(result.authenticated).toBe(true);
    expect(result.error).toBeUndefined();
    expect(vi.mocked(updateAdminSessionHeartbeat)).toHaveBeenCalledWith('valid-session-id');
  });

  it('should fail with no session', async () => {
    const { cookies } = await import('next/headers');

    const mockCookieStore = {
      get: vi.fn().mockReturnValue(undefined),
      delete: vi.fn(),
    };

    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

    const result = await checkAdminAuth();

    expect(result.authenticated).toBe(false);
    expect(result.error).toBe('セッションが見つかりません');
  });

  it('should delete expired session cookie', async () => {
    const { cookies } = await import('next/headers');
    const { verifyAdminSessionId } = await import('@/app/_lib/supabase/server-admin');

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: 'expired-session-id' }),
      delete: vi.fn(),
    };

    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
    vi.mocked(verifyAdminSessionId).mockResolvedValue(false);

    const result = await checkAdminAuth();

    expect(mockCookieStore.delete).toHaveBeenCalledWith('admin_session_id');
    expect(result.authenticated).toBe(false);
    expect(result.error).toBe('セッション期限切れ');
  });

  it('should handle verification error gracefully', async () => {
    const { cookies } = await import('next/headers');
    const { verifyAdminSessionId } = await import('@/app/_lib/supabase/server-admin');

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: 'session-id' }),
      delete: vi.fn(),
    };

    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
    vi.mocked(verifyAdminSessionId).mockRejectedValue(new Error('DB Error'));

    const result = await checkAdminAuth();

    expect(result.authenticated).toBe(false);
    expect(result.error).toBe('サーバーエラーが発生しました');
  });
});
