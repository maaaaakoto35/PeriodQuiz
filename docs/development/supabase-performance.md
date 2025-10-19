# Supabase 接続パフォーマンスと最適化

## 概要

Server Actions が実行されるたびに `createClient()` が呼ばれていますが、これはパフォーマンス的に**問題ありません**。詳しく説明します。

---

## 📊 実装の現状

### コード例

```typescript
// app/_lib/actions/user/registerUser/registerUser.ts
export async function registerUser(eventId: number, nickname: string) {
  // ✅ 関数が実行されるたびに createClient() が呼ばれる
  const supabase = await createClient();
  
  const { data: user, error } = await supabase
    .from('users')
    .insert({ ... })
    .select()
    .single();
  
  // ...
}
```

### createClient() の実装

```typescript
// app/_lib/supabase/server.ts
export async function createClient() {
  const cookieStore = await cookies();
  
  // ✅ Supabase JavaScript SDK のクライアントオブジェクトを生成
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { ... } }
  );
}
```

---

## ✅ なぜ問題ないのか

### 1. **クライアントオブジェクトの生成は軽量**

- `createClient()` は **Supabase へのネットワーク接続を開始しない**
- 単に設定オブジェクト（URL、キー、Cookie ハンドラ）をメモリに保持するだけ
- 実際のネットワーク接続は `.from()` や `.select()` が呼ばれるまで遅延される

**コスト:**
```
createClient() 実行時間: ~1ms
実際のDB接続時間: ~50-200ms (ネットワークレイテンシ)
```

### 2. **Server Actions は独立した実行環境**

- Each Server Action call = 新しい実行コンテキスト
- グローバル変数でのコネクションプーリングができない設計
- これは **セキュリティとスケーラビリティの trade-off**

### 3. **Supabase SSR ライブラリの最適化**

```typescript
// createServerClient は最適化されている
const client = createServerClient(url, key, { cookies });
// ↓ 実際のコネクション確立はここで初めて行われる
const { data } = await client.from('users').select();
```

---

## 📈 現在のパフォーマンス

### 典型的な Server Action の実行時間

```
registerUser() 呼び出し
├─ createClient()       ~1ms      ✅ 軽量
├─ バリデーション      ~0-2ms    ✅ クライアント側
├─ canRegisterNewUser() ~50ms     (ネットワーク)
│  └─ DB接続 → イベント検証
├─ ユーザー挿入        ~50-100ms (ネットワーク)
└─ Cookie 設定         ~1ms      ✅ 軽量

合計: ~150-250ms
```

### 同時接続性

- **想定**: 120人同時参加
- **リクエスト頻度**: 回答時（1回/ユーザー）+ 重複チェック（複数回）
- **Supabase 接続数**: コネクションプーリング（Supabase 側で自動管理）

---

## ⚠️ 今後のスケーリング考慮事項

### 1. **キャッシング層が必要な場合**

```typescript
// ❌ 現在: キャッシュなし
export async function canRegisterNewUser(eventId: number) {
  const supabase = await createClient();
  
  const { data: event } = await supabase
    .from('events')
    .select('allow_registration')
    .eq('id', eventId)
    .single();
  
  // 毎回DB接続
  return { canRegister: event?.allow_registration };
}

// ✅ 将来: Redis キャッシング
import { redis } from '@/app/_lib/redis/client';

export async function canRegisterNewUser(eventId: number) {
  // 1. キャッシュ確認
  const cached = await redis.get(`event:${eventId}:allow_registration`);
  if (cached !== null) {
    return { canRegister: cached === 'true' };
  }
  
  // 2. DB から取得
  const supabase = await createClient();
  const { data: event } = await supabase
    .from('events')
    .select('allow_registration')
    .eq('id', eventId)
    .single();
  
  // 3. キャッシュに保存 (30秒)
  await redis.setex(
    `event:${eventId}:allow_registration`,
    30,
    event?.allow_registration ? 'true' : 'false'
  );
  
  return { canRegister: event?.allow_registration };
}
```

### 2. **バッチ処理が必要な場合**

```typescript
// ❌ 現在: 1ユーザーずつ確認
for (const nickname of nicknames) {
  const result = await checkNicknameAvailability(eventId, nickname);
  // N回のDB接続
}

// ✅ 将来: バッチ確認
export async function checkNicknamesAvailability(
  eventId: number,
  nicknames: string[]
): Promise<Record<string, boolean>> {
  const supabase = await createClient();
  
  const { data: existing } = await supabase
    .from('users')
    .select('nickname')
    .eq('event_id', eventId)
    .in('nickname', nicknames);
  
  // 1回のDB接続で完結
  const existingNicknames = new Set(existing?.map(u => u.nickname));
  return Object.fromEntries(
    nicknames.map(nick => [nick, !existingNicknames.has(nick)])
  );
}
```

### 3. **接続プーリング設定**

Supabase では以下の方法で接続数を制御:

```sql
-- Supabase PostgreSQL の max_connections パラメータ
-- デフォルト: 100 接続
-- Supabase Pro: ~500 接続

-- 重い処理は適切にタイムアウト設定
SELECT * FROM users
WHERE event_id = $1
LIMIT 100;  -- ❌ LIMIT なしは避ける
```

---

## ✅ 現在の実装は適切

### メリット

| 項目 | 現在の実装 |
|------|----------|
| **セキュリティ** | ✅ Cookie 情報が常に最新（CSRF対策） |
| **スケーラビリティ** | ✅ Server Actions は自動スケーリング |
| **保守性** | ✅ コード単純、テスト容易 |
| **コスト** | ✅ 追加ライブラリ不要 |
| **レイテンシ** | ✅ ~150-250ms (受け入れ可能な範囲) |

### デメリット

| 項目 | 現在の実装 | 対策 |
|------|----------|------|
| **キャッシュなし** | ❌ 同じクエリが重複 | Redis キャッシング (後で追加) |
| **接続数制限** | ⚠️ 120人時に注意 | Supabase Pro プランに変更 |

---

## 🎯 推奨事項

### 短期 (今のまま問題ない)

```typescript
// ✅ 現在の実装を継続
export async function registerUser(eventId: number, nickname: string) {
  const supabase = await createClient();
  // ...
}
```

### 中期 (ユーザー数が100人を超えたら)

```typescript
// ✅ Redis キャッシング層を追加
// - イベント設定のキャッシング
// - 上位ランキングのキャッシング
```

### 長期 (120人を超えたら)

```typescript
// ✅ Supabase Pro プランへのアップグレード
// ✅ 複数リージョンでのレプリケーション
// ✅ CDN + エッジキャッシング
```

---

## 📝 まとめ

| 質問 | 答え |
|------|------|
| **毎回 DB 接続してる?** | いいえ。クライアントオブジェクトの生成だけ（~1ms） |
| **パフォーマンス的に問題?** | いいえ。~150-250ms は受け入れ可能 |
| **スケーリングは?** | 120人なら現在の実装で OK。その後は Redis キャッシング |
| **接続数の制限?** | Supabase Free: 100。Pro: 500+。要件に応じてアップグレード |

**結論**: 現在の実装は **ベストプラクティス** です。必要に応じて段階的に最適化していきましょう。

---

最終更新: 2025年10月19日
