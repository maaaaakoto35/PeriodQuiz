import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useRealtimeUserCount } from './useRealtimeUserCount';
import * as supabaseClient from '@/app/_lib/supabase/client';

// Supabaseクライアントのモック
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
};

const mockSupabaseClient = {
  from: vi.fn(),
  channel: vi.fn().mockReturnValue(mockChannel),
  removeChannel: vi.fn(),
};

vi.mock('@/app/_lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

describe('useRealtimeUserCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('初期状態で initialCount を使用する', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
    };
    (mockSupabaseClient.from as any).mockReturnValue(mockQuery);

    const { result } = renderHook(() =>
      useRealtimeUserCount({ eventId: 1, initialCount: 5 })
    );

    expect(result.current.userCount).toBe(5);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('初期状態で isLoading は true から false に遷移する', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
    };
    (mockSupabaseClient.from as any).mockReturnValue(mockQuery);

    const { result } = renderHook(() =>
      useRealtimeUserCount({ eventId: 1, initialCount: 0 })
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('データベースから正しく参加者数を取得する', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 10, error: null }),
    };
    (mockSupabaseClient.from as any).mockReturnValue(mockQuery);

    const { result } = renderHook(() =>
      useRealtimeUserCount({ eventId: 2, initialCount: 0 })
    );

    await waitFor(() => {
      expect(result.current.userCount).toBe(10);
    });

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
    expect(mockQuery.select).toHaveBeenCalledWith('*', {
      count: 'exact',
      head: true,
    });
    expect(mockQuery.eq).toHaveBeenCalledWith('event_id', 2);
  });

  it('Realtimeチャネルを正しくセットアップする', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
    };
    (mockSupabaseClient.from as any).mockReturnValue(mockQuery);

    renderHook(() => useRealtimeUserCount({ eventId: 3 }));

    await waitFor(() => {
      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('realtime-users-3');
    });

    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: 'event_id=eq.3',
      },
      expect.any(Function)
    );
  });

  it('Realtimeイベント時に参加者数を再取得する', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi
        .fn()
        .mockResolvedValueOnce({ count: 5, error: null })
        .mockResolvedValueOnce({ count: 6, error: null }),
    };
    (mockSupabaseClient.from as any).mockReturnValue(mockQuery);

    let realtimeCallback: (() => void) | null = null;

    mockChannel.on.mockImplementation(
      (_event: string, _config: any, callback: () => void) => {
        realtimeCallback = callback;
        return mockChannel;
      }
    );

    const { result } = renderHook(() =>
      useRealtimeUserCount({ eventId: 4, initialCount: 5 })
    );

    await waitFor(() => {
      expect(result.current.userCount).toBe(5);
    });

    // Realtimeイベントをシミュレート
    if (realtimeCallback) {
      (realtimeCallback as () => void)();
    }

    await waitFor(() => {
      expect(result.current.userCount).toBe(6);
    });
  });

  it('ネットワークエラーを正しく処理する', async () => {
    const mockError = new Error('Network error');
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: null, error: mockError }),
    };
    (mockSupabaseClient.from as any).mockReturnValue(mockQuery);

    const { result } = renderHook(() =>
      useRealtimeUserCount({ eventId: 5 })
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('アンマウント時にチャネルを削除する', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
    };
    (mockSupabaseClient.from as any).mockReturnValue(mockQuery);

    const { unmount } = renderHook(() =>
      useRealtimeUserCount({ eventId: 6 })
    );

    await waitFor(() => {
      expect(mockSupabaseClient.channel).toHaveBeenCalled();
    });

    unmount();

    expect(mockSupabaseClient.removeChannel).toHaveBeenCalled();
  });

  it('count が null の場合は 0 にセットする', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: null, error: null }),
    };
    (mockSupabaseClient.from as any).mockReturnValue(mockQuery);

    const { result } = renderHook(() =>
      useRealtimeUserCount({ eventId: 7 })
    );

    await waitFor(() => {
      expect(result.current.userCount).toBe(0);
    });
  });

  it('複数回のリアルタイムイベントに対応する', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi
        .fn()
        .mockResolvedValueOnce({ count: 5, error: null })
        .mockResolvedValueOnce({ count: 6, error: null })
        .mockResolvedValueOnce({ count: 7, error: null })
        .mockResolvedValueOnce({ count: 6, error: null }),
    };
    (mockSupabaseClient.from as any).mockReturnValue(mockQuery);

    let realtimeCallback: (() => void) | null = null;

    mockChannel.on.mockImplementation(
      (_event: string, _config: any, callback: () => void) => {
        realtimeCallback = callback;
        return mockChannel;
      }
    );

    const { result } = renderHook(() =>
      useRealtimeUserCount({ eventId: 8, initialCount: 5 })
    );

    await waitFor(() => {
      expect(result.current.userCount).toBe(5);
    });

    // 1回目のイベント
    if (realtimeCallback) {
      (realtimeCallback as () => void)();
    }
    await waitFor(() => {
      expect(result.current.userCount).toBe(6);
    });

    // 2回目のイベント
    if (realtimeCallback) {
      (realtimeCallback as () => void)();
    }
    await waitFor(() => {
      expect(result.current.userCount).toBe(7);
    });

    // 3回目のイベント
    if (realtimeCallback) {
      (realtimeCallback as () => void)();
    }
    await waitFor(() => {
      expect(result.current.userCount).toBe(6);
    });
  });

  it('異なる eventId で独立したチャネルを作成する', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
    };
    (mockSupabaseClient.from as any).mockReturnValue(mockQuery);

    const { rerender } = renderHook(
      ({ eventId }) => useRealtimeUserCount({ eventId }),
      { initialProps: { eventId: 9 } }
    );

    await waitFor(() => {
      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('realtime-users-9');
    });

    rerender({ eventId: 10 });

    await waitFor(() => {
      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('realtime-users-10');
    });
  });
});
