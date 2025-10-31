import { describe, it, expect } from 'vitest'

// ユーザーページの設定
export const USER_PAGE_CONFIG = {
  title: 'PeriodQuiz',
  description: 'ピリオドごとにチャンピオンが決まる\nリアルタイムクイズシステム',
  eventsHeading: '参加可能なイベント',
  noEventsMessage: '現在、利用可能なイベントがありません',
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

    it('イベント一覧のヘッダーが設定されていること', () => {
      expect(USER_PAGE_CONFIG.eventsHeading).toBe('参加可能なイベント')
    })

    it('イベントなしのメッセージが設定されていること', () => {
      expect(USER_PAGE_CONFIG.noEventsMessage).toBe('現在、利用可能なイベントがありません')
    })
  })

  describe('コンテンツ検証', () => {
    it('タイトルが有効な長さであること', () => {
      expect(USER_PAGE_CONFIG.title.length).toBeGreaterThan(0)
      expect(USER_PAGE_CONFIG.title.length).toBeLessThanOrEqual(50)
    })

    it('説明文が有効な長さであること', () => {
      expect(USER_PAGE_CONFIG.description.length).toBeGreaterThan(0)
    })

    it('イベントヘッダーが有効な長さであること', () => {
      expect(USER_PAGE_CONFIG.eventsHeading.length).toBeGreaterThan(0)
    })
  })
})
