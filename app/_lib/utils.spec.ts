import { describe, it, expect } from 'vitest'

/**
 * ニックネームをフォーマットする関数
 * - 前後の空白を削除
 * - 最大20文字に制限
 */
export function formatNickname(nickname: string): string {
  return nickname.trim().slice(0, 20)
}

/**
 * 回答時間（ミリ秒）を秒に変換する関数
 */
export function msToSeconds(ms: number): number {
  return Math.round(ms / 1000)
}

describe('ユーティリティ関数', () => {
  describe('formatNickname', () => {
    it('前後の空白が削除されること', () => {
      expect(formatNickname('  test  ')).toBe('test')
      expect(formatNickname('\n\ttest\t\n')).toBe('test')
    })

    it('20文字を超える場合は切り詰められること', () => {
      const longNickname = 'a'.repeat(25)
      expect(formatNickname(longNickname)).toHaveLength(20)
    })

    it('空文字列を処理できること', () => {
      expect(formatNickname('')).toBe('')
      expect(formatNickname('   ')).toBe('')
    })

    it('日本語を正しく処理できること', () => {
      expect(formatNickname('  田中太郎  ')).toBe('田中太郎')
      expect(formatNickname('あ'.repeat(25))).toHaveLength(20)
    })
  })

  describe('msToSeconds', () => {
    it('ミリ秒を秒に変換できること', () => {
      expect(msToSeconds(1000)).toBe(1)
      expect(msToSeconds(5000)).toBe(5)
      expect(msToSeconds(10000)).toBe(10)
    })

    it('小数点以下を四捨五入すること', () => {
      expect(msToSeconds(1499)).toBe(1)
      expect(msToSeconds(1500)).toBe(2)
      expect(msToSeconds(1501)).toBe(2)
    })

    it('0を処理できること', () => {
      expect(msToSeconds(0)).toBe(0)
    })
  })
})
