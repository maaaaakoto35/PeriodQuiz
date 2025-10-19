import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock Server Actions - BEFORE importing useNicknameForm
vi.mock('@/app/_lib/actions/user', () => ({
  checkNicknameAvailability: vi.fn(),
}));

import { checkNicknameAvailability } from '@/app/_lib/actions/user';
import { useNicknameForm } from './useNicknameForm';

describe('useNicknameForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useNicknameForm({ eventId: 1 }));

    expect(result.current.nickname).toBe('');
    expect(result.current.error).toBe('');
    expect(result.current.isChecking).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isValid).toBe(false);
  });

  it('入力値が更新される', () => {
    const { result } = renderHook(() => useNicknameForm({ eventId: 1 }));

    act(() => {
      result.current.handleChange({
        target: { value: 'テスト' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.nickname).toBe('テスト');
  });

  it('入力時にエラーがクリアされる', () => {
    const { result } = renderHook(() => useNicknameForm({ eventId: 1 }));

    // 最初に無効な入力
    act(() => {
      result.current.handleChange({
        target: { value: '@' },
      } as React.ChangeEvent<HTMLInputElement>);
      vi.advanceTimersByTime(500);
    });

    expect(result.current.error).toBeTruthy();

    // 入力を変更
    act(() => {
      result.current.handleChange({
        target: { value: 'テスト太郎' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    // エラーがクリアされる
    expect(result.current.error).toBe('');
  });

  it('クライアント側バリデーションエラーが表示される', () => {
    const { result } = renderHook(() => useNicknameForm({ eventId: 1 }));

    act(() => {
      result.current.handleChange({
        target: { value: 'テスト@太郎' },
      } as React.ChangeEvent<HTMLInputElement>);
      vi.advanceTimersByTime(500);
    });

    expect(result.current.error).toBe('英数字、ひらがな、カタカナ、漢字のみ使用できます');
    expect(vi.mocked(checkNicknameAvailability)).not.toHaveBeenCalled();
  });

  it('複数回の入力変更は最後のものだけチェックされる', () => {
    vi.mocked(checkNicknameAvailability).mockResolvedValue({
      available: true,
    });

    const { result } = renderHook(() => useNicknameForm({ eventId: 1 }));

    act(() => {
      result.current.handleChange({
        target: { value: 't' },
      } as React.ChangeEvent<HTMLInputElement>);
      vi.advanceTimersByTime(100);

      result.current.handleChange({
        target: { value: 'te' },
      } as React.ChangeEvent<HTMLInputElement>);
      vi.advanceTimersByTime(100);

      result.current.handleChange({
        target: { value: 'test' },
      } as React.ChangeEvent<HTMLInputElement>);
      vi.advanceTimersByTime(500);
    });

    // 最後の入力「test」だけがチェックされる
    expect(vi.mocked(checkNicknameAvailability)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(checkNicknameAvailability)).toHaveBeenCalledWith(1, 'test');
  });

  it('空入力でチェックが実行されない', () => {
    const { result } = renderHook(() => useNicknameForm({ eventId: 1 }));

    act(() => {
      result.current.handleChange({
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>);
      vi.advanceTimersByTime(500);
    });

    expect(vi.mocked(checkNicknameAvailability)).not.toHaveBeenCalled();
    expect(result.current.isChecking).toBe(false);
  });
});
