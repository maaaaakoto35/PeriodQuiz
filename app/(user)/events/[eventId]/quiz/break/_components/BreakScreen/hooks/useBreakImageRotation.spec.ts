import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBreakImageRotation } from './useBreakImageRotation';

interface BreakImage {
  id: string;
  image_url: string;
}

describe('useBreakImageRotation', () => {
  const mockImages: BreakImage[] = [
    { id: '1', image_url: 'https://example.com/image1.jpg' },
    { id: '2', image_url: 'https://example.com/image2.jpg' },
    { id: '3', image_url: 'https://example.com/image3.jpg' },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('初期状態で最初の画像を表示する', () => {
    const { result } = renderHook(() => useBreakImageRotation(mockImages));

    expect(result.current.currentImage).toBeDefined();
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.totalImages).toBe(3);
  });

  it('画像がない場合はnullを返す', () => {
    const { result } = renderHook(() => useBreakImageRotation([]));

    expect(result.current.currentImage).toBeNull();
    expect(result.current.totalImages).toBe(0);
  });

  it('5秒ごとに画像が自動回転する', async () => {
    const { result } = renderHook(() => useBreakImageRotation(mockImages));

    const initialIndex = result.current.currentIndex;

    // 5秒進める
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.currentIndex).not.toBe(initialIndex);
  });

  it('goToSlideで指定のスライドへ遷移できる', () => {
    const { result } = renderHook(() => useBreakImageRotation(mockImages));

    act(() => {
      result.current.goToSlide(2);
    });

    expect(result.current.currentIndex).toBe(2);
  });

  it('goToSlide後、2秒経過で自動回転が再開される', async () => {
    const { result } = renderHook(() => useBreakImageRotation(mockImages));

    const indexAfterGoToSlide = 2;

    act(() => {
      result.current.goToSlide(indexAfterGoToSlide);
    });

    expect(result.current.currentIndex).toBe(indexAfterGoToSlide);

    // 2秒経過
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // さらに5秒経過（合計7秒）
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.currentIndex).not.toBe(indexAfterGoToSlide);
  });

  it('無効なインデックスへの遷移は無視される', () => {
    const { result } = renderHook(() => useBreakImageRotation(mockImages));

    const initialIndex = result.current.currentIndex;

    act(() => {
      result.current.goToSlide(-1);
    });

    expect(result.current.currentIndex).toBe(initialIndex);

    act(() => {
      result.current.goToSlide(999);
    });

    expect(result.current.currentIndex).toBe(initialIndex);
  });

  it('複数回のgoToSlideが正しく機能する', () => {
    const { result } = renderHook(() => useBreakImageRotation(mockImages));

    act(() => {
      result.current.goToSlide(1);
    });
    expect(result.current.currentIndex).toBe(1);

    act(() => {
      result.current.goToSlide(2);
    });
    expect(result.current.currentIndex).toBe(2);

    act(() => {
      result.current.goToSlide(0);
    });
    expect(result.current.currentIndex).toBe(0);
  });

  it('画像配列が変更されるとシャッフルされる', () => {
    const { result, rerender } = renderHook(
      ({ images }: { images: BreakImage[] }) => useBreakImageRotation(images),
      { initialProps: { images: mockImages } }
    );

    const newImages: BreakImage[] = [
      { id: '4', image_url: 'https://example.com/image4.jpg' },
      { id: '5', image_url: 'https://example.com/image5.jpg' },
    ];

    act(() => {
      rerender({ images: newImages });
    });

    expect(result.current.totalImages).toBe(2);
    expect(result.current.currentIndex).toBe(0);
  });

  it('1つだけ画像がある場合、インデックスは変わらない', () => {
    const singleImage: BreakImage[] = [
      { id: '1', image_url: 'https://example.com/image1.jpg' },
    ];

    const { result } = renderHook(() => useBreakImageRotation(singleImage));

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.totalImages).toBe(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // 1つだけなので同じインデックスのままになる
    expect(result.current.currentIndex).toBe(0);
  });

  it('クリーンアップ時にタイマーがクリアされる', () => {
    const { unmount } = renderHook(() => useBreakImageRotation(mockImages));

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
  });
});
