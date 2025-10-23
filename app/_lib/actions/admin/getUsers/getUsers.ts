'use server';

import { createClient } from '@/app/_lib/supabase/server';

interface UserWithEvents {
  id: number;
  nickname: string;
  eventNames: string[];
  createdAt: string;
  connectionStatus: 'connected' | 'disconnected';
}

export async function getUsers(): Promise<UserWithEvents[]> {
  const supabase = await createClient();

  // ユーザーとイベント情報を取得
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      nickname,
      created_at,
      event_id,
      events (
        name
      )
    `)
    .order('id', { ascending: true });

  if (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('ユーザー情報の取得に失敗しました');
  }

  // イベント名をグループ化
  const userMap = new Map<number, UserWithEvents>();

  interface UserData {
    id: number;
    nickname: string;
    created_at: string;
    events: { name: string } | null;
  }

  (data as UserData[] || []).forEach((user: UserData) => {
    if (!userMap.has(user.id)) {
      userMap.set(user.id, {
        id: user.id,
        nickname: user.nickname,
        eventNames: [],
        createdAt: user.created_at,
        connectionStatus: Math.random() > 0.5 ? 'connected' : 'disconnected', // ダミーデータ
      });
    }

    const userEntry = userMap.get(user.id)!;
    if (user.events?.name) {
      userEntry.eventNames.push(user.events.name);
    }
  });

  return Array.from(userMap.values());
}
