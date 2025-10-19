import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedCallback } from './useDebouncedCallback';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('指定された遅延時間後にコールバックを実行する', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockCallback, 500));

    act(() => {
      result.current('arg1');
    });

    // 遅延時間前では実行されない
    expect(mockCallback).not.toHaveBeenCalled();

    // 遅延時間後に実行される
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockCallback).toHaveBeenCalledWith('arg1');
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('複数回呼ばれた場合、最後の呼び出しだけ実行される', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockCallback, 500));

    act(() => {
      result.current('arg1');
      vi.advanceTimersByTime(200);
      result.current('arg2');
      vi.advanceTimersByTime(200);
      result.current('arg3');
      vi.advanceTimersByTime(500);
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith('arg3');
  });

  it('複数の引数をサポートしている', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockCallback, 300));

    act(() => {
      result.current('arg1', 'arg2', 123);
      vi.advanceTimersByTime(300);
    });

    expect(mockCallback).toHaveBeenCalledWith('arg1', 'arg2', 123);
  });

  it('前のタイマーをキャンセルして新しいタイマーを設定する', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockCallback, 500));

    act(() => {
      result.current('arg1');
      vi.advanceTimersByTime(200);
      result.current('arg2');
      vi.advanceTimersByTime(500);
    });

    // 最後の呼び出しだけ実行される
    expect(mockCallback).toHaveBeenCalledWith('arg2');
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('遅延時間が短い場合の動作', () => {
    const mockCallback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockCallback, 100));

    act(() => {
      result.current('arg');
      vi.advanceTimersByTime(100);
    });

    expect(mockCallback).toHaveBeenCalled();
  });
});
