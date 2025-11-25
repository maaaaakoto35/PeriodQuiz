'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { checkAdminAuth } from '@/app/_lib/actions/admin/checkAdminAuth';

/**
 * 休憩画像を削除
 *
 * @param imageId - 画像ID
 * @returns { success, error? }
 */
export async function deleteBreakImage(
  imageId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // 1. 管理者認証チェック
    const authResult = await checkAdminAuth();
    if (!authResult.authenticated) {
      return { success: false, error: '管理者権限がありません' };
    }

    const supabase = createAdminClient();

    // 2. 画像情報を取得
    const { data: image, error: selectError } = await supabase
      .from('event_break_images')
      .select('id, image_url')
      .eq('id', imageId)
      .single();

    if (selectError || !image) {
      console.error('[deleteBreakImage] Select error:', selectError);
      return { success: false, error: '画像が見つかりません' };
    }

    // 3. Storage から削除
    // image_url から filePath を抽出: https://bucket.supabase.co/storage/v1/object/public/images/...
    const urlParts = image.image_url.split('/images/');
    if (urlParts.length < 2) {
      return { success: false, error: 'ファイルパスの抽出に失敗しました' };
    }
    const filePath = urlParts[1];

    const { error: deleteStorageError } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (deleteStorageError) {
      console.error('[deleteBreakImage] Storage delete error:', deleteStorageError);
      return { success: false, error: 'ファイル削除に失敗しました' };
    }

    // 4. データベースから削除
    const { error: deleteDbError } = await supabase
      .from('event_break_images')
      .delete()
      .eq('id', imageId);

    if (deleteDbError) {
      console.error('[deleteBreakImage] DB delete error:', deleteDbError);
      return { success: false, error: 'データベース削除に失敗しました' };
    }

    return { success: true };
  } catch (error) {
    console.error('[deleteBreakImage] Unexpected error:', error);
    return {
      success: false,
      error: '予期しないエラーが発生しました',
    };
  }
}
