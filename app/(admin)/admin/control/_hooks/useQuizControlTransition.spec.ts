import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuizControlTransition } from './useQuizControlTransition';
import { updateQuizControl } from '@/app/_lib/actions/admin/updateQuizControl';
import { createClient } from '@/app/_lib/supabase/client';
import type { QuizControlState } from './useQuizControlState';
import type { UpdateQuizControlResult } from '@/app/_lib/actions/admin/updateQuizControl';

// モック化
vi.mock('@/app/_lib/supabase/client');
vi.mock('@/app/_lib/actions/admin/updateQuizControl');

describe('useQuizControlTransition', () => {
  const mockEventId = 1;
  const mockState: QuizControlState = {
    currentScreen: 'waiting',
    currentPeriodId: 1,
    currentQuestionId: 1,
    periodName: 'ピリオド1',
    questionText: '質問1',
  };

  let mockOnUpdateState: ReturnType<typeof vi.fn>;
  let mockOnSetIsUpdating: ReturnType<typeof vi.fn>;
  let mockOnSetError: ReturnType<typeof vi.fn>;
  let mockSupabaseClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockOnUpdateState = vi.fn();
    mockOnSetIsUpdating = vi.fn();
    mockOnSetError = vi.fn();

    mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { name: 'ピリオド2' } }),
    };

    vi.mocked(createClient).mockReturnValue(mockSupabaseClient);
  });

  describe('画面遷移処理（handleTransition）', () => {
    it('正常に画面遷移できる', async () => {
      const mockResult: UpdateQuizControlResult = {
        success: true,
        data: {
          currentScreen: 'question',
          currentPeriodId: 1,
          currentQuestionId: 2,
        },
      };

      vi.mocked(updateQuizControl).mockResolvedValue(mockResult);

      const { result } = renderHook(() =>
        useQuizControlTransition({
          eventId: mockEventId,
          state: mockState,
          onUpdateState: mockOnUpdateState,
          onSetIsUpdating: mockOnSetIsUpdating,
          onSetError: mockOnSetError,
        })
      );

      await act(async () => {
        await result.current.handleTransition('question');
      });

      expect(mockOnSetIsUpdating).toHaveBeenCalledWith(true);
      expect(mockOnSetIsUpdating).toHaveBeenCalledWith(false);
      expect(mockOnUpdateState).toHaveBeenCalled();
      expect(mockOnSetError).toHaveBeenCalledWith(null);
    });

    it('stateがnullの場合は何もしない', async () => {
      const { result } = renderHook(() =>
        useQuizControlTransition({
          eventId: mockEventId,
          state: null,
          onUpdateState: mockOnUpdateState,
          onSetIsUpdating: mockOnSetIsUpdating,
          onSetError: mockOnSetError,
        })
      );

      await act(async () => {
        await result.current.handleTransition('question');
      });

      expect(mockOnSetIsUpdating).not.toHaveBeenCalled();
      expect(mockOnUpdateState).not.toHaveBeenCalled();
    });

    it('画面遷移に失敗した場合、エラーを設定する', async () => {
      const errorMessage = '画面遷移に失敗しました';
      const mockResult: UpdateQuizControlResult = {
        success: false,
        error: errorMessage,
      };

      vi.mocked(updateQuizControl).mockResolvedValue(mockResult);

      const { result } = renderHook(() =>
        useQuizControlTransition({
          eventId: mockEventId,
          state: mockState,
          onUpdateState: mockOnUpdateState,
          onSetIsUpdating: mockOnSetIsUpdating,
          onSetError: mockOnSetError,
        })
      );

      await act(async () => {
        await result.current.handleTransition('question');
      });

      expect(mockOnSetError).toHaveBeenCalledWith(errorMessage);
      expect(mockOnUpdateState).not.toHaveBeenCalled();
    });

    it('Server Actionの呼び出しに例外が発生した場合、エラーを設定する', async () => {
      vi.mocked(updateQuizControl).mockRejectedValue(
        new Error('ネットワークエラー')
      );

      const { result } = renderHook(() =>
        useQuizControlTransition({
          eventId: mockEventId,
          state: mockState,
          onUpdateState: mockOnUpdateState,
          onSetIsUpdating: mockOnSetIsUpdating,
          onSetError: mockOnSetError,
        })
      );

      await act(async () => {
        await result.current.handleTransition('question');
      });

      expect(mockOnSetError).toHaveBeenCalledWith('状態更新に失敗しました');
      expect(mockOnSetIsUpdating).toHaveBeenLastCalledWith(false);
    });

    it('ピリオド情報を取得して状態に反映する', async () => {
      const mockResult: UpdateQuizControlResult = {
        success: true,
        data: {
          currentScreen: 'question',
          currentPeriodId: 2,
          currentQuestionId: 2,
        },
      };

      vi.mocked(updateQuizControl).mockResolvedValue(mockResult);

      mockSupabaseClient.single.mockResolvedValue({
        data: { name: '新しいピリオド' },
      });

      const { result } = renderHook(() =>
        useQuizControlTransition({
          eventId: mockEventId,
          state: mockState,
          onUpdateState: mockOnUpdateState,
          onSetIsUpdating: mockOnSetIsUpdating,
          onSetError: mockOnSetError,
        })
      );

      await act(async () => {
        await result.current.handleTransition('question');
      });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('periods');
      expect(mockOnUpdateState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentScreen: 'question',
          currentPeriodId: 2,
          periodName: '新しいピリオド',
        })
      );
    });

    it('質問テキストを取得して状態に反映する', async () => {
      const mockResult: UpdateQuizControlResult = {
        success: true,
        data: {
          currentScreen: 'question',
          currentPeriodId: 1,
          currentQuestionId: 3,
        },
      };

      vi.mocked(updateQuizControl).mockResolvedValue(mockResult);

      mockSupabaseClient.single.mockResolvedValue(
        { data: { text: '新しい質問' } },
        { data: { name: 'ピリオド1' } }
      );

      const { result } = renderHook(() =>
        useQuizControlTransition({
          eventId: mockEventId,
          state: mockState,
          onUpdateState: mockOnUpdateState,
          onSetIsUpdating: mockOnSetIsUpdating,
          onSetError: mockOnSetError,
        })
      );

      await act(async () => {
        await result.current.handleTransition('question');
      });

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('questions');
      expect(mockOnUpdateState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentQuestionId: 3,
        })
      );
    });

    it('ピリオドIDがnullの場合、ピリオド情報を取得しない', async () => {
      const mockResult: UpdateQuizControlResult = {
        success: true,
        data: {
          currentScreen: 'period_result',
          currentPeriodId: null,
          currentQuestionId: null,
        },
      };

      vi.mocked(updateQuizControl).mockResolvedValue(mockResult);

      const { result } = renderHook(() =>
        useQuizControlTransition({
          eventId: mockEventId,
          state: mockState,
          onUpdateState: mockOnUpdateState,
          onSetIsUpdating: mockOnSetIsUpdating,
          onSetError: mockOnSetError,
        })
      );

      await act(async () => {
        await result.current.handleTransition('period_result');
      });

      expect(mockSupabaseClient.from).not.toHaveBeenCalledWith('periods');
      expect(mockOnUpdateState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentScreen: 'period_result',
          currentPeriodId: null,
          periodName: '',
        })
      );
    });

    it('イベントIDとスクリーン情報を正しくServer Actionに渡す', async () => {
      const mockResult: UpdateQuizControlResult = {
        success: true,
        data: {
          currentScreen: 'answer',
          currentPeriodId: 1,
          currentQuestionId: 1,
        },
      };

      vi.mocked(updateQuizControl).mockResolvedValue(mockResult);

      const { result } = renderHook(() =>
        useQuizControlTransition({
          eventId: mockEventId,
          state: mockState,
          onUpdateState: mockOnUpdateState,
          onSetIsUpdating: mockOnSetIsUpdating,
          onSetError: mockOnSetError,
        })
      );

      await act(async () => {
        await result.current.handleTransition('answer');
      });

      expect(updateQuizControl).toHaveBeenCalledWith({
        eventId: mockEventId,
        nextScreen: 'answer',
      });
    });
  });

  describe('可能な遷移先の判定（getPossibleTransitions）', () => {
    it('waiting画面から可能な遷移先を返す', () => {
      const stateWithWaiting: QuizControlState = {
        ...mockState,
        currentScreen: 'waiting',
      };

      const { result } = renderHook(() =>
        useQuizControlTransition({
          eventId: mockEventId,
          state: stateWithWaiting,
          onUpdateState: mockOnUpdateState,
          onSetIsUpdating: mockOnSetIsUpdating,
          onSetError: mockOnSetError,
        })
      );

      const transitions = result.current.getPossibleTransitions();
      expect(transitions).toContain('question');
    });

    it('question画面から可能な遷移先を返す', () => {
      const stateWithQuestion: QuizControlState = {
        ...mockState,
        currentScreen: 'question',
      };

      const { result } = renderHook(() =>
        useQuizControlTransition({
          eventId: mockEventId,
          state: stateWithQuestion,
          onUpdateState: mockOnUpdateState,
          onSetIsUpdating: mockOnSetIsUpdating,
          onSetError: mockOnSetError,
        })
      );

      const transitions = result.current.getPossibleTransitions();
      expect(transitions).toContain('answer_check');
    });

    it('stateがnullの場合、空配列を返す', () => {
      const { result } = renderHook(() =>
        useQuizControlTransition({
          eventId: mockEventId,
          state: null,
          onUpdateState: mockOnUpdateState,
          onSetIsUpdating: mockOnSetIsUpdating,
          onSetError: mockOnSetError,
        })
      );

      const transitions = result.current.getPossibleTransitions();
      expect(transitions).toEqual([]);
    });

    it('複数の可能な遷移先がある場合、すべて返す', () => {
      const stateWithWaiting: QuizControlState = {
        ...mockState,
        currentScreen: 'waiting',
      };

      const { result } = renderHook(() =>
        useQuizControlTransition({
          eventId: mockEventId,
          state: stateWithWaiting,
          onUpdateState: mockOnUpdateState,
          onSetIsUpdating: mockOnSetIsUpdating,
          onSetError: mockOnSetError,
        })
      );

      const transitions = result.current.getPossibleTransitions();
      expect(Array.isArray(transitions)).toBe(true);
      expect(transitions.length).toBeGreaterThan(0);
    });
  });

  describe('状態管理', () => {
    it('遷移開始時にisUpdatingをtrueに設定する', async () => {
      const mockResult: UpdateQuizControlResult = {
        success: true,
        data: {
          currentScreen: 'question',
          currentPeriodId: 1,
          currentQuestionId: 2,
        },
      };

      vi.mocked(updateQuizControl).mockResolvedValue(mockResult);

      const { result } = renderHook(() =>
        useQuizControlTransition({
          eventId: mockEventId,
          state: mockState,
          onUpdateState: mockOnUpdateState,
          onSetIsUpdating: mockOnSetIsUpdating,
          onSetError: mockOnSetError,
        })
      );

      await act(async () => {
        await result.current.handleTransition('question');
      });

      const firstCall = mockOnSetIsUpdating.mock.calls[0];
      expect(firstCall[0]).toBe(true);
    });

    it('遷移完了時にisUpdatingをfalseに設定する', async () => {
      const mockResult: UpdateQuizControlResult = {
        success: true,
        data: {
          currentScreen: 'question',
          currentPeriodId: 1,
          currentQuestionId: 2,
        },
      };

      vi.mocked(updateQuizControl).mockResolvedValue(mockResult);

      const { result } = renderHook(() =>
        useQuizControlTransition({
          eventId: mockEventId,
          state: mockState,
          onUpdateState: mockOnUpdateState,
          onSetIsUpdating: mockOnSetIsUpdating,
          onSetError: mockOnSetError,
        })
      );

      await act(async () => {
        await result.current.handleTransition('question');
      });

      const lastCall = mockOnSetIsUpdating.mock.calls[mockOnSetIsUpdating.mock.calls.length - 1];
      expect(lastCall[0]).toBe(false);
    });

    it('遷移開始時にエラーをクリアする', async () => {
      const mockResult: UpdateQuizControlResult = {
        success: true,
        data: {
          currentScreen: 'question',
          currentPeriodId: 1,
          currentQuestionId: 2,
        },
      };

      vi.mocked(updateQuizControl).mockResolvedValue(mockResult);

      const { result } = renderHook(() =>
        useQuizControlTransition({
          eventId: mockEventId,
          state: mockState,
          onUpdateState: mockOnUpdateState,
          onSetIsUpdating: mockOnSetIsUpdating,
          onSetError: mockOnSetError,
        })
      );

      await act(async () => {
        await result.current.handleTransition('question');
      });

      expect(mockOnSetError).toHaveBeenCalledWith(null);
    });

    it('エラー発生時もisUpdatingをfalseに設定する', async () => {
      vi.mocked(updateQuizControl).mockRejectedValue(
        new Error('エラー発生')
      );

      const { result } = renderHook(() =>
        useQuizControlTransition({
          eventId: mockEventId,
          state: mockState,
          onUpdateState: mockOnUpdateState,
          onSetIsUpdating: mockOnSetIsUpdating,
          onSetError: mockOnSetError,
        })
      );

      await act(async () => {
        await result.current.handleTransition('question');
      });

      const lastCall = mockOnSetIsUpdating.mock.calls[mockOnSetIsUpdating.mock.calls.length - 1];
      expect(lastCall[0]).toBe(false);
    });
  });
});
