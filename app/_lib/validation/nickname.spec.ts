import { describe, it, expect } from 'vitest';
import { nicknameSchema } from './nickname';

describe('nicknameSchema', () => {
  describe('valid nicknames', () => {
    it('should accept alphanumeric characters', () => {
      const result = nicknameSchema.safeParse({ nickname: 'User123' });
      expect(result.success).toBe(true);
    });

    it('should accept hiragana', () => {
      const result = nicknameSchema.safeParse({ nickname: 'たなか' });
      expect(result.success).toBe(true);
    });

    it('should accept katakana', () => {
      const result = nicknameSchema.safeParse({ nickname: 'タナカ' });
      expect(result.success).toBe(true);
    });

    it('should accept kanji', () => {
      const result = nicknameSchema.safeParse({ nickname: '田中太郎' });
      expect(result.success).toBe(true);
    });

    it('should accept mixed characters', () => {
      const result = nicknameSchema.safeParse({ nickname: '太郎123ABC' });
      expect(result.success).toBe(true);
    });

    it('should accept 1 character', () => {
      const result = nicknameSchema.safeParse({ nickname: 'A' });
      expect(result.success).toBe(true);
    });

    it('should accept 20 characters', () => {
      const result = nicknameSchema.safeParse({
        nickname: '12345678901234567890',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid nicknames', () => {
    it('should reject empty string', () => {
      const result = nicknameSchema.safeParse({ nickname: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'ニックネームを入力してください'
        );
      }
    });

    it('should reject more than 20 characters', () => {
      const result = nicknameSchema.safeParse({
        nickname: '123456789012345678901',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'ニックネームは20文字以内で入力してください'
        );
      }
    });

    it('should reject spaces', () => {
      const result = nicknameSchema.safeParse({ nickname: 'User 123' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '英数字、ひらがな、カタカナ、漢字のみ使用できます'
        );
      }
    });

    it('should reject symbols', () => {
      const result = nicknameSchema.safeParse({ nickname: 'User@123' });
      expect(result.success).toBe(false);
    });

    it('should reject emojis', () => {
      const result = nicknameSchema.safeParse({ nickname: 'User😀' });
      expect(result.success).toBe(false);
    });

    it('should reject hyphens', () => {
      const result = nicknameSchema.safeParse({ nickname: 'User-123' });
      expect(result.success).toBe(false);
    });

    it('should reject underscores', () => {
      const result = nicknameSchema.safeParse({ nickname: 'User_123' });
      expect(result.success).toBe(false);
    });
  });
});
