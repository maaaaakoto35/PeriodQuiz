import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updateQuizControl, type UpdateQuizControlInput } from './updateQuizControl';
import * as checkAdminAuthModule from '../checkAdminAuth';
import * as serverAdminModule from '@/app/_lib/supabase/server-admin';
import * as handlersModule from './handlers';
import { type QuizControl } from '@/app/_lib/types/quiz';

const createMockQueryBuilder = () => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  update: vi.fn().mockReturnThis(),
  from: vi.fn(),
});

const createMockSupabase = () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    from: vi.fn(function (_table: string) {
      const queryBuilder = createMockQueryBuilder();
      queryBuilder.select.mockReturnThis();
      queryBuilder.eq.mockReturnThis();
      queryBuilder.update.mockReturnThis();
      return queryBuilder;
    }),
  };
};

// テストデータ
const mockQuizControl: QuizControl = {
  id: 1,
  event_id: 1,
  current_screen: 'waiting',
  current_period_id: 1,
  current_question_id: null,
  question_displayed_at: null,
  question_closed_at: null,
  updated_at: '2025-11-20T00:00:00Z',
};

describe('updateQuizControl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('認証関連', () => {
    it('管理者が認証されていない場合はエラーを返す', async () => {
      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: false,
      });

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'question',
      };

      const result = await updateQuizControl(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('認証が必要です');
      }
    });

    it('管理者が認証されている場合は処理を継続する', async () => {
      const mockSupabase = createMockSupabase();

      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: true,
      });
      vi.spyOn(serverAdminModule, 'createAdminClient').mockReturnValue(
        mockSupabase as any
      );

      const queryBuilder = mockSupabase.from('quiz_control');
      queryBuilder.select.mockReturnThis();
      queryBuilder.eq.mockReturnThis();
      queryBuilder.single.mockResolvedValue({
        data: mockQuizControl,
        error: null,
      });
      mockSupabase.from.mockReturnValue(queryBuilder);

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'question',
      };

      await updateQuizControl(input);

      expect(checkAdminAuthModule.checkAdminAuth).toHaveBeenCalled();
    });
  });

  describe('クイズ制御情報の取得', () => {
    it('クイズ制御情報が見つからない場合はエラーを返す', async () => {
      const mockSupabase = createMockSupabase();

      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: true,
      });
      vi.spyOn(serverAdminModule, 'createAdminClient').mockReturnValue(
        mockSupabase as any
      );

      const queryBuilder = mockSupabase.from('quiz_control');
      queryBuilder.select.mockReturnThis();
      queryBuilder.eq.mockReturnThis();
      queryBuilder.single.mockResolvedValue({
        data: null,
        error: new Error('No data found'),
      });
      mockSupabase.from.mockReturnValue(queryBuilder);

      const input: UpdateQuizControlInput = {
        eventId: 999,
        nextScreen: 'question',
      };

      const result = await updateQuizControl(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('クイズ制御情報が見つかりません');
      }
    });

    it('クイズ制御情報を正常に取得できる', async () => {
      const mockSupabase = createMockSupabase();

      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: true,
      });
      vi.spyOn(serverAdminModule, 'createAdminClient').mockReturnValue(
        mockSupabase as any
      );

      const queryBuilder = mockSupabase.from('quiz_control');
      (queryBuilder.select).mockReturnThis();
      (queryBuilder.eq).mockReturnThis();
      (queryBuilder.single).mockResolvedValue({
        data: mockQuizControl,
        error: null,
      });
      (queryBuilder.update).mockReturnThis();
      (mockSupabase.from).mockReturnValue(queryBuilder);

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'question',
      };

      await updateQuizControl(input);

      expect(mockSupabase.from).toHaveBeenCalledWith('quiz_control');
    });
  });

  describe('画面遷移のバリデーション', () => {
    it('待機画面から問題画面への遷移は許可される', async () => {
      const mockSupabase = createMockSupabase();

      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: true,
      });
      vi.spyOn(serverAdminModule, 'createAdminClient').mockReturnValue(
        mockSupabase as any
      );
      vi.spyOn(
        handlersModule,
        'handleQuestionTransition'
      ).mockResolvedValue({
        success: true,
        currentPeriodId: 1,
        currentQuestionId: 1,
      });

      const queryBuilder = mockSupabase.from('quiz_control');
      (queryBuilder.select).mockReturnThis();
      (queryBuilder.eq).mockReturnThis();
      (queryBuilder.single).mockResolvedValue({
        data: mockQuizControl,
        error: null,
      });
      (queryBuilder.update).mockReturnThis();
      (mockSupabase.from).mockReturnValue(queryBuilder);

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'question',
      };

      const result = await updateQuizControl(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentScreen).toBe('question');
      }
    });

    it('待機画面から答え画面への直接遷移は許可されない', async () => {
      const mockSupabase = createMockSupabase();

      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: true,
      });
      vi.spyOn(serverAdminModule, 'createAdminClient').mockReturnValue(
        mockSupabase as any
      );

      const queryBuilder = mockSupabase.from('quiz_control');
      (queryBuilder.select).mockReturnThis();
      (queryBuilder.eq).mockReturnThis();
      (queryBuilder.single).mockResolvedValue({
        data: mockQuizControl,
        error: null,
      });
      (mockSupabase.from).mockReturnValue(queryBuilder);

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'answer',
      };

      const result = await updateQuizControl(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('遷移は許可されていません');
      }
    });

    it('問題画面から答え画面への遷移は許可される', async () => {
      const mockSupabase = createMockSupabase();

      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: true,
      });
      vi.spyOn(
        handlersModule,
        'handleAnswerTransition'
      ).mockResolvedValue({
        success: true,
      });
      vi.spyOn(serverAdminModule, 'createAdminClient').mockReturnValue(
        mockSupabase as any
      );

      const questionControl: QuizControl = {
        ...mockQuizControl,
        current_screen: 'question',
        current_question_id: 1,
      };

      const queryBuilder = mockSupabase.from('quiz_control');
      (queryBuilder.select).mockReturnThis();
      (queryBuilder.eq).mockReturnThis();
      (queryBuilder.single).mockResolvedValue({
        data: questionControl,
        error: null,
      });
      (queryBuilder.update).mockReturnThis();
      (mockSupabase.from).mockReturnValue(queryBuilder);

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'answer',
      };

      const result = await updateQuizControl(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentScreen).toBe('answer');
      }
    });

    it('答え画面から問題画面への遷移は許可される', async () => {
      const mockSupabase = createMockSupabase();

      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: true,
      });
      vi.spyOn(
        handlersModule,
        'handleQuestionTransition'
      ).mockResolvedValue({
        success: true,
        currentPeriodId: 1,
        currentQuestionId: 2,
      });
      vi.spyOn(serverAdminModule, 'createAdminClient').mockReturnValue(
        mockSupabase as any
      );

      const answerControl: QuizControl = {
        ...mockQuizControl,
        current_screen: 'answer',
        current_question_id: 1,
      };

      const queryBuilder = mockSupabase.from('quiz_control');
      (queryBuilder.select).mockReturnThis();
      (queryBuilder.eq).mockReturnThis();
      (queryBuilder.single).mockResolvedValue({
        data: answerControl,
        error: null,
      });
      (queryBuilder.update).mockReturnThis();
      (mockSupabase.from).mockReturnValue(queryBuilder);

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'question',
      };

      const result = await updateQuizControl(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentScreen).toBe('question');
      }
    });

    it('答え画面から休憩画面への遷移は許可される', async () => {
      const mockSupabase = createMockSupabase();

      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: true,
      });
      vi.spyOn(serverAdminModule, 'createAdminClient').mockReturnValue(
        mockSupabase as any
      );

      const answerControl: QuizControl = {
        ...mockQuizControl,
        current_screen: 'answer',
        current_question_id: 1,
      };

      const queryBuilder = mockSupabase.from('quiz_control');
      (queryBuilder.select).mockReturnThis();
      (queryBuilder.eq).mockReturnThis();
      (queryBuilder.single).mockResolvedValue({
        data: answerControl,
        error: null,
      });
      (queryBuilder.update).mockReturnThis();
      (mockSupabase.from).mockReturnValue(queryBuilder);

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'break',
      };

      const result = await updateQuizControl(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentScreen).toBe('break');
      }
    });

    it('最終結果画面からの遷移は許可されない', async () => {
      const mockSupabase = createMockSupabase();

      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: true,
      });
      vi.spyOn(serverAdminModule, 'createAdminClient').mockReturnValue(
        mockSupabase as any
      );

      const finalResultControl: QuizControl = {
        ...mockQuizControl,
        current_screen: 'final_result',
      };

      const queryBuilder = mockSupabase.from('quiz_control');
      (queryBuilder.select).mockReturnThis();
      (queryBuilder.eq).mockReturnThis();
      (queryBuilder.single).mockResolvedValue({
        data: finalResultControl,
        error: null,
      });
      (mockSupabase.from).mockReturnValue(queryBuilder);

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'question',
      };

      const result = await updateQuizControl(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('遷移は許可されていません');
      }
    });
  });

  describe('question画面への遷移', () => {
    it('question画面への遷移時にhandleQuestionTransitionが呼ばれる', async () => {
      const mockSupabase = createMockSupabase();
      const handleQuestionSpy = vi
        .spyOn(handlersModule, 'handleQuestionTransition')
        .mockResolvedValue({
          success: true,
          currentPeriodId: 1,
          currentQuestionId: 1,
        });

      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: true,
      });
      vi.spyOn(serverAdminModule, 'createAdminClient').mockReturnValue(
        mockSupabase as any
      );

      const queryBuilder = mockSupabase.from('quiz_control');
      (queryBuilder.select).mockReturnThis();
      (queryBuilder.eq).mockReturnThis();
      (queryBuilder.single).mockResolvedValue({
        data: mockQuizControl,
        error: null,
      });
      (queryBuilder.update).mockReturnThis();
      (mockSupabase.from).mockReturnValue(queryBuilder);

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'question',
      };

      await updateQuizControl(input);

      expect(handleQuestionSpy).toHaveBeenCalledWith(
        mockSupabase,
        mockQuizControl,
        1
      );
    });

    it('handleQuestionTransitionが失敗した場合はエラーを返す', async () => {
      const mockSupabase = createMockSupabase();

      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: true,
      });
      vi.spyOn(
        handlersModule,
        'handleQuestionTransition'
      ).mockResolvedValue({
        success: false,
        error: '次の問題が見つかりません',
      });
      vi.spyOn(serverAdminModule, 'createAdminClient').mockReturnValue(
        mockSupabase as any
      );

      const queryBuilder = mockSupabase.from('quiz_control');
      (queryBuilder.select).mockReturnThis();
      (queryBuilder.eq).mockReturnThis();
      (queryBuilder.single).mockResolvedValue({
        data: mockQuizControl,
        error: null,
      });
      (mockSupabase.from).mockReturnValue(queryBuilder);

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'question',
      };

      const result = await updateQuizControl(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('次の問題が見つかりません');
      }
    });

    it('question画面への遷移時にperiod_idとquestion_idが更新される', async () => {
      const mockSupabase = createMockSupabase();

      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: true,
      });
      vi.spyOn(
        handlersModule,
        'handleQuestionTransition'
      ).mockResolvedValue({
        success: true,
        currentPeriodId: 1,
        currentQuestionId: 5,
      });
      vi.spyOn(serverAdminModule, 'createAdminClient').mockReturnValue(
        mockSupabase as any
      );

      const queryBuilder = mockSupabase.from('quiz_control');
      (queryBuilder.select).mockReturnThis();
      (queryBuilder.eq).mockReturnThis();
      (queryBuilder.single).mockResolvedValue({
        data: mockQuizControl,
        error: null,
      });
      (queryBuilder.update).mockReturnThis();
      (mockSupabase.from).mockReturnValue(queryBuilder);

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'question',
      };

      const result = await updateQuizControl(input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentPeriodId).toBe(1);
        expect(result.data.currentQuestionId).toBe(5);
      }
    });
  });

  describe('answer画面への遷移', () => {
    it('answer画面への遷移時にhandleAnswerTransitionが呼ばれる', async () => {
      const mockSupabase = createMockSupabase();
      const handleAnswerSpy = vi
        .spyOn(handlersModule, 'handleAnswerTransition')
        .mockResolvedValue({
          success: true,
        });

      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: true,
      });
      vi.spyOn(serverAdminModule, 'createAdminClient').mockReturnValue(
        mockSupabase as any
      );

      const answerControl: QuizControl = {
        ...mockQuizControl,
        current_screen: 'question',
        current_question_id: 1,
      };

      const queryBuilder = mockSupabase.from('quiz_control');
      (queryBuilder.select).mockReturnThis();
      (queryBuilder.eq).mockReturnThis();
      (queryBuilder.single).mockResolvedValue({
        data: answerControl,
        error: null,
      });
      (queryBuilder.update).mockReturnThis();
      (mockSupabase.from).mockReturnValue(queryBuilder);

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'answer',
      };

      await updateQuizControl(input);

      expect(handleAnswerSpy).toHaveBeenCalledWith(mockSupabase, answerControl);
    });

    it('handleAnswerTransitionが失敗した場合はエラーを返す', async () => {
      const mockSupabase = createMockSupabase();

      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: true,
      });
      vi.spyOn(
        handlersModule,
        'handleAnswerTransition'
      ).mockResolvedValue({
        success: false,
        error: 'question_displays の更新に失敗しました',
      });
      vi.spyOn(serverAdminModule, 'createAdminClient').mockReturnValue(
        mockSupabase as any
      );

      const answerControl: QuizControl = {
        ...mockQuizControl,
        current_screen: 'question',
        current_question_id: 1,
      };

      const queryBuilder = mockSupabase.from('quiz_control');
      (queryBuilder.select).mockReturnThis();
      (queryBuilder.eq).mockReturnThis();
      (queryBuilder.single).mockResolvedValue({
        data: answerControl,
        error: null,
      });
      (mockSupabase.from).mockReturnValue(queryBuilder);

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'answer',
      };

      const result = await updateQuizControl(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('question_displays の更新に失敗しました');
      }
    });
  });



  describe('データベース更新', () => {
    it('quiz_controlテーブルの更新に失敗した場合はエラーを返す', async () => {
      const mockSupabase = createMockSupabase();

      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: true,
      });
      vi.spyOn(
        handlersModule,
        'handleQuestionTransition'
      ).mockResolvedValue({
        success: true,
        currentPeriodId: 1,
        currentQuestionId: 1,
      });
      vi.spyOn(serverAdminModule, 'createAdminClient').mockReturnValue(
        mockSupabase as any
      );

      const queryBuilder = mockSupabase.from('quiz_control');
      (queryBuilder.select as any).mockReturnThis();
      (queryBuilder.eq as any).mockReturnThis();
      (queryBuilder.single as any).mockResolvedValue({
        data: mockQuizControl,
        error: null,
      });

      // updateメソッドでチェーンできるようにする
      const updateChain = {
        eq: vi.fn().mockResolvedValue({
          error: new Error('Database error'),
        }),
      };
      (queryBuilder.update as any).mockReturnValue(updateChain);
      (mockSupabase.from as any).mockReturnValue(queryBuilder);

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'question',
      };

      const result = await updateQuizControl(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('クイズ制御情報の更新に失敗しました');
      }
    });

    it('quiz_controlテーブルが正常に更新される', async () => {
      const mockSupabase = createMockSupabase();
      const updateSpy = vi.fn().mockResolvedValue({ error: null });

      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: true,
      });
      vi.spyOn(
        handlersModule,
        'handleQuestionTransition'
      ).mockResolvedValue({
        success: true,
        currentPeriodId: 1,
        currentQuestionId: 1,
      });
      vi.spyOn(serverAdminModule, 'createAdminClient').mockReturnValue(
        mockSupabase as any
      );

      const queryBuilder = mockSupabase.from('quiz_control');
      (queryBuilder.select as any).mockReturnThis();
      (queryBuilder.eq as any).mockReturnThis();
      (queryBuilder.single as any).mockResolvedValue({
        data: mockQuizControl,
        error: null,
      });
      (queryBuilder.update as any).mockImplementation(() => ({
        eq: updateSpy,
      }));
      (mockSupabase.from as any).mockReturnValue(queryBuilder);

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'question',
      };

      const result = await updateQuizControl(input);

      expect(result.success).toBe(true);
    });
  });

  describe('エラーハンドリング', () => {
    it('予期しないエラーが発生した場合はエラーメッセージを返す', async () => {
      const mockSupabase = createMockSupabase();
      const errorMessage = '予期しないエラーが発生しました';

      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockRejectedValue(
        new Error(errorMessage)
      );
      vi.spyOn(serverAdminModule, 'createAdminClient').mockReturnValue(
        mockSupabase as any
      );

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'question',
      };

      const result = await updateQuizControl(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('エラー');
      }
    });

    it('Errorオブジェクト以外の例外が発生した場合はデフォルトエラーメッセージを返す', async () => {
      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockRejectedValue(
        'Unknown error'
      );

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'question',
      };

      const result = await updateQuizControl(input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('予期しないエラーが発生しました');
      }
    });
  });

  describe('戻り値の型チェック', () => {
    it('成功時は正しい型の戻り値を返す', async () => {
      const mockSupabase = createMockSupabase();

      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: true,
      });
      vi.spyOn(
        handlersModule,
        'handleQuestionTransition'
      ).mockResolvedValue({
        success: true,
        currentPeriodId: 1,
        currentQuestionId: 1,
      });
      vi.spyOn(serverAdminModule, 'createAdminClient').mockReturnValue(
        mockSupabase as any
      );

      const queryBuilder = mockSupabase.from('quiz_control');
      (queryBuilder.select as any).mockReturnThis();
      (queryBuilder.eq as any).mockReturnThis();
      (queryBuilder.single as any).mockResolvedValue({
        data: mockQuizControl,
        error: null,
      });
      (queryBuilder.update as any).mockReturnThis();
      (mockSupabase.from as any).mockReturnValue(queryBuilder);

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'question',
      };

      const result = await updateQuizControl(input);

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result).toHaveProperty('data');
        expect(result.data).toHaveProperty('currentScreen');
        expect(result.data).toHaveProperty('currentPeriodId');
        expect(result.data).toHaveProperty('currentQuestionId');
      }
    });

    it('失敗時は正しい型の戻り値を返す', async () => {
      vi.spyOn(checkAdminAuthModule, 'checkAdminAuth').mockResolvedValue({
        authenticated: false,
      });

      const input: UpdateQuizControlInput = {
        eventId: 1,
        nextScreen: 'question',
      };

      const result = await updateQuizControl(input);

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result).toHaveProperty('error');
        expect(typeof result.error).toBe('string');
      }
    });
  });
});
