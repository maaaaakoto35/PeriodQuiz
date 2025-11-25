import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBreakImages } from './useBreakImages';
import * as breakImagesActions from '@/app/_lib/actions/admin/events';

vi.mock('@/app/_lib/actions/admin/events', () => ({
  getBreakImages: vi.fn(),
  uploadBreakImage: vi.fn(),
  deleteBreakImage: vi.fn(),
}));

describe('useBreakImages', () => {
  const eventId = 1;
  const mockImages = [
    {
      id: '1',
      image_url: 'https://example.com/image1.jpg',
      created_at: '2025-01-01T00:00:00Z',
    },
    {
      id: '2',
      image_url: 'https://example.com/image2.jpg',
      created_at: '2025-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchImages', () => {
    it('正常に画像一覧を取得できる', async () => {
      vi.mocked(breakImagesActions.getBreakImages).mockResolvedValue({
        success: true,
        images: mockImages,
      });

      const { result } = renderHook(() => useBreakImages(eventId));

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.fetchImages();
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.images).toEqual(mockImages);
        expect(result.current.error).toBeNull();
      });
    });

    it('取得失敗時にエラーメッセージを設定する', async () => {
      vi.mocked(breakImagesActions.getBreakImages).mockResolvedValue({
        success: false,
        error: 'データベース取得に失敗しました',
      });

      const { result } = renderHook(() => useBreakImages(eventId));

      act(() => {
        result.current.fetchImages();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('データベース取得に失敗しました');
        expect(result.current.images).toEqual([]);
      });
    });

    it('予期しないエラーをハンドルする', async () => {
      vi.mocked(breakImagesActions.getBreakImages).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useBreakImages(eventId));

      act(() => {
        result.current.fetchImages();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('予期しないエラーが発生しました');
      });
    });
  });

  describe('handleUpload', () => {
    it('ファイルアップロード成功時に画像一覧を再取得する', async () => {
      vi.mocked(breakImagesActions.uploadBreakImage).mockResolvedValue({
        success: true,
        imageId: '3',
        imageUrl: 'https://example.com/image3.jpg',
      });

      vi.mocked(breakImagesActions.getBreakImages).mockResolvedValue({
        success: true,
        images: [...mockImages, { id: '3', image_url: 'https://example.com/image3.jpg', created_at: '2025-01-03T00:00:00Z' }],
      });

      const { result } = renderHook(() => useBreakImages(eventId));

      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });

      act(() => {
        result.current.handleUpload(mockFile);
      });

      expect(result.current.isUploading).toBe(true);

      await waitFor(() => {
        expect(result.current.isUploading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(breakImagesActions.uploadBreakImage).toHaveBeenCalledWith(eventId, mockFile);
        expect(breakImagesActions.getBreakImages).toHaveBeenCalledWith(eventId);
      });
    });

    it('アップロード失敗時にエラーメッセージを設定する', async () => {
      vi.mocked(breakImagesActions.uploadBreakImage).mockResolvedValue({
        success: false,
        error: 'ファイルサイズが大きすぎます',
      });

      const { result } = renderHook(() => useBreakImages(eventId));

      const mockFile = new File([''], 'large.jpg', { type: 'image/jpeg' });

      act(() => {
        result.current.handleUpload(mockFile);
      });

      await waitFor(() => {
        expect(result.current.isUploading).toBe(false);
        expect(result.current.error).toBe('ファイルサイズが大きすぎます');
      });
    });

    it('予期しないエラーをハンドルする', async () => {
      vi.mocked(breakImagesActions.uploadBreakImage).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useBreakImages(eventId));

      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });

      act(() => {
        result.current.handleUpload(mockFile);
      });

      await waitFor(() => {
        expect(result.current.isUploading).toBe(false);
        expect(result.current.error).toBe('予期しないエラーが発生しました');
      });
    });
  });

  describe('handleDelete', () => {
    it('画像削除成功時に画像一覧を再取得する', async () => {
      vi.mocked(breakImagesActions.deleteBreakImage).mockResolvedValue({
        success: true,
      });

      vi.mocked(breakImagesActions.getBreakImages).mockResolvedValue({
        success: true,
        images: [mockImages[1]],
      });

      const { result } = renderHook(() => useBreakImages(eventId));

      act(() => {
        result.current.handleDelete('1');
      });

      await waitFor(() => {
        expect(breakImagesActions.deleteBreakImage).toHaveBeenCalledWith('1');
        expect(breakImagesActions.getBreakImages).toHaveBeenCalledWith(eventId);
        expect(result.current.error).toBeNull();
      });
    });

    it('削除失敗時にエラーメッセージを設定する', async () => {
      vi.mocked(breakImagesActions.deleteBreakImage).mockResolvedValue({
        success: false,
        error: '画像が見つかりません',
      });

      const { result } = renderHook(() => useBreakImages(eventId));

      act(() => {
        result.current.handleDelete('999');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('画像が見つかりません');
      });
    });

    it('予期しないエラーをハンドルする', async () => {
      vi.mocked(breakImagesActions.deleteBreakImage).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useBreakImages(eventId));

      act(() => {
        result.current.handleDelete('1');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('予期しないエラーが発生しました');
      });
    });
  });

  describe('状態管理', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useBreakImages(eventId));

      expect(result.current.images).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isUploading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('複数の操作が正しく順序で実行される', async () => {
      vi.mocked(breakImagesActions.getBreakImages)
        .mockResolvedValueOnce({
          success: true,
          images: mockImages,
        })
        .mockResolvedValueOnce({
          success: true,
          images: [...mockImages, { id: '3', image_url: 'https://example.com/image3.jpg', created_at: '2025-01-03T00:00:00Z' }],
        });

      vi.mocked(breakImagesActions.uploadBreakImage).mockResolvedValue({
        success: true,
        imageId: '3',
        imageUrl: 'https://example.com/image3.jpg',
      });

      const { result } = renderHook(() => useBreakImages(eventId));

      // 最初に画像を取得
      act(() => {
        result.current.fetchImages();
      });

      await waitFor(() => {
        expect(result.current.images).toHaveLength(2);
      });

      // その後、新しい画像をアップロード
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });

      act(() => {
        result.current.handleUpload(mockFile);
      });

      await waitFor(() => {
        expect(result.current.images).toHaveLength(3);
      });
    });
  });
});
