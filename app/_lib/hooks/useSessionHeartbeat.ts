'use client';

import { useEffect, useCallback, useRef } from 'react';
import { updateSessionHeartbeat } from '@/app/_lib/actions/user/updateSessionHeartbeat';

/**
 * セッションハートビートの状態
 */
export type SessionHeartbeatStatus = 'idle' | 'connected' | 'error';

/**
 * セッションハートビート設定
 */
interface UseSessionHeartbeatOptions {
  enabled?: boolean;
  heartbeatInterval?: number; // ミリ秒（デフォルト: 15秒）
  onStatusChange?: (status: SessionHeartbeatStatus) => void;
  onError?: (error: Error) => void;
}

/**
 * セッションハートビートを管理するカスタムフック
 *
 * 以下の機能を提供：
 * - 定期的に Server Action で`users.last_active_at`を更新（デフォルト: 15秒ごと）
 *
 * セキュリティ:
 * - `last_active_at`の更新は Server Action（updateSessionHeartbeat）で実行
 * - セッションIDはサーバー側で検証され、不正な更新は防止される
 *
 * @param options - 設定オプション
 * @returns 無し
 */
export function useSessionHeartbeat(options: UseSessionHeartbeatOptions): void {
  const {
    enabled = true,
    heartbeatInterval = 15 * 1000, // 15秒
    onStatusChange,
    onError,
  } = options;

  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * ステータスを更新
   */
  const updateStatus = useCallback((status: SessionHeartbeatStatus) => {
    onStatusChange?.(status);
  }, [onStatusChange]);

  /**
   * Server Action で last_active_at を更新
   *
   * セキュリティ上、この操作はサーバー側で実行され、
   * セッションIDの検証を通じて不正なユーザーの更新は防止されます
   */
  const updateLastActiveAt = useCallback(async () => {
    if (!enabled) return;

    try {
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
   * 定期的なハートビートを設定
   */
  const setupHeartbeatTimer = useCallback(() => {
    if (!enabled) return;

    // 既存のタイマーをクリア
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }

    // 初回更新
    updateLastActiveAt();

    // heartbeatInterval ごとに last_active_at を更新
    heartbeatTimerRef.current = setInterval(() => {
      updateLastActiveAt();
    }, heartbeatInterval);
  }, [enabled, heartbeatInterval, updateLastActiveAt]);

  /**
   * クリーンアップ
   */
  const cleanup = useCallback(() => {
    // タイマーをクリア
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  /**
   * ライフサイクル管理
   */
  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    setupHeartbeatTimer();

    return () => {
      cleanup();
    };
  }, [enabled, setupHeartbeatTimer, cleanup]);
}
