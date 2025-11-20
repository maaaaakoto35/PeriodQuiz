import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleAnswerTransition } from './handleAnswerTransition';
import type { Database } from '@/app/_lib/types/database';

describe('handleAnswerTransition', () => {
  let mockSupabase: any;
  let mockControl: Database['public']['Tables']['quiz_control']['Row'];

  beforeEach(() => {
    mockControl = {
      id: 1,
      event_id: 1,
      current_screen: 'answer',
      current_period_id: 1,
      current_question_id: 1,
      question_closed_at: null,
      question_displayed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  const createMockSupabase = (shouldError = false) => {
    const secondEqMock = vi.fn().mockResolvedValue({
      error: shouldError ? new Error('Update failed') : null
    });
    const firstEqMock = vi.fn().mockReturnValue({
      eq: secondEqMock,
    });
    const updateMock = vi.fn().mockReturnValue({
      eq: firstEqMock,
    });

    return {
      from: vi.fn().mockReturnValue({
        update: updateMock,
      }),
      mocks: {
        firstEq: firstEqMock,
        secondEq: secondEqMock,
        update: updateMock,
      },
    };
  };

  it('question_displays の closed_at タイムスタンプを正常に更新できる', async () => {
    const { from, mocks } = createMockSupabase();
    mockSupabase = { from };

    const result = await handleAnswerTransition(mockSupabase, mockControl);

    expect(from).toHaveBeenCalledWith('question_displays');
    expect(mocks.update).toHaveBeenCalledWith({
      closed_at: expect.any(String),
    });
    expect(mocks.firstEq).toHaveBeenCalledWith('period_id', 1);
    expect(mocks.secondEq).toHaveBeenCalledWith('question_id', 1);
    expect(result).toEqual({ success: true });
  });

  it('period_id が null の場合はエラーを返す', async () => {
    const { from } = createMockSupabase();
    mockSupabase = { from };
    mockControl.current_period_id = null;

    const result = await handleAnswerTransition(mockSupabase, mockControl);

    expect(result).toEqual({
      success: false,
      error: '現在の状態が不正です',
    });
  });

  it('question_id が null の場合はエラーを返す', async () => {
    const { from } = createMockSupabase();
    mockSupabase = { from };
    mockControl.current_question_id = null;

    const result = await handleAnswerTransition(mockSupabase, mockControl);

    expect(result).toEqual({
      success: false,
      error: '現在の状態が不正です',
    });
  });

  it('更新に失敗した場合はエラーを返す', async () => {
    const { from } = createMockSupabase(true);
    mockSupabase = { from };

    const result = await handleAnswerTransition(mockSupabase, mockControl);

    expect(result).toEqual({
      success: false,
      error: '問題表示記録の更新に失敗しました',
    });
  });

  it('予期しないエラーが発生した場合はグレースフルに処理する', async () => {
    mockSupabase = {
      from: vi.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      }),
    };

    const result = await handleAnswerTransition(mockSupabase, mockControl);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('answer画面への遷移に失敗しました');
      expect(result.error).toContain('Unexpected error');
    }
  });

  it('異なる period_id と question_id で正しく更新条件を設定する', async () => {
    const { from, mocks } = createMockSupabase();
    mockSupabase = { from };

    const periodId = 5;
    const questionId = 10;
    mockControl.current_period_id = periodId;
    mockControl.current_question_id = questionId;

    await handleAnswerTransition(mockSupabase, mockControl);

    expect(mocks.firstEq).toHaveBeenCalledWith('period_id', periodId);
    expect(mocks.secondEq).toHaveBeenCalledWith('question_id', questionId);
  });
});
