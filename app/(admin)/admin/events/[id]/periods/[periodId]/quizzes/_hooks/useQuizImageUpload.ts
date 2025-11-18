'use client';

import { uploadQuizImage } from '@/app/_lib/actions/admin/quizzes';

interface UseQuizImageUploadReturn {
  uploadImage: (
    file: File,
    type: 'question' | 'choice',
    quizId?: number | string
  ) => Promise<string | null>;
}

/**
 * 画像アップロード処理用カスタムフック
 */
export function useQuizImageUpload(): UseQuizImageUploadReturn {
  const uploadImage = async (
    file: File,
    type: 'question' | 'choice',
    quizId?: number | string
  ): Promise<string | null> => {
    try {
      const result = await uploadQuizImage(file, type, quizId);
      if (!result.success) {
        throw new Error(result.error || '画像のアップロードに失敗しました');
      }
      return result.imageUrl || null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('画像のアップロードに失敗しました');
    }
  };

  return {
    uploadImage,
  };
}
