import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { registerUser } from './registerUser';

// Mock modules
vi.mock('@/app/_lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/app/_lib/actions/user/canRegisterNewUser', () => ({
  canRegisterNewUser: vi.fn(),
}));

import { createClient } from '@/app/_lib/supabase/server';
import { cookies } from 'next/headers';
import { canRegisterNewUser } from '@/app/_lib/actions/user/canRegisterNewUser';

describe('registerUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('バリデーション', () => {
    it('空のニックネームではエラーを返す', async () => {
      const result = await registerUser(1, '');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('ニックネームを入力してください');
      }
    });

    it('20文字を超えるニックネームではエラーを返す', async () => {
      const result = await registerUser(1, 'あ'.repeat(21));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('ニックネームは20文字以内で入力してください');
      }
    });

    it('使用禁止文字を含むニックネームではエラーを返す', async () => {
      const result = await registerUser(1, 'テスト@太郎');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('英数字、ひらがな、カタカナ、漢字のみ使用できます');
      }
    });

    it('絵文字を含むニックネームではエラーを返す', async () => {
      const result = await registerUser(1, 'テスト😀太郎');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('英数字、ひらがな、カタカナ、漢字のみ使用できます');
      }
    });
  });

  describe('登録可能性チェック', () => {
    it('登録が不可の場合はエラーを返す', async () => {
      const canRegisterMock = vi.mocked(canRegisterNewUser);
      canRegisterMock.mockResolvedValue({
        canRegister: false,
        reason: 'イベントは登録を受け付けていません',
      });

      const result = await registerUser(1, 'テスト太郎');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('イベントは登録を受け付けていません');
      }
    });
  });

  describe('ユーザー登録', () => {
    it('成功時にユーザーを登録しセッションを設定する', async () => {
      const mockUser = {
        id: 1,
        event_id: 1,
        nickname: 'テスト太郎',
        session_id: 'test-session-id-uuid',
        created_at: '2025-10-19T00:00:00Z',
        last_active_at: '2025-10-19T00:00:00Z',
      };

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
      vi.mocked(canRegisterNewUser).mockResolvedValue({
        canRegister: true,
      });

      const mockCookieStore = {
        set: vi.fn(),
      };
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const result = await registerUser(1, 'テスト太郎');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.user.nickname).toBe('テスト太郎');
        expect(result.sessionId).toBeDefined();
      }

      // Cookie が設定されたか確認
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'period_quiz_session',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 86400,
          path: '/',
        })
      );

      // Supabase insert が呼ばれたか確認
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockSupabase.from().insert).toHaveBeenCalled();
    });

    it('重複エラー (23505) 時に適切なメッセージを返す', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: '23505', message: 'duplicate key' },
              }),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
      vi.mocked(canRegisterNewUser).mockResolvedValue({
        canRegister: true,
      });

      const result = await registerUser(1, 'テスト太郎');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('このニックネームは既に使用されています');
      }
    });

    it('その他のデータベースエラー時に対応する', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'INTERNAL_ERROR', message: 'database error' },
              }),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
      vi.mocked(canRegisterNewUser).mockResolvedValue({
        canRegister: true,
      });

      const result = await registerUser(1, 'テスト太郎');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('データベース処理に失敗しました');
      }
    });

    it('ユーザー作成後、null が返された場合はエラーを返す', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
      vi.mocked(canRegisterNewUser).mockResolvedValue({
        canRegister: true,
      });

      const result = await registerUser(1, 'テスト太郎');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('データベース処理に失敗しました');
      }
    });

    it('cookie が正しく設定される', async () => {
      const mockUser = {
        id: 1,
        event_id: 1,
        nickname: 'テスト太郎',
        session_id: 'test-uuid',
        created_at: '2025-10-19T00:00:00Z',
        last_active_at: '2025-10-19T00:00:00Z',
      };

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
      vi.mocked(canRegisterNewUser).mockResolvedValue({
        canRegister: true,
      });

      const mockCookieStore = {
        set: vi.fn(),
      };
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      await registerUser(1, 'テスト太郎');

      const cookieCall = vi.mocked(mockCookieStore.set).mock.calls[0];
      // Cookie の設定が呼ばれたことを確認
      expect(mockCookieStore.set).toHaveBeenCalled();
      expect(cookieCall[0]).toBe('period_quiz_session');
      expect(typeof cookieCall[1]).toBe('string');
      expect(cookieCall[2]).toHaveProperty('httpOnly', true);
      expect(cookieCall[2]).toHaveProperty('sameSite', 'lax');
    });
  });

  describe('統合テスト', () => {
    it('正常系: ニックネーム入力 → 検証 → 登録 → セッション保存', async () => {
      const mockUser = {
        id: 1,
        event_id: 1,
        nickname: 'テスト太郎',
        session_id: 'test-session-id',
        created_at: '2025-10-19T00:00:00Z',
        last_active_at: '2025-10-19T00:00:00Z',
      };

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
            }),
          }),
        }),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);
      vi.mocked(canRegisterNewUser).mockResolvedValue({
        canRegister: true,
      });

      const mockCookieStore = {
        set: vi.fn(),
      };
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      // 1. ニックネーム入力が有効か検証
      const result = await registerUser(1, 'テスト太郎');

      // 2. 登録が成功したか確認
      expect(result.success).toBe(true);

      if (result.success) {
        // 3. ユーザー情報が正しいか確認
        expect(result.user.nickname).toBe('テスト太郎');
        expect(result.user.event_id).toBe(1);

        // 4. セッションIDが生成されたか確認
        expect(result.sessionId).toBeDefined();
        expect(typeof result.sessionId).toBe('string');
        expect(result.sessionId.length).toBeGreaterThan(0);

        // 5. Cookie が設定されたか確認
        expect(mockCookieStore.set).toHaveBeenCalled();
      }
    });
  });
});
