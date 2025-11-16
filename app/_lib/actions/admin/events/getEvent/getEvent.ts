'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { checkAdminAuth } from '../../checkAdminAuth';

export type EventRecord = {
  id: number;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  allow_registration: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * 単一のイベントを取得
 */
export async function getEvent(eventId: unknown): Promise<{
  success: boolean;
  data?: EventRecord;
  error?: string;
}> {
  try {
    // 管理者認証チェック
    const authCheck = await checkAdminAuth();
    if (!authCheck.authenticated) {
      return {
        success: false,
        error: '認証が必要です',
      };
    }

    const id = Number(eventId);
    if (isNaN(id)) {
      return {
        success: false,
        error: '無効なイベントIDです',
      };
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          error: 'イベントが見つかりません',
        };
      }
      console.error('[getEvent] Supabase error:', error);
      return {
        success: false,
        error: 'イベント取得に失敗しました',
      };
    }

    return {
      success: true,
      data: data as EventRecord,
    };
  } catch (error) {
    console.error('[getEvent] Error:', error);
    return {
      success: false,
      error: 'イベント取得中にエラーが発生しました',
    };
  }
}

/**
 * イベント一覧を取得
 */
export async function getEvents(): Promise<{
  success: boolean;
  data?: EventRecord[];
  error?: string;
}> {
  try {
    // 管理者認証チェック
    const authCheck = await checkAdminAuth();
    if (!authCheck.authenticated) {
      return {
        success: false,
        error: '認証が必要です',
      };
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getEvents] Supabase error:', error);
      return {
        success: false,
        error: 'イベント一覧取得に失敗しました',
      };
    }

    return {
      success: true,
      data: (data || []) as EventRecord[],
    };
  } catch (error) {
    console.error('[getEvents] Error:', error);
    return {
      success: false,
      error: 'イベント一覧取得中にエラーが発生しました',
    };
  }
}
