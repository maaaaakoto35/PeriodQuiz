import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getRankings } from './getRankings';
import { createAdminClient } from '@/app/_lib/supabase/server-admin';

// Mock dependencies
vi.mock('@/app/_lib/supabase/server-admin');

const mockCreateAdminClient = vi.mocked(createAdminClient);

describe('getRankings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    it('ピリオドランキングとイベント全体ランキングを正しく返す', async () => {
      // Arrange
      const eventId = 1;
      const periodId = 1;

      const mockPeriodData = [
        {
          user_id: 1,
          nickname: 'Alice',
          correct_count: 10,
          total_response_time_ms: 5000,
          answered_count: 10,
        },
        {
          user_id: 2,
          nickname: 'Bob',
          correct_count: 9,
          total_response_time_ms: 4500,
          answered_count: 10,
        },
        {
          user_id: 3,
          nickname: 'Charlie',
          correct_count: 8,
          total_response_time_ms: 6000,
          answered_count: 10,
        },
      ];

      const mockEventData = [
        {
          user_id: 1,
          nickname: 'Alice',
          correct_count: 25,
          total_response_time_ms: 12000,
          answered_count: 30,
        },
        {
          user_id: 2,
          nickname: 'Bob',
          correct_count: 23,
          total_response_time_ms: 11000,
          answered_count: 30,
        },
      ];

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      // 最初のfrom呼び出し（period_rankings）
      mockSupabase.limit.mockResolvedValueOnce({ data: mockPeriodData, error: null });
      // 2番目のfrom呼び出し（event_rankings）
      mockSupabase.limit.mockResolvedValueOnce({ data: mockEventData, error: null });

      mockCreateAdminClient.mockResolvedValue(mockSupabase as any);

      // Act
      const result = await getRankings(eventId, periodId);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.period.eventId).toBe(eventId);
      expect(result?.period.periodId).toBe(periodId);
      expect(result?.period.entries).toHaveLength(3);
      expect(result?.event.eventId).toBe(eventId);
      expect(result?.event.entries).toHaveLength(2);

      // ランキング形式の確認
      expect(result?.period.entries[0]).toEqual({
        rank: 1,
        userId: 1,
        nickname: 'Alice',
        correctCount: 10,
        totalResponseTimeMs: 5000,
        answeredCount: 10,
      });

      expect(result?.period.entries[1]).toEqual({
        rank: 2,
        userId: 2,
        nickname: 'Bob',
        correctCount: 9,
        totalResponseTimeMs: 4500,
        answeredCount: 10,
      });
    });

    it('空のランキングデータを正しく処理する', async () => {
      // Arrange
      const eventId = 1;
      const periodId = 1;

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      mockSupabase.limit.mockResolvedValueOnce({ data: [], error: null });
      mockSupabase.limit.mockResolvedValueOnce({ data: [], error: null });

      mockCreateAdminClient.mockResolvedValue(mockSupabase as any);

      // Act
      const result = await getRankings(eventId, periodId);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.period.entries).toHaveLength(0);
      expect(result?.event.entries).toHaveLength(0);
    });

    it('最大10件までのデータを返す', async () => {
      // Arrange
      const eventId = 1;
      const periodId = 1;

      const mockPeriodData = Array.from({ length: 10 }, (_, i) => ({
        user_id: i + 1,
        nickname: `User${i + 1}`,
        correct_count: 10 - i,
        total_response_time_ms: 5000 + i * 100,
        answered_count: 10,
      }));

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      mockSupabase.limit.mockResolvedValueOnce({ data: mockPeriodData, error: null });
      mockSupabase.limit.mockResolvedValueOnce({ data: mockPeriodData, error: null });

      mockCreateAdminClient.mockResolvedValue(mockSupabase as any);

      // Act
      const result = await getRankings(eventId, periodId);

      // Assert
      expect(result?.period.entries).toHaveLength(10);
      expect(result?.event.entries).toHaveLength(10);

      // ランク番号が正しく付与されていることを確認
      result?.period.entries.forEach((entry, index) => {
        expect(entry.rank).toBe(index + 1);
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('ピリオドランキング取得エラー時はnullを返す', async () => {
      // Arrange
      const eventId = 1;
      const periodId = 1;

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      mockSupabase.limit.mockResolvedValueOnce({
        data: null,
        error: new Error('Database error'),
      });

      mockCreateAdminClient.mockResolvedValue(mockSupabase as any);

      // Act
      const result = await getRankings(eventId, periodId);

      // Assert
      expect(result).toBeNull();
    });

    it('イベント全体ランキング取得エラー時はnullを返す', async () => {
      // Arrange
      const eventId = 1;
      const periodId = 1;

      const mockPeriodData = [
        {
          user_id: 1,
          nickname: 'Alice',
          correct_count: 10,
          total_response_time_ms: 5000,
          answered_count: 10,
        },
      ];

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      // 最初のfrom呼び出しは成功
      mockSupabase.limit.mockResolvedValueOnce({ data: mockPeriodData, error: null });
      // 2番目のfrom呼び出しはエラー
      mockSupabase.limit.mockResolvedValueOnce({
        data: null,
        error: new Error('Database error'),
      });

      mockCreateAdminClient.mockResolvedValue(mockSupabase as any);

      // Act
      const result = await getRankings(eventId, periodId);

      // Assert
      expect(result).toBeNull();
    });

  });

  describe('Supabase API呼び出しの確認', () => {
    it('正しいパラメータでクエリを実行する', async () => {
      // Arrange
      const eventId = 1;
      const periodId = 2;

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      mockSupabase.limit.mockResolvedValueOnce({ data: [], error: null });
      mockSupabase.limit.mockResolvedValueOnce({ data: [], error: null });

      mockCreateAdminClient.mockResolvedValue(mockSupabase as any);

      // Act
      await getRankings(eventId, periodId);

      // Assert
      // period_rankingsへのクエリ確認
      expect(mockSupabase.from).toHaveBeenCalledWith('period_rankings');
      expect(mockSupabase.select).toHaveBeenCalledWith(
        'user_id, nickname, correct_count, total_response_time_ms, answered_count'
      );

      // eq呼び出しの確認
      const eqCalls = mockSupabase.eq.mock.calls;
      expect(eqCalls).toEqual(
        expect.arrayContaining([
          expect.arrayContaining([expect.stringContaining('event_id'), eventId]),
          expect.arrayContaining([expect.stringContaining('period_id'), periodId]),
        ])
      );

      // order呼び出しの確認
      expect(mockSupabase.order).toHaveBeenCalledWith('correct_count', { ascending: false });
      expect(mockSupabase.order).toHaveBeenCalledWith('total_response_time_ms', { ascending: true });

      // limit呼び出しの確認
      expect(mockSupabase.limit).toHaveBeenCalledWith(10);
    });

    it('event_rankingsテーブルに対しても正しくクエリを実行する', async () => {
      // Arrange
      const eventId = 1;
      const periodId = 1;

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      mockSupabase.limit.mockResolvedValueOnce({ data: [], error: null });
      mockSupabase.limit.mockResolvedValueOnce({ data: [], error: null });

      mockCreateAdminClient.mockResolvedValue(mockSupabase as any);

      // Act
      await getRankings(eventId, periodId);

      // Assert
      // 2回のfrom呼び出しを確認
      expect(mockSupabase.from).toHaveBeenCalledTimes(2);
      expect(mockSupabase.from).toHaveBeenNthCalledWith(1, 'period_rankings');
      expect(mockSupabase.from).toHaveBeenNthCalledWith(2, 'event_rankings');
    });
  });

  describe('データ変換', () => {
    it('蛇の字のデータベース列名をキャメルケースに変換する', async () => {
      // Arrange
      const eventId = 1;
      const periodId = 1;

      const mockPeriodData = [
        {
          user_id: 100,
          nickname: 'TestUser',
          correct_count: 5,
          total_response_time_ms: 3000,
          answered_count: 10,
        },
      ];

      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn(),
      };

      mockSupabase.limit.mockResolvedValueOnce({ data: mockPeriodData, error: null });
      mockSupabase.limit.mockResolvedValueOnce({ data: [], error: null });

      mockCreateAdminClient.mockResolvedValue(mockSupabase as any);

      // Act
      const result = await getRankings(eventId, periodId);

      // Assert
      const entry = result?.period.entries[0];
      expect(entry).toEqual({
        rank: 1,
        userId: 100,
        nickname: 'TestUser',
        correctCount: 5,
        totalResponseTimeMs: 3000,
        answeredCount: 10,
      });

      // キャメルケースプロパティが存在することを確認
      expect(entry).toHaveProperty('userId');
      expect(entry).toHaveProperty('correctCount');
      expect(entry).toHaveProperty('totalResponseTimeMs');
      expect(entry).toHaveProperty('answeredCount');
    });
  });
});
