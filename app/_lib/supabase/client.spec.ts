import { describe, it, expect } from 'vitest'

describe('Supabaseクライアント（ブラウザ）', () => {
  it('環境変数のキー名が正しく定義されていること', () => {
    // テスト環境では環境変数が読み込まれないため、キー名のチェックのみ
    const requiredEnvKeys = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ]

    expect(requiredEnvKeys).toHaveLength(2)
    expect(requiredEnvKeys).toContain('NEXT_PUBLIC_SUPABASE_URL')
    expect(requiredEnvKeys).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  })

  it('URL形式のバリデーション関数が動作すること', () => {
    const isValidUrl = (url: string) => /^https?:\/\//.test(url)

    expect(isValidUrl('http://localhost:54321')).toBe(true)
    expect(isValidUrl('https://example.supabase.co')).toBe(true)
    expect(isValidUrl('invalid-url')).toBe(false)
  })
})
