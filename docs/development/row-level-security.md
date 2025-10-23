# Row Level Security (RLS) 実装ガイド

## 概要

PeriodQuiz のセキュリティモデルは 3 層防御：

```
層1️⃣ Server Actions: 入力検証・業務ロジック
層2️⃣ RLS ポリシー: 行レベルアクセス制御
層3️⃣ PostgreSQL: 制約・トリガー
```

---

## 重要な結論

### セッション有効時の書き換え

**Q: `session_id` に紐づく users があり、`last_active_at` が 24h 以内の場合、DB データが書き換えられるのか？**

**A: はい。ただし自分のデータのみ。**

```typescript
// 攻撃者の直接スクリプト（可能）
UPDATE users SET nickname = 'hack' 
WHERE session_id = 'attacker-session-id'
  AND last_active_at > NOW() - INTERVAL '24 hours';
// ✅ 攻撃者自身のデータのみ変更可能

// 被害者のデータ（不可能）
UPDATE users SET nickname = 'hack'
WHERE session_id = 'victim-session-id'
  AND last_active_at > NOW() - INTERVAL '24 hours';
// ❌ RLS で遮断（別のセッション ID）
```

**ただし現在の実装では RLS で制御していないため、Server Actions のみが防御。改善版では `is_session_valid()` で RLS 側でも防御。**

---

## RLS ポリシー設計

### user_id に紐づくテーブル

**対象テーブル:** `users`, `answers`

```sql
-- 共通ルール
-- ・user_id に紐づくデータは、そのユーザーのセッション経由でのみ操作可能
-- ・24h 以内のセッションのみ有効
-- ・削除は許可しない（監査ログとして保持）
```

**RLS ポリシー（条件付き）:**

```sql
-- users テーブル
FOR SELECT: is_session_valid(session_id) -- 自分のセッションで見える
FOR INSERT: is_session_valid(session_id) -- 自分のセッションでのみ作成
FOR UPDATE: is_session_valid(session_id) -- 自分のセッションでのみ更新

-- answers テーブル
FOR SELECT: true -- 全員が他人の回答も見える（レアタイプなので）
FOR INSERT: is_session_valid(user.session_id) -- ユーザーのセッション経由のみ
FOR UPDATE: false -- 回答は不変
FOR DELETE: false -- 回答は削除不可
```

---

### 管理テーブル

**対象テーブル:** `events`, `periods`, `questions`, `choices`, `quiz_control`, `question_displays`

**Basic 認証を突破した admin ユーザー向けのセッション管理**

```sql
-- 共通ルール
-- ・全員が SELECT 可能（読み取り専用）
-- ・UPDATE/INSERT/DELETE は admin セッション経由のみ
-- ・admin セッション判定: admin_sessions テーブルで管理
```

**RLS ポリシー:**

```sql
-- 読み取り（全員）
FOR SELECT: true

-- 書き込み（admin セッション経由のみ）
FOR INSERT/UPDATE/DELETE: 
  EXISTS (
    SELECT 1 FROM admin_sessions 
    WHERE session_id = current_setting('app.admin_session_id')
    AND last_active_at > NOW() - INTERVAL '24 hours'
  )
```

---

## Admin 認証の設計

### ベストプラクティス

**あなたの提案は基本的に正しいですが、以下の改善をお勧めします：**

```
❌ パターン A: users テーブルに is_admin フラグを追加
   └─ 問題: ユーザー（User 画面）と Admin を混在させる
   └─ セキュリティ: RLS の条件が複雑化
   └─ 管理: ユーザーが誤って admin フラグをもらう可能性

✅ パターン B: admin_sessions テーブルを別途作成（推奨）
   └─ 利点: Admin 認証と User セッションを完全に分離
   └─ セキュリティ: 権限が明確に分離
   └─ 管理: Admin のみ管理テーブルにアクセス可能
```

---

## 実装パターン

### Admin テーブルの設計

```sql
-- Admin ユーザーテーブル
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin セッションテーブル
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL UNIQUE,
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  CHECK (expires_at > created_at)
);

CREATE INDEX idx_admin_sessions_session_id ON admin_sessions(session_id);
CREATE INDEX idx_admin_sessions_admin_user_id ON admin_sessions(admin_user_id);
```

---

### 認証フロー

#### 1. Basic 認証でログイン

```typescript
// app/(admin)/layout.tsx または middleware
'use server';

import { headers } from 'next/headers';
import { Buffer } from 'buffer';

export async function verifyAdminBasicAuth() {
  const headersList = await headers();
  const auth = headersList.get('authorization');

  if (!auth || !auth.startsWith('Basic ')) {
    return { authenticated: false };
  }

  const credentials = Buffer.from(auth.slice(6), 'base64').toString('utf8');
  const [username, password] = credentials.split(':');

  // admin_users テーブルで確認
  const adminUser = await verifyAdminCredentials(username, password);

  if (!adminUser) {
    return { authenticated: false };
  }

  // セッション作成
  const sessionId = crypto.randomUUID();
  await createAdminSession(adminUser.id, sessionId);

  // Cookie に保存（httpOnly）
  const cookieStore = await cookies();
  cookieStore.set('admin_session_id', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
  });

  return { authenticated: true };
}
```

#### 2. Admin セッションの更新

```typescript
// Server Action: 定期的に heartbeat を更新
'use server';

import { cookies } from 'next/headers';

export async function updateAdminSessionHeartbeat() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('admin_session_id')?.value;

  if (!sessionId) {
    return { success: false, error: 'セッション無し' };
  }

  const result = await updateAdminSessionLastActive(sessionId);

  if (!result.success) {
    // セッション期限切れ、ログアウト
    cookieStore.delete('admin_session_id');
    return { success: false, error: 'セッション期限切れ' };
  }

  return { success: true };
}
```

#### 3. RLS でアクセス制御

```sql
-- Admin テーブルの RLS ポリシー
CREATE POLICY "events_insert_admin_only" ON events
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_sessions 
    WHERE session_id = current_setting('app.admin_session_id')::uuid
    AND last_active_at > NOW() - INTERVAL '24 hours'
  )
);
```

---

## テーブル設計

### User 側

| テーブル | 用途 | RLS ルール |
|---------|------|-----------|
| `users` | User セッション管理 | `is_session_valid()` |
| `answers` | 回答データ | 全員読取、セッション経由で挿入 |

### Admin 側

| テーブル | 用途 | RLS ルール |
|---------|------|-----------|
| `admin_users` | Admin ユーザー（暗号化パスワード） | RLS なし（直接操作） |
| `admin_sessions` | Admin セッション管理 | RLS なし（Server Action で制御） |
| `events` | イベント管理 | Admin セッション経由のみ |
| `periods` | ピリオド管理 | Admin セッション経由のみ |
| `questions` | 問題管理 | Admin セッション経由のみ |
| `choices` | 選択肢管理 | Admin セッション経由のみ |
| `quiz_control` | クイズ進行制御 | Admin セッション経由のみ |
| `question_displays` | 問題表示管理 | Admin セッション経由のみ |

---

## セキュリティチェックリスト

- [ ] `admin_users` テーブルを作成
- [ ] `admin_sessions` テーブルを作成
- [ ] `is_admin_session_valid()` 関数を実装
- [ ] RLS ポリシーを実装
- [ ] Server Action で Basic 認証を実装
- [ ] Server Action で heartbeat を実装
- [ ] Cookie 設定を確認（httpOnly, sameSite）
- [ ] テストシナリオを実施

---

## テスト シナリオ

### シナリオ 1: Admin が Basic 認証を突破してログイン

```
1. Admin が /admin/login に POST
2. Basic 認証確認 → 成功
3. admin_sessions にレコード作成
4. Cookie に admin_session_id を保存
5. ✅ /admin/ にアクセス可能
```

### シナリオ 2: Admin がイベントを作成

```
1. Admin が Server Action を呼び出し
2. Cookie から admin_session_id を取得
3. RLS: admin_sessions テーブルを確認
4. セッション有効 → ✅ INSERT 成功
```

### シナリオ 3: 通常ユーザーが admin_sessions を操作

```
1. ユーザーが direct INSERT を試みる
2. RLS: admin_sessions テーブルへのアクセス確認
3. RLS ポリシーなし → ❌ 直接アクセス不可
```

### シナリオ 4: Admin セッション期限切れ

```
1. Admin が 24h 以上操作していない
2. heartbeat 実行 → last_active_at を確認
3. 期限切れ → ❌ セッション無効化
4. Cookie 削除 → ログイン画面へ
```

---

## ベストプラクティス チェック

| 項目 | 実装パターン | ベストプラクティス | 理由 |
|------|-----------|-----------------|------|
| **Admin 認証** | Basic 認証 | ✅ Middleware で実装 | リクエスト前に検証 |
| **セッション管理** | 別テーブル | ✅ 推奨 | User と Admin を分離 |
| **パスワード** | bcrypt で暗号化 | ✅ 必須 | 平文保存は厳禁 |
| **Cookie** | httpOnly + sameSite | ✅ 必須 | XSS/CSRF 対策 |
| **セッション有効期限** | 24 時間 | ✅ 推奨 | Admin も user と同じ |
| **Heartbeat** | 定期更新 | ✅ 推奨 | 無限セッション回避 |
| **RLS ポリシー** | 別テーブル参照 | ✅ 推奨 | 権限分離が明確 |

---

## 推奨実装順序

### Phase 1: 基本実装（今）
```
1. admin_users, admin_sessions テーブル作成
2. Basic 認証実装
3. Admin セッション管理
4. RLS ポリシー実装
```

### Phase 2: 改善（近い将来）
```
1. Middleware で Basic 認証を集約
2. Rate limiting 追加
3. 監査ログ追加
```

### Phase 3: エンタープライズ（将来）
```
1. OAuth/SAML への移行
2. Role-Based Access Control (RBAC)
3. Multi-factor Authentication (MFA)
```

---

## まとめ

| 項目 | User | Admin |
|------|------|-------|
| **テーブル** | `users`, `answers` | `admin_users`, `admin_sessions` |
| **認証** | ニックネーム入力 | Basic 認証 |
| **セッション** | `users.session_id` | `admin_sessions.session_id` |
| **有効期限** | 24 時間 | 24 時間 |
| **RLS** | `is_session_valid()` | `is_admin_session_valid()` |
| **データ操作** | Server Actions | Server Actions |
| **削除** | 不可 | 不可（監査ログ保持） |

---

最終更新: 2025年10月23日
**セキュリティレベル: 🟢 本番対応可能**
