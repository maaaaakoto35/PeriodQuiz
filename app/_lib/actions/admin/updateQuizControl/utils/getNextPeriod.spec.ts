import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNextPeriod } from './getNextPeriod';

describe('getNextPeriod', () => {
  let mockSupabase: any;

  beforeEach(() => {
    // Supabaseクライアントのモック構造を作成
    mockSupabase = {
      from: vi.fn(),
    };
  });

  it('次のピリオドが存在する場合、そのピリオドIDを返す', async () => {
    // 現在のピリオド情報取得用のモック
    const currentPeriodQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { order_num: 1 },
        error: null,
      }),
    };

    // 次のピリオド取得用のモック
    const nextPeriodQuery = {
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: 2 },
        error: null,
      }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'periods') {
        return {
          select: vi.fn().mockImplementation((columns: string) => {
            if (columns === 'order_num') {
              return currentPeriodQuery;
            }
            return nextPeriodQuery;
          }),
        };
      }
    });

    const result = await getNextPeriod(mockSupabase, 1, 100);

    expect(result).toBe(2);
    expect(mockSupabase.from).toHaveBeenCalledWith('periods');
  });

  it('現在のピリオドが見つからない場合、エラーをスロー', async () => {
    const currentPeriodQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Record not found'),
      }),
    };

    mockSupabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue(currentPeriodQuery),
    }));

    await expect(getNextPeriod(mockSupabase, 1, 100)).rejects.toThrow(
      'ピリオド情報が見つかりません'
    );
  });

  it('次のピリオドが存在しない場合、nullを返す', async () => {
    // 現在のピリオド情報取得用のモック
    const currentPeriodQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { order_num: 3 },
        error: null,
      }),
    };

    // 次のピリオド取得用のモック（データなし）
    const nextPeriodQuery = {
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'periods') {
        return {
          select: vi.fn().mockImplementation((columns: string) => {
            if (columns === 'order_num') {
              return currentPeriodQuery;
            }
            return nextPeriodQuery;
          }),
        };
      }
    });

    const result = await getNextPeriod(mockSupabase, 3, 100);

    expect(result).toBeNull();
  });

  it('次のピリオド取得時にエラーが発生した場合、エラーをスロー', async () => {
    // 現在のピリオド情報取得用のモック
    const currentPeriodQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { order_num: 1 },
        error: null,
      }),
    };

    // 次のピリオド取得用のモック（エラー発生）
    const nextPeriodQuery = {
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'periods') {
        return {
          select: vi.fn().mockImplementation((columns: string) => {
            if (columns === 'order_num') {
              return currentPeriodQuery;
            }
            return nextPeriodQuery;
          }),
        };
      }
    });

    await expect(getNextPeriod(mockSupabase, 1, 100)).rejects.toThrow(
      'ピリオド情報の取得に失敗しました'
    );
  });

  it('正しいパラメータでSupabaseクエリが実行されている', async () => {
    const currentPeriodQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { order_num: 2 },
        error: null,
      }),
    };

    const nextPeriodQuery = {
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: 5 },
        error: null,
      }),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'periods') {
        return {
          select: vi.fn().mockImplementation((columns: string) => {
            if (columns === 'order_num') {
              return currentPeriodQuery;
            }
            return nextPeriodQuery;
          }),
        };
      }
    });

    await getNextPeriod(mockSupabase, 4, 200);

    // 現在のピリオド取得時の呼び出し確認
    expect(currentPeriodQuery.eq).toHaveBeenCalledWith('id', 4);

    // 次のピリオド取得時の呼び出し確認
    expect(nextPeriodQuery.eq).toHaveBeenCalledWith('event_id', 200);
    expect(nextPeriodQuery.gt).toHaveBeenCalledWith('order_num', 2);
    expect(nextPeriodQuery.order).toHaveBeenCalledWith('order_num', {
      ascending: true,
    });
    expect(nextPeriodQuery.limit).toHaveBeenCalledWith(1);
  });
});
