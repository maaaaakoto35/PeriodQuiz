'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { checkAdminAuth } from '@/app/_lib/actions/admin/checkAdminAuth';

/**
 * イベントの休憩画像一覧を取得
 *
 * @param eventId - イベントID
 * @returns { success, images?, error? }
 */
export async function getBreakImages(
  eventId: number
): Promise<{
  success: boolean;
  images?: Array<{ id: string; image_url: string; created_at: string }>;
  error?: string;
}> {
  try {
    // 管理者認証チェック
    const authResult = await checkAdminAuth();
    if (!authResult.authenticated) {
      return { success: false, error: '管理者権限がありません' };
    }

    // イベント存在確認
    const supabase = createAdminClient();
    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single();

    if (!event) {
      return { success: false, error: 'イベントが見つかりません' };
    }

    // 休憩画像取得
    const { data: images, error } = await supabase
      .from('event_break_images')
      .select('id, image_url, created_at')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getBreakImages] Database error:', error);
      return { success: false, error: 'データベース取得に失敗しました' };
    }

    return {
      success: true,
      images: images || [],
    };
  } catch (error) {
    console.error('[getBreakImages] Unexpected error:', error);
    return {
      success: false,
      error: '予期しないエラーが発生しました',
    };
  }
}
