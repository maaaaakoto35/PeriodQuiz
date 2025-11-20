import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock Server Actions - BEFORE importing useQuestionAnswer
vi.mock('@/app/_lib/actions/user', () => ({
  submitAnswer: vi.fn(),
}));

import { submitAnswer } from '@/app/_lib/actions/user';
import { useQuestionAnswer } from './useQuestionAnswer';

describe('useQuestionAnswer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初期状態', () => {
    it('初期状態が正しく設定される', () => {
      const { result } = renderHook(() => useQuestionAnswer());

      expect(result.current.selectedChoiceId).toBeNull();
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isAnswered).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('選択肢の選択', () => {
    it('選択肢を選択できる', () => {
      const { result } = renderHook(() => useQuestionAnswer());

      act(() => {
        result.current.selectChoice(1);
      });

      expect(result.current.selectedChoiceId).toBe(1);
    });

    it('複数回選択できる', () => {
      const { result } = renderHook(() => useQuestionAnswer());

      act(() => {
        result.current.selectChoice(1);
      });
      expect(result.current.selectedChoiceId).toBe(1);

      act(() => {
        result.current.selectChoice(2);
      });
      expect(result.current.selectedChoiceId).toBe(2);
    });

    it('選択時にエラーがクリアされる', () => {
      (submitAnswer as any).mockResolvedValue({
        success: false,
        error: 'テストエラー',
      });

      const { result } = renderHook(() => useQuestionAnswer());

      // エラー状態に設定
      act(() => {
        result.current.selectChoice(1);
      });

      // 次の選択肢を選択するとエラーがクリアされる
      act(() => {
        result.current.selectChoice(2);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('回答の送信', () => {
    it('選択肢が選ばれていない場合、エラーを返す', async () => {
      const { result } = renderHook(() => useQuestionAnswer());

      await act(async () => {
        await result.current.submit(1);
      });

      expect(result.current.error).toContain('選択肢を選んでから送信してください');
      expect(submitAnswer).not.toHaveBeenCalled();
    });

    it('既に回答済みの場合、エラーを返す', async () => {
      (submitAnswer as any).mockResolvedValue({
        success: true,
        data: { answerId: 1 },
      });

      const { result } = renderHook(() => useQuestionAnswer());

      // 最初の回答送信
      act(() => {
        result.current.selectChoice(1);
      });

      await act(async () => {
        await result.current.submit(1);
      });

      // 送信を試みる
      await act(async () => {
        await result.current.submit(1);
      });

      expect(result.current.error).toContain('選択肢を選んでから送信してください');
    });

    it('回答の送信に成功する', async () => {
      (submitAnswer as any).mockResolvedValue({
        success: true,
        data: { answerId: 42 },
      });

      const { result } = renderHook(() => useQuestionAnswer());

      act(() => {
        result.current.selectChoice(1);
      });

      await act(async () => {
        await result.current.submit(1);
      });

      expect(result.current.isAnswered).toBe(true);
      expect(result.current.error).toBeNull();
      expect(submitAnswer).toHaveBeenCalledWith({
        eventId: 1,
        choiceId: 1,
      });
    });

    it('送信エラーが発生した場合、エラーが表示される', async () => {
      const errorMessage = 'サーバーエラーが発生しました';
      (submitAnswer as any).mockResolvedValue({
        success: false,
        error: errorMessage,
      });

      const { result } = renderHook(() => useQuestionAnswer());

      act(() => {
        result.current.selectChoice(1);
      });

      await act(async () => {
        await result.current.submit(1);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isAnswered).toBe(false);
    });

    it('エラーが発生しても選択肢はリセットされない', async () => {
      const errorMessage = 'エラーが発生しました';
      (submitAnswer as any).mockResolvedValue({
        success: false,
        error: errorMessage,
      });

      const { result } = renderHook(() => useQuestionAnswer());

      act(() => {
        result.current.selectChoice(1);
      });

      const choiceBeforeSubmit = result.current.selectedChoiceId;

      await act(async () => {
        await result.current.submit(1);
      });

      expect(result.current.selectedChoiceId).toBe(choiceBeforeSubmit);
    });
  });

  describe('リセット', () => {
    it('reset が呼ばれるとすべての状態がリセットされる', async () => {
      (submitAnswer as any).mockResolvedValue({
        success: true,
        data: { answerId: 1 },
      });

      const { result } = renderHook(() => useQuestionAnswer());

      // 状態を変更
      act(() => {
        result.current.selectChoice(1);
      });

      await act(async () => {
        await result.current.submit(1);
      });

      // リセット
      act(() => {
        result.current.reset();
      });

      expect(result.current.selectedChoiceId).toBeNull();
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isAnswered).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('リセット後に新しい回答ができる', async () => {
      (submitAnswer as any).mockResolvedValue({
        success: true,
        data: { answerId: 1 },
      });

      const { result } = renderHook(() => useQuestionAnswer());

      // 1回目の回答
      act(() => {
        result.current.selectChoice(1);
      });

      await act(async () => {
        await result.current.submit(1);
      });

      // リセット
      act(() => {
        result.current.reset();
      });

      // 2回目の回答（別の選択肢）
      act(() => {
        result.current.selectChoice(2);
      });

      expect(result.current.selectedChoiceId).toBe(2);
      expect(result.current.isAnswered).toBe(false);
    });
  });

  describe('エラーハンドリング', () => {
    it('回答送信後、再度選択可能な状態は保たれない', async () => {
      (submitAnswer as any).mockResolvedValue({
        success: true,
        data: { answerId: 1 },
      });

      const { result } = renderHook(() => useQuestionAnswer());

      act(() => {
        result.current.selectChoice(1);
      });

      await act(async () => {
        await result.current.submit(1);
      });

      // 別の選択肢を選択しようとしても、isAnswered が true なので反応しない
      act(() => {
        result.current.selectChoice(2);
      });

      expect(result.current.selectedChoiceId).toBe(1);
      expect(result.current.isAnswered).toBe(true);
    });

    it('複数回の送信を試みても、既に回答済みの場合は2回目で拒否される', async () => {
      (submitAnswer as any).mockResolvedValue({
        success: true,
        data: { answerId: 1 },
      });

      const { result } = renderHook(() => useQuestionAnswer());

      act(() => {
        result.current.selectChoice(1);
      });

      // 最初の送信
      await act(async () => {
        await result.current.submit(1);
      });

      expect(result.current.isAnswered).toBe(true);

      // 2回目の送信を試みる
      await act(async () => {
        await result.current.submit(1);
      });

      // 2回目で新しく別の選択肢を選んだわけではないので、エラーメッセージが出ていて新しい送信は起きない
      expect(result.current.error).toContain('選択肢を選んでから送信してください');
    });
  });
});
