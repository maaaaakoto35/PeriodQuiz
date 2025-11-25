'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface BreakImage {
  id: string;
  image_url: string;
}

/**
 * 5秒ごとに休憩画像を切り替えるフック
 * - 前後のボタンやインジケータでのマニュアル操作に対応
 * - ユーザー操作後、一定時間経過後に自動回転を再開
 */
export function useBreakImageRotation(images: BreakImage[]) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [shuffledImages, setShuffledImages] = useState<BreakImage[]>(images);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const userActionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 画像をシャッフル
  useEffect(() => {
    if (images.length === 0) return;

    const shuffled = [...images].sort(() => Math.random() - 0.5);
    setShuffledImages(shuffled);
    setCurrentImageIndex(0);
  }, [images]);

  // 自動回転の開始
  const startAutoRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % shuffledImages.length);
    }, 5000);
  }, [shuffledImages.length]);

  // 自動回転の停止（ユーザー操作時）
  const stopAutoRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 2秒後に自動回転を再開
    if (userActionTimeoutRef.current) {
      clearTimeout(userActionTimeoutRef.current);
    }

    userActionTimeoutRef.current = setTimeout(() => {
      startAutoRotation();
    }, 2000);
  }, [startAutoRotation]);

  // 初期化と自動回転の開始
  useEffect(() => {
    if (shuffledImages.length === 0) return;

    startAutoRotation();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (userActionTimeoutRef.current) {
        clearTimeout(userActionTimeoutRef.current);
      }
    };
  }, [shuffledImages.length, startAutoRotation]);

  // 指定のスライドへ
  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < shuffledImages.length) {
        setCurrentImageIndex(index);
        stopAutoRotation();
      }
    },
    [shuffledImages.length, stopAutoRotation]
  );

  const currentImage = shuffledImages[currentImageIndex] || null;

  return {
    currentImage,
    currentIndex: currentImageIndex,
    totalImages: shuffledImages.length,
    goToSlide,
  };
}
