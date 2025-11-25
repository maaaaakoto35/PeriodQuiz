'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { checkAdminAuth } from '@/app/_lib/actions/admin/checkAdminAuth';

const MAX_BREAK_IMAGES = 10;

/**
 * 休憩画像をアップロード
 *
 * @param eventId - イベントID
 * @param file - アップロードするファイル
 * @returns { success, imageId?, imageUrl?, error? }
 */
export async function uploadBreakImage(
  eventId: number,
  file: File
): Promise<{
  success: boolean;
  imageId?: string;
  imageUrl?: string;
  error?: string;
}> {
  try {
    // 1. 管理者認証チェック
    const authResult = await checkAdminAuth();
    if (!authResult.authenticated) {
      return { success: false, error: '管理者権限がありません' };
    }

    // 2. ファイル形式チェック
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.type)) {
      return {
        success: false,
        error: '対応していない画像形式です。PNG、JPEG、WebP、GIF をアップロードしてください。',
      };
    }

    // 3. ファイルサイズチェック（4MB以下）
    const MAX_FILE_SIZE = 4 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `ファイルサイズが大きすぎます。4MB 以下のファイルをアップロードしてください。（現在: ${(file.size / 1024 / 1024).toFixed(2)}MB）`,
      };
    }

    const supabase = createAdminClient();

    // 4. イベント存在確認
    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single();

    if (!event) {
      return { success: false, error: 'イベントが見つかりません' };
    }

    // 5. 既存画像数をチェック
    const { count, error: countError } = await supabase
      .from('event_break_images')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    if (countError) {
      console.error('[uploadBreakImage] Count error:', countError);
      return { success: false, error: 'データベース確認に失敗しました' };
    }

    if ((count || 0) >= MAX_BREAK_IMAGES) {
      return {
        success: false,
        error: `休憩画像は最大 ${MAX_BREAK_IMAGES} 枚までアップロード可能です。既にアップロード済みの画像を削除してからお試しください。`,
      };
    }

    // 6. ファイルをバッファに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 7. ファイルパスを生成
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filePath = `break-images/${eventId}/${timestamp}.${fileExtension}`;

    // 8. Supabase Storage にアップロード
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[uploadBreakImage] Upload error:', uploadError);
      return {
        success: false,
        error: 'ファイルのアップロードに失敗しました。別の形式またはファイルサイズで再度お試しください。',
      };
    }

    // 9. 公開URLを取得
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: '画像URLの生成に失敗しました。管理者に連絡してください。',
      };
    }

    // 10. データベースに記録
    const { data: inserted, error: insertError } = await supabase
      .from('event_break_images')
      .insert({
        event_id: eventId,
        image_url: urlData.publicUrl,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[uploadBreakImage] Insert error:', insertError);
      return {
        success: false,
        error: 'データベースへの保存に失敗しました。管理者に連絡してください。',
      };
    }

    return {
      success: true,
      imageId: inserted?.id,
      imageUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error('[uploadBreakImage] Unexpected error:', error);
    return {
      success: false,
      error: '予期しないエラーが発生しました。時間をおいて再度お試しください。',
    };
  }
}
