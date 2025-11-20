import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNextQuestion } from './getNextQuestion';

describe('getNextQuestion', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn(),
    };
  });

  /**
   * チェーン可能なモックを生成
   */
  function createChainableMock(finalResult: any) {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(finalResult),
      maybeSingle: vi.fn().mockResolvedValue(finalResult),
    };

    // チェーンメソッドが常に chain を返す
    Object.keys(chain).forEach((key) => {
      if (key !== 'single' && key !== 'maybeSingle') {
        (chain[key as keyof typeof chain] as any).mockReturnValue(chain);
      }
    });

    return chain;
  }

  it('currentQuestionId が null の場合、最初の問題を返す', async () => {
    const chain = createChainableMock({
      data: { question_id: 1 },
      error: null,
    });

    mockSupabase.from.mockReturnValue(chain);

    const result = await getNextQuestion(mockSupabase, 10, null);

    expect(mockSupabase.from).toHaveBeenCalledWith('period_questions');
    expect(chain.select).toHaveBeenCalledWith('question_id');
    expect(chain.eq).toHaveBeenCalledWith('period_id', 10);
    expect(chain.order).toHaveBeenCalledWith('order_num', { ascending: true });
    expect(chain.limit).toHaveBeenCalledWith(1);
    expect(chain.single).toHaveBeenCalled();
    expect(result).toBe(1);
  });

  it('次の問題が存在する場合、次の問題 ID を返す', async () => {
    // 現在の問題の order_num を取得するチェーン
    const currentChain = createChainableMock({
      data: { order_num: 2 },
      error: null,
    });

    // 次の問題を取得するチェーン
    const nextChain = createChainableMock({
      data: { question_id: 3 },
      error: null,
    });

    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? currentChain : nextChain;
    });

    const result = await getNextQuestion(mockSupabase, 10, 2);

    // 1回目呼び出し: 現在の問題の order_num を取得
    expect(currentChain.eq).toHaveBeenCalledWith('period_id', 10);
    expect(currentChain.eq).toHaveBeenCalledWith('question_id', 2);
    expect(currentChain.single).toHaveBeenCalled();

    // 2回目呼び出し: 次の問題を取得
    expect(nextChain.eq).toHaveBeenCalledWith('period_id', 10);
    expect(nextChain.gt).toHaveBeenCalledWith('order_num', 2);
    expect(nextChain.order).toHaveBeenCalledWith('order_num', { ascending: true });
    expect(nextChain.limit).toHaveBeenCalledWith(1);
    expect(nextChain.maybeSingle).toHaveBeenCalled();

    expect(result).toBe(3);
  });

  it('次の問題が存在しない場合、null を返す', async () => {
    // 現在の問題の order_num を取得するチェーン
    const currentChain = createChainableMock({
      data: { order_num: 5 },
      error: null,
    });

    // 次の問題が存在しない場合
    const nextChain = createChainableMock({
      data: null,
      error: null,
    });

    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? currentChain : nextChain;
    });

    const result = await getNextQuestion(mockSupabase, 10, 2);

    expect(result).toBeNull();
  });

  it('現在の問題が見つからない場合、エラーをスロー', async () => {
    const currentChain = createChainableMock({
      data: null,
      error: new Error('問題が見つかりません'),
    });

    mockSupabase.from.mockReturnValue(currentChain);

    await expect(
      getNextQuestion(mockSupabase, 10, 999)
    ).rejects.toThrow('現在の問題情報が見つかりません');
  });

  it('currentQuestionId が null で問題が見つからない場合、エラーをスロー', async () => {
    const chain = createChainableMock({
      data: null,
      error: new Error('問題が見つかりません'),
    });

    mockSupabase.from.mockReturnValue(chain);

    await expect(
      getNextQuestion(mockSupabase, 10, null)
    ).rejects.toThrow('問題が見つかりません');
  });

  it('問題情報の取得に失敗した場合、エラーをスロー', async () => {
    // 現在の問題の order_num を取得するチェーン
    const currentChain = createChainableMock({
      data: { order_num: 2 },
      error: null,
    });

    // 次の問題取得時にエラー
    const nextChain = createChainableMock({
      data: null,
      error: new Error('DB接続エラー'),
    });

    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      callCount++;
      return callCount === 1 ? currentChain : nextChain;
    });

    await expect(
      getNextQuestion(mockSupabase, 10, 2)
    ).rejects.toThrow('問題情報の取得に失敗しました');
  });
});
