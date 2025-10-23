'use client';

import { useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/app/_lib/supabase/client';
import { updateSessionHeartbeat } from '@/app/_lib/actions/user/updateSessionHeartbeat';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * セッションハートビートの状態
 */
export type SessionHeartbeatStatus = 'idle' | 'connected' | 'updating' | 'error';

/**
 * セッションハートビート設定
 */
interface UseSessionHeartbeatOptions {
  eventId: number;
  userId: number;
  enabled?: boolean;
  heartbeatInterval?: number; // ミリ秒（デフォルト: 15秒）
  onStatusChange?: (status: SessionHeartbeatStatus) => void;
  onError?: (error: Error) => void;
}

/**
 * セッションハートビートを管理するカスタムフック
 *
 * 以下の機能を提供：
 * 1. Supabase Realtimeで`quiz_control`テーブルの変更を購読
 * 2. 変更を検知したら Server Action で`users.last_active_at`を更新
 * 3. 定期的に Server Action で`last_active_at`を更新（デフォルト: 15秒ごと）
 *
 * セキュリティ:
 * - クライアント側は Realtime 監視のみを実行
 * - `last_active_at`の更新は Server Action（updateSessionHeartbeat）で実行
 * - セッションIDはサーバー側で検証され、不正な更新は防止される
 *
 * @param options - 設定オプション
 * @returns 無し
 */
export function useSessionHeartbeat(options: UseSessionHeartbeatOptions): void {
  const {
    eventId,
    // userId は未使用（Server Action でセッションIDから特定するため）
    enabled = true,
    heartbeatInterval = 15 * 1000, // 15秒
    onStatusChange,
    onError,
  } = options;

  const channelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const statusRef = useRef<SessionHeartbeatStatus>('idle');

  /**
   * ステータスを更新
   */
  const updateStatus = useCallback((status: SessionHeartbeatStatus) => {
    statusRef.current = status;
    onStatusChange?.(status);
  }, [onStatusChange]);

  /**
   * Server Action で last_active_at を更新
   *
   * セキュリティ上、この操作はサーバー側で実行され、
   * セッションIDの検証を通じて不正なユーザーの更新を防止します
   */
  const updateLastActiveAt = useCallback(async () => {
    if (!enabled) return;

    try {
      updateStatus('updating');
      
      // Server Action で更新（セッションID検証付き）
      const result = await updateSessionHeartbeat();

      if (result.success) {
        updateStatus('connected');
      } else {
        throw new Error(result.error || 'セッション更新に失敗しました');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      updateStatus('error');
      onError?.(err);
      console.error('Session heartbeat update failed:', err);
    }
  }, [enabled, updateStatus, onError]);

  /**
   * Realtimeチャネルを初期化
   */
  const setupRealtimeSubscription = useCallback(async () => {
    if (!enabled) return;

    try {
      updateStatus('idle');
      const supabase = createClient();

      // 前のチャネルをクリーンアップ
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
      }

      // チャネル名: quiz_control:{eventId}
      const channelName = `quiz_control:${eventId}`;
      const channel = supabase.channel(channelName);

      // UPDATE イベントを購読
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quiz_control',
          filter: `event_id=eq.${eventId}`,
        },
        async () => {
          // quiz_control変更を検知したら last_active_at を更新
          await updateLastActiveAt();
        }
      );

      // 購読を開始
      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          updateStatus('connected');
          // 購読成功時に一度 last_active_at を更新
          await updateLastActiveAt();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          updateStatus('error');
        }
      });

      channelRef.current = channel;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      updateStatus('error');
      onError?.(err);
      console.error('Failed to setup realtime subscription:', err);
    }
  }, [eventId, enabled, updateStatus, updateLastActiveAt, onError]);

  /**
   * 定期的なハートビートを設定
   */
  const setupHeartbeatTimer = useCallback(() => {
    if (!enabled) return;

    // 既存のタイマーをクリア
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }

    // heartbeatInterval ごとに last_active_at を更新
    heartbeatTimerRef.current = setInterval(() => {
      updateLastActiveAt();
    }, heartbeatInterval);
  }, [enabled, heartbeatInterval, updateLastActiveAt]);

  /**
   * クリーンアップ
   */
  const cleanup = useCallback(async () => {
    // タイマーをクリア
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }

    // チャネルをクリア
    if (channelRef.current) {
      const supabase = createClient();
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    updateStatus('idle');
  }, [updateStatus]);

  /**
   * ライフサイクル管理
   */
  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    // Realtime購読を開始
    setupRealtimeSubscription();

    // 定期ハートビートを開始
    setupHeartbeatTimer();

    return () => {
      cleanup();
    };
  }, [enabled, setupRealtimeSubscription, setupHeartbeatTimer, cleanup]);
}
