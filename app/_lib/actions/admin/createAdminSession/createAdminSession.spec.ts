import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAdminSession } from './createAdminSession';

// Mock Supabase
vi.mock('@/app/_lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-session-id-123',
});

describe('createAdminSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create admin user and session successfully', async () => {
    const { createClient } = await import('@/app/_lib/supabase/server');

    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn()
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'not found' },
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'new-admin-id' },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  session_id: 'test-session-id-123',
                },
                error: null,
              }),
            }),
          }),
        }),
    } as any);

    const result = await createAdminSession('testadmin');

    expect(result.success).toBe(true);
    expect(result.sessionId).toBe('test-session-id-123');
  });

  it('should use existing admin user if exists', async () => {
    const { createClient } = await import('@/app/_lib/supabase/server');

    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn()
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'existing-admin-id' },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  session_id: 'test-session-id-123',
                },
                error: null,
              }),
            }),
          }),
        }),
    } as any);

    const result = await createAdminSession('testadmin');

    expect(result.success).toBe(true);
    expect(result.sessionId).toBe('test-session-id-123');
  });

  it('should fail with empty username', async () => {
    const result = await createAdminSession('');

    expect(result.success).toBe(false);
    expect(result.error).toBe('ユーザー名は必須です');
  });

  it('should fail on session creation error', async () => {
    const { createClient } = await import('@/app/_lib/supabase/server');

    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn()
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'existing-admin-id' },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'session error' },
              }),
            }),
          }),
        }),
    } as any);

    const result = await createAdminSession('testadmin');

    expect(result.success).toBe(false);
    expect(result.error).toBe('セッション作成に失敗しました');
  });
});
