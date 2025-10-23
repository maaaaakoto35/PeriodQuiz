# Admin Basic 認証実装ガイド

## 概要

Admin 画面へのアクセスを環境変数ベースの Basic 認証で保護します。セッション機構により、一度認証すれば 1 週間は再認証が不要です。

---

## セキュリティアーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                   Admin Browser                         │
│  1. Basic 認証ヘッダ送信                                 │
│  2. 認証成功 → admin_session_id Cookie                  │
│  3. 以降: Cookie で認証                                  │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Server Actions                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │ verifyAdminCredentials                          │   │
│  │ - 環境変数と認証情報を比較                       │   │
│  │ - タイミング攻撃対策済み                         │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ createAdminSession                              │   │
│  │ - admin_users に自動作成                         │   │
│  │ - admin_sessions レコード作成                    │   │
│  │ - 1 週間有効なセッション                         │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ checkAdminAuth                                  │   │
│  │ - 既存セッション確認                             │   │
│  │ - ハートビート更新                               │   │
│  │ - Basic 認証フォールバック                       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │    Supabase     │
         │  - RLS ポリシー  │
         │  - 行レベル保護  │
         └─────────────────┘
```

---

## 認証フロー

### 1. Initial Access (初回アクセス)

```
Admin Browser                         Server
    │                                  │
    ├─ GET /admin ────────────────────>│
    │                                  │
    │ checkAdminAuth() called         │
    │  - session_id Cookie 確認       │
    │  - ない場合: Authorization ヘッダ確認
    │                                  │
    │<─── No session/auth header ──────┤
    │                                  │
    ├─ Prompt for Basic Auth ─────────>│
    │ (AdminAuthWrapper)              │
    │                                  │
    ├─ Retry with Authorization header>│
    │ (Base64: admin:password)        │
    │                                  │
    │ verifyAdminCredentials()        │
    │ createAdminSession()            │
    │ Set admin_session_id Cookie    │
    │                                  │
    │<─── Set-Cookie: admin_session_id ┤
    │<─── Redirect /admin ────────────-│
    │                                  │
    ├─ GET /admin ────────────────────>│
    │ (with admin_session_id Cookie) │
    │                                  │
    │ checkAdminAuth() called         │
    │  - session_id Cookie 確認      │
    │  - DB で有効性確認              │
    │  - ハートビート更新             │
    │                                  │
    │<─── Admin Page ────────────────-│
    │                                  │
```

### 2. Subsequent Access (以降のアクセス)

```
Admin Browser                         Server
    │                                  │
    ├─ GET /admin ────────────────────>│
    │ (with admin_session_id Cookie) │
    │                                  │
    │ checkAdminAuth() called         │
    │  - session_id Cookie 確認      │
    │  - 有効か DB で確認             │
    │  - last_active_at 更新          │
    │                                  │
    │<─── Admin Page ────────────────-│
    │                                  │
```

### 3. Session Expiry (セッション期限切れ)

```
Admin Browser                         Server
    │                                  │
    ├─ GET /admin ────────────────────>│
    │ (with expired admin_session_id) │
    │                                  │
    │ checkAdminAuth() called         │
    │  - session_id Cookie 確認      │
    │  - DB で有効性確認              │
    │  - expires_at > NOW() → false  │
    │  - Cookie 削除                  │
    │  - Authorization ヘッダ確認     │
    │  - ない → エラー                 │
    │                                  │
    │<─── Unauthenticated Error ─────-│
    │                                  │
    ├─ Prompt for Basic Auth ─────────>│
    │ (AdminAuthWrapper)              │
    │                                  │
```

---

## 環境変数設定

### 開発環境

`.env.local` に以下を設定します：

```bash
# Supabase 設定
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Admin 認証
ADMIN_USERNAME=admin
ADMIN_PASSWORD=dev-password-123
```

### 本番環境

Vercel の環境変数設定から指定：

```
ADMIN_USERNAME=production-admin-username
ADMIN_PASSWORD=strong-production-password-here
```

**セキュリティ注意**:
- パスワードは最低 16 文字以上で、英数字・特殊文字を含める
- `ADMIN_PASSWORD` は絶対に Git にコミットしない
- 定期的にパスワード変更

---

## 実装詳細

### 1. Admin Users テーブル

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**特徴**:
- パスワードは保存しない（環境変数で管理）
- ユーザーネームのみで識別
- Basic 認証を突破した時点で自動作成

### 2. Admin Sessions テーブル

```sql
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL UNIQUE,
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  CHECK (expires_at > created_at)
);
```

**特徴**:
- セッション ID は UUID で完全にランダム
- `last_active_at`: ハートビート更新用（24 時間タイムアウト）
- `expires_at`: 絶対期限（7 日間）
- 両方の条件を満たすときのみ有効

### 3. RLS ポリシー

```sql
-- Admin セッション有効性チェック関数
CREATE OR REPLACE FUNCTION is_admin_session_valid(p_session_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_sessions 
    WHERE session_id = p_session_id 
    AND last_active_at > NOW() - INTERVAL '24 hours'
    AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**ポイント**:
- 24 時間のアクティビティタイムアウト
- 7 日の絶対有効期限
- データベース層での最終防御

---

## コード例

### Server Action: verifyAdminCredentials

```typescript
import { verifyAdminCredentials } from '@/app/_lib/actions/admin/verifyAdminCredentials';

// 環境変数と認証情報を比較
const result = await verifyAdminCredentials(username, password);

if (result.success) {
  // result.username: 認証済みのユーザー名
  console.log('Authenticated:', result.username);
} else {
  // result.error: エラーメッセージ
  console.error('Auth failed:', result.error);
}
```

### Server Action: createAdminSession

```typescript
import { createAdminSession } from '@/app/_lib/actions/admin/createAdminSession';

// セッション作成（ユーザーが なければ自動作成）
const result = await createAdminSession(username);

if (result.success) {
  // result.sessionId: セッション ID
  // この ID を Cookie に保存
} else {
  // result.error: エラーメッセージ
}
```

### Server Action: checkAdminAuth

```typescript
import { checkAdminAuth } from '@/app/_lib/actions/admin/checkAdminAuth';

// セッションまたは Basic 認証をチェック
const result = await checkAdminAuth();

if (result.authenticated) {
  // 認証済み
  console.log('Admin authenticated');
} else {
  // 未認証
  console.error('Error:', result.error);
}
```

### Client Component: AdminAuthWrapper

```typescript
'use client';

import { AdminAuthWrapper } from '@/app/(admin)/_components/AdminAuthWrapper';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthWrapper>{children}</AdminAuthWrapper>;
}
```

---

## トラブルシューティング

### Basic 認証が失敗する

**原因**: 環境変数が設定されていない

**解決**:
```bash
# .env.local を確認
echo $ADMIN_USERNAME
echo $ADMIN_PASSWORD

# 開発サーバー再起動
pnpm dev
```

### セッション Cookie が保存されない

**原因**: httpOnly Cookie の設定エラー

**確認方法**:
1. Chrome DevTools → Network → Cookie
2. `admin_session_id` が httpOnly フラグで保存されているか確認
3. Domain: localhost、Path: /admin

### セッション期限切れエラー

**原因**: 7 日以上経過している

**確認**:
```sql
SELECT 
  admin_user_id,
  session_id,
  expires_at,
  NOW() as current_time,
  expires_at > NOW() as is_valid
FROM admin_sessions
ORDER BY created_at DESC
LIMIT 5;
```

---

## パフォーマンス考慮事項

### セッション検証キャッシング

現在は毎回 DB 検証していますが、以下が最適化できます：

```typescript
// キャッシュレイヤーの追加候補
const SESSION_CACHE_TTL = 60; // 秒

const cachedSessions = new Map();

function getCachedSession(sessionId: string) {
  const cached = cachedSessions.get(sessionId);
  if (cached && Date.now() - cached.timestamp < SESSION_CACHE_TTL * 1000) {
    return cached.data;
  }
  return null;
}
```

### 接続数制限

Supabase 無料プランの接続数制限に注意：

```
無料プラン: 同時接続数 50
Pro プラン: 同時接続数 200+
```

120 人の同時接続を想定している場合は **Pro プラン推奨**。

---

## セキュリティチェックリスト

- ✅ パスワードは環境変数で管理
- ✅ httpOnly Cookie でセッション ID を保存
- ✅ Base64 デコード時の入力検証
- ✅ タイミング攻撃対策（string comparison）
- ✅ RLS ポリシーでデータベース層を保護
- ✅ アクティビティタイムアウト（24 時間）
- ✅ 絶対有効期限（7 日）
- ✅ 全 API は Server Actions でのみ実行

---

## 関連ドキュメント

- [Row Level Security ガイド](./row-level-security.md)
- [認証・セッション管理](./authentication.md)
- [アーキテクチャ設計](./architecture.md)

---

最終更新: 2025年10月23日
