'use client';

import { useState, useCallback } from 'react';
import {
  getBreakImages,
  uploadBreakImage,
  deleteBreakImage,
} from '@/app/_lib/actions/admin/events';

interface BreakImage {
  id: string;
  image_url: string;
  created_at: string;
}

interface UseBreakImagesReturn {
  images: BreakImage[];
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  fetchImages: () => Promise<void>;
  handleUpload: (file: File) => Promise<void>;
  handleDelete: (imageId: string) => Promise<void>;
}

/**
 * 休憩画像管理用カスタムフック
 */
export function useBreakImages(eventId: number): UseBreakImagesReturn {
  const [images, setImages] = useState<BreakImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getBreakImages(eventId);
      if (result.success && result.images) {
        setImages(result.images);
      } else {
        setError(result.error || '画像の読み込みに失敗しました');
      }
    } catch (err) {
      setError('予期しないエラーが発生しました');
      console.error('[useBreakImages] fetchImages error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);
      try {
        const result = await uploadBreakImage(eventId, file);
        if (result.success) {
          // 画像を再取得
          await fetchImages();
        } else {
          setError(result.error || 'アップロードに失敗しました');
        }
      } catch (err) {
        setError('予期しないエラーが発生しました');
        console.error('[useBreakImages] handleUpload error:', err);
      } finally {
        setIsUploading(false);
      }
    },
    [eventId, fetchImages]
  );

  const handleDelete = useCallback(
    async (imageId: string) => {
      setError(null);
      try {
        const result = await deleteBreakImage(imageId);
        if (result.success) {
          // 画像を再取得
          await fetchImages();
        } else {
          setError(result.error || '削除に失敗しました');
        }
      } catch (err) {
        setError('予期しないエラーが発生しました');
        console.error('[useBreakImages] handleDelete error:', err);
      }
    },
    [fetchImages]
  );

  return {
    images,
    isLoading,
    isUploading,
    error,
    fetchImages,
    handleUpload,
    handleDelete,
  };
}
