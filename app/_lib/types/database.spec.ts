import { describe, it, expect } from 'vitest'
import type { Database } from './database'

describe('Database型定義', () => {
  it('usersテーブルの型が正しく定義されていること', () => {
    const user: Database['public']['Tables']['users']['Row'] = {
      id: 'test-id',
      event_id: 'event-id',
      nickname: 'テストユーザー',
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
    }

    expect(user.nickname).toBe('テストユーザー')
    expect(user.event_id).toBe('event-id')
  })

  it('usersテーブルのInsert型が動作すること', () => {
    type User = Database['public']['Tables']['users']['Insert']

    const newUser: User = {
      event_id: 'event-123',
      nickname: '新規ユーザー',
    }

    expect(newUser.nickname).toBe('新規ユーザー')
    expect(newUser.event_id).toBe('event-123')
  })

  it('answersテーブルの型が正しく定義されていること', () => {
    const answer: Database['public']['Tables']['answers']['Row'] = {
      id: 'answer-id',
      user_id: 'user-id',
      question_id: 'question-id',
      choice_id: 'choice-id',
      is_correct: true,
      answered_at: new Date().toISOString(),
      response_time_ms: 5000,
    }

    expect(answer.response_time_ms).toBe(5000)
    expect(answer.user_id).toBe('user-id')
    expect(answer.is_correct).toBe(true)
  })
})
