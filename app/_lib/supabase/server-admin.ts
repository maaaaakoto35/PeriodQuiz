import { createClient } from '@supabase/supabase-js';
import { Database } from '@/app/_lib/types/database';

/**
 * Admin 用 Supabase クライアント（Service Role Key 使用）
 *
 * 注意: Service Role Key は秘密鍵であり、API Routes（サーバー環境）でのみ使用すること
 *
 * 用途:
 * - Admin 操作の実行（イベント作成、問題管理など）
 * - Cookie から取得したセッション ID の検証
 *
 * @returns Service Role Key で認証された Supabase クライアント
 *
 * @example
 * // API Route で使用
 * const supabase = createAdminClient();
 * const { data } = await supabase.from('events').insert({ ... });
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Admin セッション検証（Service Role Key 使用）
 *
 * @param sessionId - Cookie から取得したセッション ID
 * @returns セッションが有効な場合は true
 */
export async function verifyAdminSessionId(sessionId: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('admin_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .gte('expires_at', new Date().toISOString())
      .gt('last_active_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (error) {
      console.error('[verifyAdminSessionId] Query error:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('[verifyAdminSessionId] Error:', error);
    return false;
  }
}

/**
 * Admin セッションのハートビート更新（Service Role Key 使用）
 *
 * @param sessionId - Cookie から取得したセッション ID
 * @returns 更新成功時は true
 */
export async function updateAdminSessionHeartbeat(sessionId: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('admin_sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('session_id', sessionId);

    if (error) {
      console.error('[updateAdminSessionHeartbeat] Error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[updateAdminSessionHeartbeat] Error:', error);
    return false;
  }
}
