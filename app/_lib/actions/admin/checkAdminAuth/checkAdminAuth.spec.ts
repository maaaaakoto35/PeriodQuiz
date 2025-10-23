import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAdminAuth } from './checkAdminAuth';

// Mock modules
vi.mock('next/headers', () => ({
  headers: vi.fn(),
  cookies: vi.fn(),
}));

vi.mock('@/app/_lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('../verifyAdminCredentials', () => ({
  verifyAdminCredentials: vi.fn(),
}));

vi.mock('../createAdminSession', () => ({
  createAdminSession: vi.fn(),
}));

describe('checkAdminAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return authenticated true with valid existing session', async () => {
    const { headers, cookies } = await import('next/headers');
    const { createClient } = await import('@/app/_lib/supabase/server');

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: 'valid-session-id' }),
      set: vi.fn(),
      delete: vi.fn(),
    };

    const mockHeadersList = {
      get: vi.fn().mockReturnValue(null),
    };

    vi.mocked(headers).mockResolvedValue(mockHeadersList as any);
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'session-123',
                  last_active_at: new Date().toISOString(),
                  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                },
                error: null,
              }),
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    } as any);

    const result = await checkAdminAuth();

    expect(result.authenticated).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should fail with no session and no basic auth', async () => {
    const { headers, cookies } = await import('next/headers');

    const mockCookieStore = {
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
      delete: vi.fn(),
    };

    const mockHeadersList = {
      get: vi.fn().mockReturnValue(null),
    };

    vi.mocked(headers).mockResolvedValue(mockHeadersList as any);
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

    const result = await checkAdminAuth();

    expect(result.authenticated).toBe(false);
    expect(result.error).toBe('Basic 認証が必要です');
  });

  it('should delete expired session cookie', async () => {
    const { headers, cookies } = await import('next/headers');
    const { createClient } = await import('@/app/_lib/supabase/server');

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: 'expired-session-id' }),
      set: vi.fn(),
      delete: vi.fn(),
    };

    const mockHeadersList = {
      get: vi.fn().mockReturnValue(null),
    };

    vi.mocked(headers).mockResolvedValue(mockHeadersList as any);
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      }),
    } as any);

    const result = await checkAdminAuth();

    expect(mockCookieStore.delete).toHaveBeenCalledWith('admin_session_id');
    expect(result.authenticated).toBe(false);
  });

  it('should fail with invalid basic auth format', async () => {
    const { headers, cookies } = await import('next/headers');

    const mockCookieStore = {
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
      delete: vi.fn(),
    };

    const mockHeadersList = {
      get: vi.fn().mockReturnValue('InvalidAuthHeader'),
    };

    vi.mocked(headers).mockResolvedValue(mockHeadersList as any);
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

    const result = await checkAdminAuth();

    expect(result.authenticated).toBe(false);
    expect(result.error).toBe('Basic 認証が必要です');
  });

  it('should fail with missing username or password in basic auth', async () => {
    const { headers, cookies } = await import('next/headers');

    const mockCookieStore = {
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
      delete: vi.fn(),
    };

    // Base64 encode "admin:" (password missing)
    const basicAuth = Buffer.from('admin:').toString('base64');

    const mockHeadersList = {
      get: vi.fn().mockReturnValue(`Basic ${basicAuth}`),
    };

    vi.mocked(headers).mockResolvedValue(mockHeadersList as any);
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

    const result = await checkAdminAuth();

    expect(result.authenticated).toBe(false);
    expect(result.error).toBe('無効な認証情報です');
  });
});
