import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkNicknameAvailability } from './checkNicknameAvailability';

// Mock modules
vi.mock('@/app/_lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/app/_lib/supabase/server';

describe('checkNicknameAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('バリデーション', () => {
    it('空のニックネームではエラーを返す', async () => {
      const result = await checkNicknameAvailability(1, '');

      expect(result.available).toBe(false);
      if (!result.available) {
        expect(result.error).toBe('ニックネームを入力してください');
      }
    });

    it('20文字を超えるニックネームではエラーを返す', async () => {
      const result = await checkNicknameAvailability(1, 'あ'.repeat(21));

      expect(result.available).toBe(false);
      if (!result.available) {
        expect(result.error).toBe('ニックネームは20文字以内で入力してください');
      }
    });

    it('使用禁止文字を含むニックネームではエラーを返す', async () => {
      const result = await checkNicknameAvailability(1, 'テスト@太郎');

      expect(result.available).toBe(false);
      if (!result.available) {
        expect(result.error).toBe('英数字、ひらがな、カタカナ、漢字のみ使用できます');
      }
    });

    it('絵文字を含むニックネームではエラーを返す', async () => {
      const result = await checkNicknameAvailability(1, 'テスト😀太郎');

      expect(result.available).toBe(false);
      if (!result.available) {
        expect(result.error).toBe('英数字、ひらがな、カタカナ、漢字のみ使用できます');
      }
    });
  });

  describe('重複チェック', () => {
    it('ニックネームが利用可能な場合はtrueを返す', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await checkNicknameAvailability(1, 'テスト太郎');

      expect(result.available).toBe(true);
    });

    it('ニックネームが既に使用されている場合はエラーを返す', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ 
                  data: { id: 1 }, 
                  error: null 
                }),
              }),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const result = await checkNicknameAvailability(1, 'テスト太郎');

      expect(result.available).toBe(false);
      if (!result.available) {
        expect(result.error).toBe('このニックネームは既に使用されています');
      }
    });
  });
});
