'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { checkAdminAuth } from '@/app/_lib/actions/admin/checkAdminAuth';
import { uploadQuizImageSchema } from '../validation';

/**
 * クイズ画像をSupabase Storageにアップロード
 * 
 * @param file - アップロードするファイル
 * @param type - 画像タイプ ("question" | "choice")
 * @param quizId - 編集時のクイズID（任意）
 * @returns { success, imageUrl?, error? }
 */
export async function uploadQuizImage(
  file: File,
  type: 'question' | 'choice',
  quizId?: number | string
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    // 1. 管理者認証チェック
    const authResult = await checkAdminAuth();
    if (!authResult.authenticated) {
      return { success: false, error: '管理者権限がありません' };
    }

    // 2. バリデーション
    const validationResult = uploadQuizImageSchema.safeParse({
      file,
      type,
      quizId,
    });

    if (!validationResult.success) {
      const errorMessages = validationResult.error.flatten().fieldErrors;
      const firstError = Object.values(errorMessages).flat()[0];
      return { success: false, error: firstError || 'バリデーションエラー' };
    }

    // 3. ファイル形式チェック
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.type)) {
      return {
        success: false,
        error: 'サポートされていない画像形式です。(jpg, png, webp, gif)',
      };
    }

    // 4. ファイルをバッファに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. ファイルパスを生成（タイムスタンプで一意性を確保）
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filePath = `${type}s/${quizId || 'temp'}-${timestamp}.${fileExtension}`;

    // 6. Supabase Storage にアップロード
    const supabase = createAdminClient();

    const { error: uploadError } = await supabase.storage
      .from('quiz-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[uploadQuizImage] Upload error:', uploadError);
      return {
        success: false,
        error: 'ファイルのアップロードに失敗しました',
      };
    }

    // 7. 公開URLを取得
    const { data } = supabase.storage
      .from('quiz-images')
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      return {
        success: false,
        error: '画像URLの生成に失敗しました',
      };
    }

    return {
      success: true,
      imageUrl: data.publicUrl,
    };
  } catch (error) {
    console.error('[uploadQuizImage] Unexpected error:', error);
    return {
      success: false,
      error: '予期しないエラーが発生しました',
    };
  }
}
