# コーディング規約

## 概要
PeriodQuizプロジェクトのコーディング規約とベストプラクティス。

---

## 📁 コロケーション設計

### 基本原則
**関連するファイルは使用される場所の近くに配置する (Colocation Pattern)**

この原則により、以下のメリットが得られます:
- コードの可読性と保守性の向上
- 関連ファイルの発見が容易
- 機能の追加・削除が簡単
- インポートパスが短く明確

---

### ディレクトリ構造のルール

#### パターン1: 単純なコンポーネント

コンポーネントが独立していて、専用のhooksや子コンポーネントがない場合:

```
_components/
  └── SimpleButton.tsx
```

**使用例:**
```typescript
// 単一ファイルで完結
export function SimpleButton({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}
```

---

#### パターン2: hooks付きコンポーネント

コンポーネント専用のhooksがある場合、コンポーネントをディレクトリ化:

```
_components/
  └── NicknameForm/
      ├── index.tsx          # メインコンポーネント（外部公開用）
      ├── NicknameForm.tsx   # 実装ファイル
      └── hooks/
          ├── useNicknameValidation.ts
          └── useNicknameSubmit.ts
```

**ポイント:**
- `index.tsx` で公開インターフェースを定義
- 実装の詳細は `NicknameForm.tsx` に記述
- 専用hooksは `hooks/` ディレクトリに配置

**使用例:**
```typescript
// index.tsx
export { NicknameForm } from './NicknameForm';

// NicknameForm.tsx
import { useNicknameValidation } from './hooks/useNicknameValidation';

export function NicknameForm() {
  const { errors, validate } = useNicknameValidation();
  // ...
}
```

---

#### パターン3: 複雑なコンポーネント

複数の子コンポーネントと専用hooksを持つ場合:

```
_components/
  └── QuizDisplay/
      ├── index.tsx                    # 外部公開用エントリーポイント
      ├── QuizDisplay.tsx             # メインコンポーネント
      ├── hooks/
      │   ├── useQuizTimer.ts
      │   └── useAnswerSubmit.ts
      └── components/
          ├── QuestionCard.tsx
          ├── ChoiceButton.tsx
          └── TimerDisplay.tsx
```

**ポイント:**
- 内部で使用する子コンポーネントは `components/` に配置
- 外部には `index.tsx` のみを公開

---

#### パターン4: 共有hooks

複数の画面やコンポーネントで使用するhooksは共通の場所に配置:

```
app/_lib/hooks/
  ├── useAuth.ts          # 認証関連
  ├── useRealtime.ts      # リアルタイム通信
  └── useDebounce.ts      # 汎用ユーティリティ
```

**移動のタイミング:**
1. **初期実装時**: コンポーネントの近くに配置
2. **2箇所目で使用**: そのまま維持（必要に応じて検討）
3. **3箇所目で使用**: `app/_lib/hooks/` への移動を検討

**判断基準:**
- ドメイン固有の処理 → コンポーネント近くに配置
- 汎用的な処理 → `app/_lib/hooks/` に配置

---

### ページレベルのディレクトリ構造

ページ配下のhooksやコンポーネントも同様にコロケーション:

```
app/(user)/events/[eventId]/
  ├── page.tsx                  # メインページ
  ├── page.spec.tsx            # テスト
  ├── _hooks/                   # このページ専用のhooks
  │   ├── useSession.ts
  │   └── useRegistrationStatus.ts
  └── _components/              # このページ専用のコンポーネント
      └── NicknameForm/
          ├── index.tsx
          ├── NicknameForm.tsx
          └── hooks/
              └── useNicknameValidation.ts
```

**命名規則:**
- `_hooks/`: アンダースコア付きでNext.jsのルーティング対象外に
- `_components/`: 同上

---

## 🛠️ UI実装と動作確認

### 必須ツール

**Chrome DevTools MCP を使用すること**

UI実装や動作確認では、必ず Chrome DevTools MCP を使用してブラウザで実際の動作を確認します。

### 確認項目

実装後は以下の項目を必ず確認:

#### 1. レスポンシブデザイン
- スマートフォン表示（User画面: max-width 600px）
- タブレット表示
- PC表示（Admin画面: min-width 1024px）

#### 2. フォームのバリデーション
- 入力制限の動作
- エラーメッセージの表示
- リアルタイムバリデーション

#### 3. ユーザーインタラクション
- ボタンのクリック動作
- フォーカス管理
- キーボード操作

#### 4. エラーハンドリング
- ネットワークエラー時の挙動
- バリデーションエラーの表示
- ユーザーへのフィードバック

#### 5. パフォーマンス
- 初回レンダリング時間
- インタラクションの応答性
- リアルタイム更新の遅延

### Chrome DevTools MCP の活用

```bash
# 開発サーバー起動
npm run dev

# Chrome DevTools MCP でブラウザを開いて確認
# - スナップショット取得
# - 要素の検証
# - ネットワークリクエストの確認
# - パフォーマンス測定
```

---

## 📝 命名規則

### ファイル名

- **コンポーネント**: PascalCase（例: `NicknameForm.tsx`）
- **hooks**: camelCase with `use` prefix（例: `useSession.ts`）
- **ユーティリティ**: camelCase（例: `formatTime.ts`）
- **型定義**: camelCase（例: `types.ts`, `database.ts`）

### 変数・関数名

```typescript
// ✅ Good
const userName = 'John';
const isLoading = false;
const handleSubmit = () => {};
const getUserById = (id: string) => {};

// ❌ Bad
const user_name = 'John';
const loading = false;  // boolean には is/has などの接頭辞を
const submit = () => {};  // 関数は動詞で始める
```

---

## 🧪 テスト

### テストファイルの配置

テストファイルはテスト対象のファイルと同じディレクトリに配置:

```
_components/
  └── NicknameForm/
      ├── NicknameForm.tsx
      ├── NicknameForm.spec.tsx       # ← テストファイル
      └── hooks/
          ├── useNicknameValidation.ts
          └── useNicknameValidation.spec.ts
```

### テストの命名規則

```typescript
// ✅ Good
describe('NicknameForm', () => {
  it('should render input field', () => {});
  it('should show error for invalid nickname', () => {});
  it('should submit valid nickname', () => {});
});

// ❌ Bad
describe('Test', () => {
  it('test1', () => {});
});
```

---

## 📦 インポート順序

インポートは以下の順序で記述:

```typescript
// 1. 外部ライブラリ
import { useState } from 'react';
import { z } from 'zod';

// 2. 内部モジュール（絶対パス）
import { createClient } from '@/app/_lib/supabase/client';
import { Database } from '@/app/_lib/types/database';

// 3. 相対パス（近い順）
import { useSession } from '../_hooks/useSession';
import { NicknameForm } from './_components/NicknameForm';

// 4. 型インポート（必要に応じて分離）
import type { User } from '@/app/_lib/types/database';
```

---

## 🎨 スタイリング

### Tailwind CSS の使用

```typescript
// ✅ Good: 読みやすく整理
<div className="
  flex flex-col items-center justify-center
  w-full max-w-md
  p-4 space-y-4
  bg-white rounded-lg shadow-lg
">

// ❌ Bad: 長すぎて読みにくい
<div className="flex flex-col items-center justify-center w-full max-w-md p-4 space-y-4 bg-white rounded-lg shadow-lg">
```

---

## 🔒 セキュリティ

### Server Actions の使用

機密情報を扱う処理は必ず Server Actions で実行:

```typescript
// ✅ Good: Server Action
'use server';

export async function registerUser(eventId: string, nickname: string) {
  const supabase = createClient();
  // データベース操作
}

// ❌ Bad: クライアントで直接DB操作
const supabase = createClient();
await supabase.from('users').insert({ nickname });
```

### 環境変数

```typescript
// ✅ Good: サーバー側でのみ使用
const secretKey = process.env.SECRET_KEY;

// ❌ Bad: クライアントで機密情報を使用
const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;
```

---

## 📚 型定義

### Zod の活用

バリデーションスキーマは Zod で定義:

```typescript
import { z } from 'zod';

// スキーマ定義
export const nicknameSchema = z.object({
  nickname: z
    .string()
    .min(1, '1文字以上入力してください')
    .max(20, '20文字以内で入力してください')
    .regex(/^[a-zA-Z0-9ぁ-んァ-ヶー一-龠々]+$/, '使用できない文字が含まれています'),
});

// 型の抽出
export type NicknameInput = z.infer<typeof nicknameSchema>;
```

---

## 🚀 パフォーマンス

### React のベストプラクティス

```typescript
// ✅ Good: メモ化で不要な再レンダリングを防ぐ
const MemoizedComponent = React.memo(ExpensiveComponent);

const value = useMemo(() => computeExpensiveValue(a, b), [a, b]);

const callback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// ✅ Good: 動的インポートでバンドルサイズを削減
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

---

## 🎣 カスタムフック設計

### カスタムフック切り出しの原則

**コンポーネント内のロジックは、再利用の有無に関わらず専用カスタムフックに切り出す**

この原則により、以下のメリットが得られます:
- コンポーネントをプレゼンテーショナルコンポーネント（表示ロジック）とビジネスロジックに分離
- テスト可能性の向上
- ロジックの再利用が容易（将来的に必要になった時）
- コンポーネント内のロジック量を削減し可読性向上
- Server Actions との連携ロジックを集約

### カスタムフック切り出しの基準

#### ✅ フックに切り出すべきロジック

1. **状態管理**: `useState`を使用したロジック
2. **データフェッチング**: Server Actions やAPI呼び出し
3. **イベントハンドリング**: `handleChange`, `handleSubmit` 等
4. **派生状態**: 複数の状態から計算される値（例: `isValid`）
5. **副作用**: `useEffect` を含むロジック

#### ❌ フックに切り出さなくてよいロジック

- 単純な計算式のみ（マジックナンバーを避けるため定数化）
- JSXレイアウト（デザイン固有）

### 実装パターン

#### パターン1: 単一コンポーネント専用フック

コンポーネント専用フックは、コンポーネントと同じディレクトリの `hooks/` に配置:

```typescript
// _components/NicknameForm/NicknameForm.tsx
'use client';

import { useNicknameForm } from './hooks/useNicknameForm';

export function NicknameForm({ eventId }: Props) {
  const {
    nickname,
    error,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useNicknameForm({ eventId });

  return (
    <form onSubmit={handleSubmit}>
      <input value={nickname} onChange={handleChange} />
      {error && <p>{error}</p>}
      <button disabled={isSubmitting}>
        {isSubmitting ? '送信中...' : '送信'}
      </button>
    </form>
  );
}
```

```typescript
// _components/NicknameForm/hooks/useNicknameForm.ts
'use client';

import { useState } from 'react';
import { registerUser } from '@/app/_lib/actions/user';

export function useNicknameForm({ eventId }: Props) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setNickname(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await registerUser(eventId, nickname);
    if (!result.success) {
      setError(result.error);
    }
    setIsSubmitting(false);
  };

  return {
    nickname,
    error,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
}
```

**ポイント:**
- フック名は `use` で始まる
- 戻り値はオブジェクト型で、複数の値を返す
- コンポーネント内のロジックは削除され、プレゼンテーション重視に
- テストが容易（フックのみのテストも可能）

#### パターン2: 複数コンポーネント共有フック

3つ以上のコンポーネントで使用するフックは `app/_lib/hooks/` へ移動:

```typescript
// app/_lib/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

**ポイント:**
- ビジネスロジックに依存しない汎用フック
- 複数プロジェクトでも使用可能な設計

#### パターン3: Server Actions 連携フック

Server Actions の呼び出しをラップするフック:

```typescript
// _components/NicknameForm/hooks/useDebouncedCallback.ts
'use client';

import { useCallback, useRef } from 'react';

export function useDebouncedCallback<T extends any[]>(
  callback: (...args: T) => Promise<void>,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}
```

**ポイント:**
- Server Actions の呼び出し頻度を制御
- クライアント側の負荷軽減

### ディレクトリ構造例

```
_components/
  └── NicknameForm/
      ├── index.tsx
      ├── NicknameForm.tsx          # プレゼンテーション重視
      └── hooks/
          ├── useNicknameForm.ts    # ビジネスロジック
          ├── useDebouncedCallback.ts
          └── useNicknameValidation.ts

app/
  └── _lib/
      └── hooks/
          ├── useDebounce.ts        # 汎用フック
          └── useAsync.ts
```

---

## 📖 コメント

### コメントの書き方

```typescript
// ✅ Good: なぜそうするかを説明
// ニックネームの重複チェックは500msのデバウンスを設定
// APIコールを削減するため
const debouncedCheck = useDebouncedCallback(checkNickname, 500);

// ❌ Bad: コード自体が説明しているため不要
// ユーザーIDを取得
const userId = user.id;
```

### TODO コメント

```typescript
// TODO(username): 実装予定の機能の説明
// FIXME: 既知のバグの説明
// NOTE: 重要な注意事項
```

---

## 🔄 コード品質維持

### Linter と Formatter

```bash
# ESLint でコードチェック
npm run lint

# Prettier でフォーマット（設定されている場合）
npm run format
```

### 定期的なリファクタリング

- 重複コードの削除
- 複雑な関数の分割
- コロケーションパターンの適用
- 型安全性の向上

---

## 📞 質問・提案

コーディング規約に関する質問や改善提案があれば、チームで議論して更新してください。

---

最終更新: 2025年10月19日
