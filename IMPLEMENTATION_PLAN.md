# Quiz画面セッション管理のContext化 - 実装計画

## 概要
`/quiz` 配下で Server Layout でセッション検証 → Client Layout で heartbeat + Context 一元管理

---

## 主な変更点

| 項目 | 変更前 | 変更後 |
|------|--------|--------|
| セッション検証 | `/events/[eventId]/page.tsx` | `/quiz/layout.tsx` (Server) |
| heartbeat管理 | 各ページで個別 | `/quiz/_components/QuizClientLayout.tsx` |
| Context | なし | `SessionContext` (値は常にvalid) |
| 初期化 | useEffect (非同期) | Server側で完了 → props経由 |
| ステータス表示 | 各ページ | 右下固定notification |

---

## 実装ファイル

### フェーズ1: Context層構築

#### `app/(user)/quiz/_context/SessionContext.tsx` (新規)
```typescript
'use client';

import { createContext, useContext } from 'react';
import type { SessionHeartbeatStatus } from '@/app/_lib/hooks/useSessionHeartbeat';

interface SessionContextValue {
  eventId: number;
  userId: number;
  heartbeatStatus: SessionHeartbeatStatus;
  heartbeatError: Error | null;
}

export const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);

export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within SessionContext.Provider');
  }
  return context;
}
```

#### `app/(user)/quiz/_components/SessionStatusNotification.tsx` (新規)
```typescript
'use client';

import type { SessionHeartbeatStatus } from '@/app/_lib/hooks/useSessionHeartbeat';

interface SessionStatusNotificationProps {
  status: SessionHeartbeatStatus;
  error: Error | null;
}

function getStatusColor(status: SessionHeartbeatStatus): string {
  const colors = {
    connected: 'bg-green-100 border-green-300',
    updating: 'bg-yellow-100 border-yellow-300',
    error: 'bg-red-100 border-red-300',
    idle: 'bg-gray-100 border-gray-300',
  };
  return colors[status] || colors.idle;
}

function getStatusText(status: SessionHeartbeatStatus): string {
  const texts = {
    connected: '✅ セッション確立中',
    updating: '🔄 セッション更新中...',
    error: '❌ セッション接続エラー',
    idle: '⏳ セッション初期化中...',
  };
  return texts[status] || texts.idle;
}

export function SessionStatusNotification({
  status,
  error,
}: SessionStatusNotificationProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className={`p-4 rounded-lg border-2 shadow-lg ${getStatusColor(status)}`}>
        <p className="text-sm font-semibold">{getStatusText(status)}</p>
      </div>
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            セッション接続に問題があります。ページをリロードしてください。
          </p>
        </div>
      )}
    </div>
  );
}
```

#### `app/(user)/quiz/_components/QuizClientLayout.tsx` (新規)
```typescript
'use client';

import { ReactNode, useState } from 'react';
import { useSessionHeartbeat } from '@/app/_lib/hooks/useSessionHeartbeat';
import { SessionContext } from '../_context/SessionContext';
import { SessionStatusNotification } from './SessionStatusNotification';
import type { SessionHeartbeatStatus } from '@/app/_lib/hooks/useSessionHeartbeat';

interface QuizClientLayoutProps {
  initialEventId: number;
  initialUserId: number;
  children: ReactNode;
}

export function QuizClientLayout({
  initialEventId,
  initialUserId,
  children,
}: QuizClientLayoutProps) {
  const [heartbeatStatus, setHeartbeatStatus] = useState<SessionHeartbeatStatus>('idle');
  const [heartbeatError, setHeartbeatError] = useState<Error | null>(null);

  useSessionHeartbeat({
    eventId: initialEventId,
    userId: initialUserId,
    enabled: true,
    heartbeatInterval: 15 * 1000,
    onStatusChange: setHeartbeatStatus,
    onError: setHeartbeatError,
  });

  return (
    <SessionContext.Provider
      value={{
        eventId: initialEventId,
        userId: initialUserId,
        heartbeatStatus,
        heartbeatError,
      }}
    >
      {children}
      <SessionStatusNotification status={heartbeatStatus} error={heartbeatError} />
    </SessionContext.Provider>
  );
}
```

### フェーズ2: Layout構築

#### `app/(user)/quiz/layout.tsx` (新規)
```typescript
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { validateSession } from '@/app/_lib/actions/user';
import { QuizClientLayout } from './_components/QuizClientLayout';

interface QuizLayoutProps {
  children: ReactNode;
}

export default async function QuizLayout({ children }: QuizLayoutProps) {
  const session = await validateSession();

  if (!session.valid) {
    redirect('/');
  }

  return (
    <QuizClientLayout
      initialEventId={session.user.event_id}
      initialUserId={session.user.id}
    >
      {children}
    </QuizClientLayout>
  );
}
```

### フェーズ3: ページ作成

#### `app/(user)/quiz/waiting/page.tsx` (新規)
```typescript
'use client';

import { useSessionContext } from '../_context/SessionContext';

export default function WaitingPage() {
  const { eventId, userId } = useSessionContext();

  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">クイズを待機中...</h1>
        <p className="text-gray-600">管理者によるクイズ開始を待っています</p>
        <p className="text-xs text-gray-400 mt-4">E:{eventId} U:{userId}</p>
      </div>
    </main>
  );
}
```

#### `app/(user)/quiz/[quizId]/page.tsx` (新規)
```typescript
'use client';

import { useSessionContext } from '../_context/SessionContext';

type PageProps = {
  params: Promise<{ quizId: string }>;
};

export default async function QuizPage({ params }: PageProps) {
  const { quizId } = await params;
  const { eventId } = useSessionContext();

  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">問題 {quizId}</h1>
        <p className="text-gray-600">Event {eventId}</p>
      </div>
    </main>
  );
}
```

#### `app/(user)/quiz/result/page.tsx` (新規)
```typescript
'use client';

import { useSessionContext } from '../_context/SessionContext';

export default function ResultPage() {
  const { eventId } = useSessionContext();

  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">結果</h1>
        <p className="text-gray-600">Event {eventId}</p>
      </div>
    </main>
  );
}
```

### フェーズ4: 既存ファイル修正

#### `app/(user)/events/[eventId]/page.tsx` (修正)
セッション有効時のリダイレクト先を変更：
```typescript
// 修正前: redirect(`/events/${eventId}/waiting`);
// 修正後:
redirect('/quiz/waiting');
```

---

## 削除ファイル

- `app/(user)/events/[eventId]/waiting/` (ディレクトリ全削除)
  - `page.tsx`
  - `_components/SessionHeartbeatManager.tsx`
  - `_components/SessionStatusIndicator.tsx`

---

## 実装順序

```
1. _context/SessionContext.tsx 作成
2. _components/SessionStatusNotification.tsx 作成
3. _components/QuizClientLayout.tsx 作成
4. layout.tsx 作成
5. waiting/page.tsx 作成
6. [quizId]/page.tsx 作成
7. result/page.tsx 作成
8. /events/[eventId]/page.tsx のリダイレクト先修正
9. /events/[eventId]/waiting/ ディレクトリ削除
10. npm run build で確認
```

---

## 重要ポイント

- **Server Layout**: セッション検証 + リダイレクト
- **Client Layout**: useSessionHeartbeat + Context Provider
- **各Page**: Context から値を読み込むのみ
- **エラー**: Server Layout で redirect("/") で対応
- **nullチェック**: 不要（Server検証済み）

---

準備完了。実装を開始しますか？
