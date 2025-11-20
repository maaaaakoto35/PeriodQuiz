import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleQuestionTransition } from './handleQuestionTransition';
import * as utils from '../utils';
import type { Database } from '@/app/_lib/types/database';

vi.mock('../utils', () => ({
  getNextQuestion: vi.fn(),
  createQuestionDisplay: vi.fn(),
}));

describe('handleQuestionTransition', () => {
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
      current_screen: 'waiting',
      current_period_id: null,
      current_question_id: null,
      question_displayed_at: null,
      question_closed_at: null,
      updated_at: new Date().toISOString(),
    };
  });

  describe('待機状態（waiting）からの遷移', () => {
    it('待機状態から第1ピリオドの第1問を取得できる', async () => {
      const firstPeriodQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 1 },
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(firstPeriodQuery);

      vi.mocked(utils.getNextQuestion).mockResolvedValue(10);
      vi.mocked(utils.createQuestionDisplay).mockResolvedValue(undefined);

      const result = await handleQuestionTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result).toEqual({
        success: true,
        currentPeriodId: 1,
        currentQuestionId: 10,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('periods');
      expect(firstPeriodQuery.select).toHaveBeenCalledWith('id');
      expect(firstPeriodQuery.eq).toHaveBeenCalledWith('event_id', 1);
      expect(firstPeriodQuery.order).toHaveBeenCalledWith('order_num', {
        ascending: true,
      });
      expect(vi.mocked(utils.createQuestionDisplay)).toHaveBeenCalledWith(
        mockSupabase,
        10,
        1
      );
    });

    it('最初のピリオドに問題がない場合、ピリオド結果画面へ遷移する準備をする', async () => {
      const firstPeriodQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 1 },
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(firstPeriodQuery);

      vi.mocked(utils.getNextQuestion).mockResolvedValue(null);

      const result = await handleQuestionTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result).toEqual({
        success: true,
        currentPeriodId: 1,
        currentQuestionId: null,
      });

      expect(vi.mocked(utils.createQuestionDisplay)).not.toHaveBeenCalled();
    });

    it('ピリオドが見つからない場合、エラーを返す', async () => {
      const firstPeriodQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Period not found' },
        }),
      };

      mockSupabase.from.mockReturnValue(firstPeriodQuery);

      const result = await handleQuestionTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result).toEqual({
        success: false,
        error: 'ピリオドが見つかりません',
      });
    });
  });

  describe('休憩状態（break）からの遷移', () => {
    beforeEach(() => {
      mockControl.current_screen = 'break';
      mockControl.current_period_id = 1;
      mockControl.current_question_id = 5;
    });

    it('次の問題を取得して遷移する', async () => {
      vi.mocked(utils.getNextQuestion).mockResolvedValue(6);
      vi.mocked(utils.createQuestionDisplay).mockResolvedValue(undefined);

      const result = await handleQuestionTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result).toEqual({
        success: true,
        currentPeriodId: 1,
        currentQuestionId: 6,
      });

      expect(vi.mocked(utils.getNextQuestion)).toHaveBeenCalledWith(
        mockSupabase,
        1,
        5
      );

      expect(vi.mocked(utils.createQuestionDisplay)).toHaveBeenCalledWith(
        mockSupabase,
        6,
        1
      );
    });

    it('次の問題が存在しない場合、エラーを返す', async () => {
      vi.mocked(utils.getNextQuestion).mockResolvedValue(null);

      const result = await handleQuestionTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result).toEqual({
        success: false,
        error: 'これ以上の問題が存在しません。ピリオド結果画面へ遷移してください。',
      });

      expect(vi.mocked(utils.createQuestionDisplay)).not.toHaveBeenCalled();
    });

    it('ピリオド情報がない場合、エラーを返す', async () => {
      mockControl.current_period_id = null;

      const result = await handleQuestionTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result).toEqual({
        success: false,
        error: 'ピリオド情報が見つかりません',
      });
    });
  });

  describe('解答状態（answer）からの遷移', () => {
    beforeEach(() => {
      mockControl.current_screen = 'answer';
      mockControl.current_period_id = 2;
      mockControl.current_question_id = 15;
    });

    it('次の問題を取得して遷移する', async () => {
      vi.mocked(utils.getNextQuestion).mockResolvedValue(16);
      vi.mocked(utils.createQuestionDisplay).mockResolvedValue(undefined);

      const result = await handleQuestionTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result).toEqual({
        success: true,
        currentPeriodId: 2,
        currentQuestionId: 16,
      });

      expect(vi.mocked(utils.getNextQuestion)).toHaveBeenCalledWith(
        mockSupabase,
        2,
        15
      );
    });

    it('次の問題が存在しない場合、エラーを返す', async () => {
      vi.mocked(utils.getNextQuestion).mockResolvedValue(null);

      const result = await handleQuestionTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result).toEqual({
        success: false,
        error: 'これ以上の問題が存在しません。ピリオド結果画面へ遷移してください。',
      });
    });
  });

  describe('ピリオド結果画面（period_result）からの遷移', () => {
    beforeEach(() => {
      mockControl.current_screen = 'period_result';
      mockControl.current_period_id = 2;
    });

    it('次のピリオドの第1問を取得して遷移する', async () => {
      vi.mocked(utils.getNextQuestion).mockResolvedValue(20);
      vi.mocked(utils.createQuestionDisplay).mockResolvedValue(undefined);

      const result = await handleQuestionTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result).toEqual({
        success: true,
        currentPeriodId: 2,
        currentQuestionId: 20,
      });

      expect(vi.mocked(utils.getNextQuestion)).toHaveBeenCalledWith(
        mockSupabase,
        2,
        null
      );

      expect(vi.mocked(utils.createQuestionDisplay)).toHaveBeenCalledWith(
        mockSupabase,
        20,
        2
      );
    });

    it('ピリオド情報がない場合、エラーを返す', async () => {
      mockControl.current_period_id = null;

      const result = await handleQuestionTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result).toEqual({
        success: false,
        error: '次のピリオドが見つかりません。最終問題を終えた可能性があります',
      });
    });

    it('次のピリオドに問題がない場合、エラーを返す', async () => {
      vi.mocked(utils.getNextQuestion).mockResolvedValue(null);

      const result = await handleQuestionTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result).toEqual({
        success: false,
        error: '次のピリオドが見つかりません。最終問題を終えた可能性があります',
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('無効な画面遷移状態の場合、エラーを返す', async () => {
      mockControl.current_screen = 'invalid_screen' as any;

      const result = await handleQuestionTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result).toEqual({
        success: false,
        error: '無効な画面遷移です',
      });
    });

    it('question_displays の作成に失敗した場合、エラーを返す', async () => {
      mockControl.current_screen = 'break';
      mockControl.current_period_id = 1;
      mockControl.current_question_id = 5;

      vi.mocked(utils.getNextQuestion).mockResolvedValue(6);
      vi.mocked(utils.createQuestionDisplay).mockRejectedValue(
        new Error('Database error')
      );

      const result = await handleQuestionTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('問題の次を決定できませんでした');
      }
    });

    it('予期しないエラーの場合、エラーメッセージを返す', async () => {
      const firstPeriodQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(new Error('Network error')),
      };

      mockSupabase.from.mockReturnValue(firstPeriodQuery);

      const result = await handleQuestionTransition(
        mockSupabase,
        mockControl,
        1
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('問題の次を決定できませんでした');
        expect(result.error).toContain('Network error');
      }
    });
  });
});
