import { describe, it, expect } from 'vitest'

// ダッシュボードカードの設定
export const DASHBOARD_CARDS = [
  {
    id: 'events',
    title: 'イベント管理',
    status: '準備中',
    color: 'blue',
  },
  {
    id: 'questions',
    title: '問題管理',
    status: '準備中',
    color: 'green',
  },
  {
    id: 'control',
    title: '進行制御',
    status: '準備中',
    color: 'purple',
  },
] as const

describe('管理画面ダッシュボード', () => {
  describe('ダッシュボードカード設定', () => {
    it('3つのカードが定義されていること', () => {
      expect(DASHBOARD_CARDS).toHaveLength(3)
    })

    it('すべてのカードに必要なプロパティが含まれていること', () => {
      DASHBOARD_CARDS.forEach((card) => {
        expect(card).toHaveProperty('id')
        expect(card).toHaveProperty('title')
        expect(card).toHaveProperty('status')
        expect(card).toHaveProperty('color')
      })
    })

    it('各カードのIDがユニークであること', () => {
      const ids = DASHBOARD_CARDS.map((card) => card.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(DASHBOARD_CARDS.length)
    })

    it('イベント管理カードが正しく設定されていること', () => {
      const eventsCard = DASHBOARD_CARDS.find((card) => card.id === 'events')
      expect(eventsCard).toBeDefined()
      expect(eventsCard?.title).toBe('イベント管理')
      expect(eventsCard?.color).toBe('blue')
    })

    it('問題管理カードが正しく設定されていること', () => {
      const questionsCard = DASHBOARD_CARDS.find((card) => card.id === 'questions')
      expect(questionsCard).toBeDefined()
      expect(questionsCard?.title).toBe('問題管理')
      expect(questionsCard?.color).toBe('green')
    })

    it('進行制御カードが正しく設定されていること', () => {
      const controlCard = DASHBOARD_CARDS.find((card) => card.id === 'control')
      expect(controlCard).toBeDefined()
      expect(controlCard?.title).toBe('進行制御')
      expect(controlCard?.color).toBe('purple')
    })
  })
})
