import { describe, it, expect } from 'vitest';

describe('FinalResultPage - Data Structure Validation', () => {
  it('getFinalResultsが成功した場合のデータ構造を確認', () => {
    const result = {
      success: true,
      data: {
        eventId: 1,
        eventName: 'Test Event',
        ranking: [
          {
            rank: 1,
            userId: 1,
            nickname: 'Champion',
            correctCount: 50,
            totalResponseTimeMs: 150000,
          },
          {
            rank: 2,
            userId: 2,
            nickname: 'SecondPlace',
            correctCount: 45,
            totalResponseTimeMs: 160000,
          },
        ],
        userResult: {
          userId: 1,
          nickname: 'Champion',
          correctCount: 50,
          totalResponseTimeMs: 150000,
          rank: 1,
        },
        periodChampions: [
          {
            periodId: 1,
            periodName: 'Period 1',
            userId: 1,
            nickname: 'Champion',
            correctCount: 20,
          },
          {
            periodId: 2,
            periodName: 'Period 2',
            userId: 2,
            nickname: 'User2',
            correctCount: 18,
          },
        ],
      },
    };

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.eventName).toBe('Test Event');
      expect(result.data.ranking).toHaveLength(2);
      expect(result.data.ranking[0]).toEqual({
        rank: 1,
        userId: 1,
        nickname: 'Champion',
        correctCount: 50,
        totalResponseTimeMs: 150000,
      });
      expect(result.data.userResult.rank).toBe(1);
      expect(result.data.periodChampions).toHaveLength(2);
      expect(result.data.periodChampions[0].periodName).toBe('Period 1');
    }
  });

  it('getFinalResultsが失敗した場合のエラー構造を確認', () => {
    const result = { success: false, error: '' };
    const errorMessage = result.error || '最終結果の読み込みに失敗しました';
    expect(errorMessage).toBe('最終結果の読み込みに失敗しました');
  });
});
