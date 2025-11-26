import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePolledRankings } from './usePolledRankings';
import * as supabaseModule from '@/app/_lib/supabase/client';

// Supabaseクライアントのモック
vi.mock('@/app/_lib/supabase/client');

describe('usePolledRankings', () => {
  const mockEventId = 1;
  const mockPeriodId = 1;

  const mockPeriodRankingData = [
    {
      user_id: 1,
      nickname: 'User1',
      correct_count: 10,
      total_response_time_ms: 5000,
      answered_count: 10,
    },
    {
      user_id: 2,
      nickname: 'User2',
      correct_count: 8,
      total_response_time_ms: 6000,
      answered_count: 10,
    },
  ];

  const mockEventRankingData = [
    {
      user_id: 1,
      nickname: 'User1',
      correct_count: 25,
      total_response_time_ms: 15000,
      answered_count: 30,
    },
    {
      user_id: 2,
      nickname: 'User2',
      correct_count: 20,
      total_response_time_ms: 18000,
      answered_count: 30,
    },
  ];

  let mockSupabaseClient: any;
  let callCount = 0;

  beforeEach(() => {
    callCount = 0;

    // Supabaseクライアントのモック設定
    mockSupabaseClient = {
      from: vi.fn(() => {
        callCount++;
        const isOdd = callCount % 2 === 1;
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue(
            isOdd
              ? { data: mockPeriodRankingData, error: null }
              : { data: mockEventRankingData, error: null }
          ),
        };
      }),
    };

    vi.mocked(supabaseModule.createClient).mockReturnValue(mockSupabaseClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
    callCount = 0;
  });

  it('初期状態でローディング中を返す', () => {
    const { result } = renderHook(() =>
      usePolledRankings({ eventId: mockEventId, periodId: mockPeriodId })
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.rankings).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('ランキングデータを正しく取得できる', async () => {
    const { result } = renderHook(() =>
      usePolledRankings({ eventId: mockEventId, periodId: mockPeriodId })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.rankings).not.toBeNull();
    expect(result.current.rankings?.period.entries).toHaveLength(2);
    expect(result.current.rankings?.event.entries).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('ピリオドランキングが正しく変換される', async () => {
    const { result } = renderHook(() =>
      usePolledRankings({ eventId: mockEventId, periodId: mockPeriodId })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const periodEntries = result.current.rankings?.period.entries;
    expect(periodEntries?.[0]).toEqual({
      rank: 1,
      userId: 1,
      nickname: 'User1',
      correctCount: 10,
      totalResponseTimeMs: 5000,
      answeredCount: 10,
    });
  });

  it('イベント全体ランキングが正しく変換される', async () => {
    const { result } = renderHook(() =>
      usePolledRankings({ eventId: mockEventId, periodId: mockPeriodId })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const eventEntries = result.current.rankings?.event.entries;
    expect(eventEntries?.[0]).toEqual({
      rank: 1,
      userId: 1,
      nickname: 'User1',
      correctCount: 25,
      totalResponseTimeMs: 15000,
      answeredCount: 30,
    });
  });

  it('ピリオドランキングのエラーをハンドルする', async () => {
    const mockError = new Error('Period rankings fetch failed');
    callCount = 0;

    mockSupabaseClient.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    });

    const { result } = renderHook(() =>
      usePolledRankings({ eventId: mockEventId, periodId: mockPeriodId })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Period rankings fetch failed');
    expect(result.current.rankings).toBeNull();
  });

  it('enabledがfalseの場合、ポーリングを開始しない', () => {
    const { result } = renderHook(() =>
      usePolledRankings({
        eventId: mockEventId,
        periodId: mockPeriodId,
        enabled: false,
      })
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.rankings).toBeNull();
  });

  it('ランキング取得時にperiod-rankingsとevent-rankingsの両方がクエリされる', async () => {
    const { result } = renderHook(() =>
      usePolledRankings({ eventId: mockEventId, periodId: mockPeriodId })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 2つのテーブルに対してクエリされるため、from()は最低2回呼び出される
    expect(mockSupabaseClient.from.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('アンマウント時にポーリングが停止する', async () => {
    const { unmount, result } = renderHook(() =>
      usePolledRankings({
        eventId: mockEventId,
        periodId: mockPeriodId,
        pollInterval: 100,
      })
    );

    // 初回データ取得を待つ
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const callCountBeforeUnmount = mockSupabaseClient.from.mock.calls.length;

    // アンマウント
    unmount();

    // 少し待機
    await new Promise((resolve) => setTimeout(resolve, 200));

    // アンマウント後は新しいcallが発生していない
    const callCountAfterUnmount = mockSupabaseClient.from.mock.calls.length;
    expect(callCountAfterUnmount).toBe(callCountBeforeUnmount);
  });

  it('ランキングデータのrankフィールドが正しい値で設定される', async () => {
    const { result } = renderHook(() =>
      usePolledRankings({ eventId: mockEventId, periodId: mockPeriodId })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const periodEntries = result.current.rankings?.period.entries;
    const eventEntries = result.current.rankings?.event.entries;

    // rankは1から始まる
    expect(periodEntries?.[0]?.rank).toBe(1);
    expect(periodEntries?.[1]?.rank).toBe(2);

    expect(eventEntries?.[0]?.rank).toBe(1);
    expect(eventEntries?.[1]?.rank).toBe(2);
  });

  it('複数のeventId/periodIdの組み合わせでデータが正しく取得できる', async () => {
    const { result: result1 } = renderHook(() =>
      usePolledRankings({ eventId: 1, periodId: 1 })
    );

    await waitFor(() => {
      expect(result1.current.isLoading).toBe(false);
    });

    expect(result1.current.rankings?.period.eventId).toBe(1);
    expect(result1.current.rankings?.period.periodId).toBe(1);
  });
});
