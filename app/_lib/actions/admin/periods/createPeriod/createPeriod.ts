'use server';

import { createAdminClient } from '@/app/_lib/supabase/server-admin';
import { createPeriodSchema } from '../validation';
import { checkAdminAuth } from '../../checkAdminAuth';
import type { PeriodRecord } from '../getPeriods';

/**
 * ピリオド作成
 * @param input ピリオド作成情報
 * @returns 作成されたピリオド情報
 */
export async function createPeriod(input: unknown): Promise<{
  success: boolean;
  data?: PeriodRecord;
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

    // バリデーション
    const validatedInput = createPeriodSchema.parse(input);

    // Supabase クライアント取得
    const supabase = createAdminClient();

    // 最大の order_num を取得
    const { data: maxOrderData, error: maxOrderError } = await supabase
      .from('periods')
      .select('order_num')
      .eq('event_id', validatedInput.eventId)
      .order('order_num', { ascending: false })
      .limit(1)
      .single();

    if (maxOrderError && maxOrderError.code !== 'PGRST116') {
      console.error('[createPeriod] Get max order error:', maxOrderError);
      return {
        success: false,
        error: 'ピリオド作成に失敗しました',
      };
    }

    const nextOrderNum = (maxOrderData?.order_num ?? 0) + 1;

    // ピリオド作成
    const { data, error } = await supabase
      .from('periods')
      .insert({
        event_id: validatedInput.eventId,
        name: validatedInput.name,
        order_num: nextOrderNum,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error) {
      console.error('[createPeriod] Supabase error:', error);
      return {
        success: false,
        error: 'ピリオド作成に失敗しました',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[createPeriod] Error:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'ピリオド作成中にエラーが発生しました',
    };
  }
}
