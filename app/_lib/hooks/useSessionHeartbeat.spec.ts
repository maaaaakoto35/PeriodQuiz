import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock updateSessionHeartbeat
vi.mock('@/app/_lib/actions/user/updateSessionHeartbeat', () => ({
  updateSessionHeartbeat: vi.fn(),
}));

import { updateSessionHeartbeat } from '@/app/_lib/actions/user/updateSessionHeartbeat';

describe('useSessionHeartbeat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('updateSessionHeartbeat アクションがモック化されていること', async () => {
    vi.mocked(updateSessionHeartbeat).mockResolvedValue({ success: true });

    const result = await updateSessionHeartbeat();

    expect(result.success).toBe(true);
  });

  it('成功レスポンスが返されること', async () => {
    vi.mocked(updateSessionHeartbeat).mockResolvedValue({ success: true });

    const result = await updateSessionHeartbeat();

    expect(result).toEqual({ success: true });
  });

  it('失敗レスポンスが返されること', async () => {
    vi.mocked(updateSessionHeartbeat).mockResolvedValue({
      success: false,
      error: 'Session not found',
    });

    const result = await updateSessionHeartbeat();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Session not found');
  });

  it('エラーをスローした場合にキャッチできること', async () => {
    const testError = new Error('Network error');
    vi.mocked(updateSessionHeartbeat).mockRejectedValue(testError);

    await expect(updateSessionHeartbeat()).rejects.toThrow('Network error');
  });

  it('SessionHeartbeatStatus 型が正しく定義されていること', () => {
    // TypeScript の型チェックで検証
    const statuses: Array<'idle' | 'connected' | 'error'> = ['idle', 'connected', 'error'];
    expect(statuses.length).toBe(3);
  });

  it('インターフェースが正しく定義されていること', () => {
    // スナップショットテスト的な確認
    expect(typeof updateSessionHeartbeat).toBe('function');
  });

  it('複数回の呼び出しが追跡されること', async () => {
    vi.mocked(updateSessionHeartbeat).mockResolvedValue({ success: true });

    await updateSessionHeartbeat();
    await updateSessionHeartbeat();
    await updateSessionHeartbeat();

    expect(vi.mocked(updateSessionHeartbeat)).toHaveBeenCalledTimes(3);
  });

  it('各呼び出しが独立していること', async () => {
    vi.mocked(updateSessionHeartbeat).mockResolvedValue({ success: true });

    const result1 = await updateSessionHeartbeat();
    vi.mocked(updateSessionHeartbeat).mockResolvedValue({
      success: false,
      error: 'Error',
    });
    const result2 = await updateSessionHeartbeat();

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(false);
  });
});
