import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handlePeriodResultTransition } from './handlePeriodResultTransition';
import * as utils from '../utils';
import type { Database } from '@/app/_lib/types/database';

vi.mock('../utils', () => ({
  getNextPeriod: vi.fn(),
}));

describe('handlePeriodResultTransition', () => {
  let mockSupabase: any;
  let mockControl: Database['public']['Tables']['quiz_control']['Row'];

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      from: vi.fn(),
    };

    mockControl = {
      id: 1,
      event_id: 1,
      current_screen: 'period_result',
      current_period_id: 1,
      current_question_id: null,
      question_displayed_at: null,
      question_closed_at: null,
      updated_at: new Date().toISOString(),
    };
  });

  describe('ピリオド結果画面への遷移', () => {
    it('次のピリオドが存在する場合、そのピリオドIDを返す', async () => {
      const nextPeriodId = 2;
      vi.mocked(utils.getNextPeriod).mockResolvedValue(nextPeriodId);

      const result = await handlePeriodResultTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result).toEqual({
        success: true,
        nextPeriodId: 2,
      });
      expect(vi.mocked(utils.getNextPeriod)).toHaveBeenCalledWith(
        mockSupabase,
        1,
        1
      );
    });

    it('次のピリオドが存在しない場合、null を返す（最終結果画面へ遷移）', async () => {
      vi.mocked(utils.getNextPeriod).mockResolvedValue(null);

      const result = await handlePeriodResultTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result).toEqual({
        success: true,
        nextPeriodId: null,
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('current_period_id が null の場合、エラーを返す', async () => {
      mockControl.current_period_id = null;

      const result = await handlePeriodResultTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result).toEqual({
        success: false,
        error: 'ピリオド情報が見つかりません',
      });
      expect(vi.mocked(utils.getNextPeriod)).not.toHaveBeenCalled();
    });

    it('getNextPeriod がエラーを投げた場合、エラーメッセージを返す', async () => {
      const errorMessage = 'ピリオド情報が見つかりません';
      vi.mocked(utils.getNextPeriod).mockRejectedValue(
        new Error(errorMessage)
      );

      const result = await handlePeriodResultTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('ピリオド結果の次ピリオド決定に失敗しました');
        expect(result.error).toContain(errorMessage);
      }
    });

    it('予期しないエラーが発生した場合、グレースフルに処理する', async () => {
      vi.mocked(utils.getNextPeriod).mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await handlePeriodResultTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('ピリオド結果の次ピリオド決定に失敗しました');
        expect(result.error).toContain('Database connection failed');
      }
    });
  });

  describe('複数ピリオド処理', () => {
    it('複数のピリオドがある場合、順序通りに次のピリオドIDを返す', async () => {
      mockControl.current_period_id = 1;
      vi.mocked(utils.getNextPeriod).mockResolvedValue(2);

      const result = await handlePeriodResultTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.nextPeriodId).toBe(2);
      }
    });

    it('異なるイベントIDで正しく処理される', async () => {
      mockControl.event_id = 5;
      vi.mocked(utils.getNextPeriod).mockResolvedValue(3);

      const result = await handlePeriodResultTransition(
        mockSupabase,
        mockControl,
        5
      );

      expect(vi.mocked(utils.getNextPeriod)).toHaveBeenCalledWith(
        mockSupabase,
        1,
        5
      );
      expect(result.success).toBe(true);
    });
  });
});
