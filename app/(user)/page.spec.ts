import { describe, it, expect } from 'vitest'

// ユーザーページの設定
export const USER_PAGE_CONFIG = {
  title: 'PeriodQuiz',
  description: 'ピリオドごとにチャンピオンが決まる\nリアルタイムクイズシステム',
  nicknameLabel: 'ニックネーム',
  nicknamePlaceholder: 'ニックネームを入力してください',
  nicknameMaxLength: 20,
  submitButtonText: '参加する',
} as const

describe('ユーザーページ', () => {
  describe('ページ設定', () => {
    it('タイトルが正しく設定されていること', () => {
      expect(USER_PAGE_CONFIG.title).toBe('PeriodQuiz')
    })

    it('説明文が含まれていること', () => {
      expect(USER_PAGE_CONFIG.description).toContain('ピリオドごとにチャンピオンが決まる')
      expect(USER_PAGE_CONFIG.description).toContain('リアルタイムクイズシステム')
    })

    it('ニックネームの最大文字数が20文字に設定されていること', () => {
      expect(USER_PAGE_CONFIG.nicknameMaxLength).toBe(20)
    })

    it('フォームのラベルとプレースホルダーが設定されていること', () => {
      expect(USER_PAGE_CONFIG.nicknameLabel).toBe('ニックネーム')
      expect(USER_PAGE_CONFIG.nicknamePlaceholder).toBe('ニックネームを入力してください')
    })

    it('送信ボタンのテキストが設定されていること', () => {
      expect(USER_PAGE_CONFIG.submitButtonText).toBe('参加する')
    })
  })

  describe('バリデーション', () => {
    it('ニックネームの最大文字数が妥当であること', () => {
      // 最大文字数は1文字以上100文字以下であるべき
      expect(USER_PAGE_CONFIG.nicknameMaxLength).toBeGreaterThan(0)
      expect(USER_PAGE_CONFIG.nicknameMaxLength).toBeLessThanOrEqual(100)
    })
  })
})
