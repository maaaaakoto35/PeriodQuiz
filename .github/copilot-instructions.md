# GitHub Copilot 開発指示

このドキュメントは GitHub Copilot が常に参照すべき開発指示を記載しています。

---

## 🎨 UI 実装と動作確認

### 必須ツールの使用

**UI 実装や動作確認には Chrome DevTools MCP を必ず使用すること**

### 実装フロー

1. **コンポーネント実装**

   - TypeScript と React でコンポーネントを作成

## 📚 追加リソース

詳細のワークフロー情報は以下を参照:

- [コーディング規約](../docs/development/coding_rules/README.md)
- [アーキテクチャ設計](../docs/development/architecture.md)
- [開発ドキュメント](../docs/development/README.md)

2. **動作確認（Chrome DevTools MCP 使用）**

   - ページをブラウザで開く
   - スナップショットを取得して確認
   - インタラクションをテスト

3. **確認項目**
   - ✅ レスポンシブデザインの動作
   - ✅ フォームのバリデーション
   - ✅ ユーザーインタラクション
   - ✅ エラーハンドリング
   - ✅ ネットワークリクエストの確認

---

## 📁 コロケーションパターン

**関連ファイルは使用される場所の近くに配置**

詳細は [`docs/development/coding_rules/README.md`](../docs/development/coding_rules/README.md) を参照。

### 基本ルール

```
_components/
  └── ComplexComponent/
      ├── index.tsx                # 外部公開用
      ├── ComplexComponent.tsx     # 実装
      ├── hooks/                   # このコンポーネント専用hooks
      │   └── useComponentLogic.ts
      └── components/              # 子コンポーネント
          └── SubComponent.tsx
```

### 共有 hooks の判断

- **1-2 箇所で使用**: コンポーネント近くに配置
- **3 箇所以上で使用**: `app/_lib/hooks/` へ移動を検討

---

## 🧪 テスト

### テストファイルの配置

テスト対象のファイルと同じディレクトリに `*.spec.ts(x)` ファイルを配置:

```
Component.tsx
Component.spec.tsx  ← 同じディレクトリ
```

---

## 🔒 セキュリティ

### Server Actions の使用

機密情報やデータベース操作は必ず Server Actions で実行:

```typescript
"use server";

export async function secureAction() {
  // データベース操作やAPIコール
}
```

### 環境変数

- **サーバー専用**: `process.env.SECRET_KEY`
- **クライアント公開**: `process.env.NEXT_PUBLIC_*` (機密情報を含めない)

---

## 📝 コーディングスタイル

### インポート順序

```typescript
// 1. 外部ライブラリ
import { useState } from "react";

// 2. 内部モジュール（絶対パス）
import { createClient } from "@/app/_lib/supabase/client";

// 3. 相対パス
import { useSession } from "../_hooks/useSession";
```

### Tailwind CSS

クラス名は改行して読みやすく:

```typescript
<div className="
  flex flex-col items-center
  w-full max-w-md
  p-4 space-y-4
  bg-white rounded-lg shadow-lg
">
```

---

## 🚀 パフォーマンス

### 最適化のポイント

- 適切な `React.memo`, `useMemo`, `useCallback` の使用
- 動的インポート（`next/dynamic`）でバンドルサイズ削減
- 画像最適化（`next/image`）の使用

---

## � Git ワークフロー

### ❌ 使用禁止

- **GitKraken MCP は使用しない** ← 毎回指定する必要がないように統一

### ✅ 使用するツール

- `git` コマンド
- `gh` (GitHub CLI) コマンド

### 基本フロー

**1. ブランチ作成**

```bash
git checkout -b feature/your-feature-name
```

**2. 実装・テスト**

```bash
# テスト実行
pnpm test:run

# ビルド確認
pnpm build
```

**3. コミット（日本語推奨）**

```bash
git add -A
git commit -m "feat: 機能の説明

- 実装内容 1
- 実装内容 2
- テスト: XX tests passing"
```

**4. プッシュ**

```bash
git push origin feature/your-feature-name
```

**5. PR 作成**

```bash
gh pr create --title "feat: 機能タイトル" \
  --body "## 概要
説明

## テスト結果
✅ XX tests passing" \
  --base main
```

### よく使うコマンド

```bash
# ブランチ確認
git branch -a

# コミット履歴
git log --oneline -10

# 変更内容確認
git diff

# PR 一覧
gh pr list

# 特定の PR 確認
gh pr view <PR番号>

# PR をマージ
gh pr merge <PR番号>

# ブランチ削除
git branch -D feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

## � 開発ワークフロー（仕様実装）

### ユーザーストーリーを実装する場合

**1. ブランチ命名規則**

```bash
# US-001-01であればbranchは feature/us-001-01
git checkout -b feature/us-001-xx
```

**2. 仕様の確認と更新**

- `docs/spec/` にある仕様ドキュメントを参照
- 実装の段階で仕様が変わった場合は、ドキュメントを修正
- 実装完了時に受け入れ基準のチェックボックスを埋める

**3. 実装フロー**

```bash
# ブランチ作成
git checkout -b feature/us-001-xx

# 実装・テスト
pnpm test:run
pnpm build

# Chrome DevTools MCP で動作確認
# - レスポンシブデザイン
# - フォームのバリデーション
# - ユーザーインタラクション
# - エラーハンドリング

# 仕様ドキュメントのチェックボックスを埋める
# vim docs/spec/001-xxxx.md

# 変更をコミット
git add -A
git commit -m "feat: 機能説明 (US-001-xx)

- 実装内容 1
- 実装内容 2
テスト: ✅ XX tests passing"

# PR作成
git push origin feature/us-001-xx
gh pr create --title "feat: 機能説明 (US-001-xx)" \
  --body "## 概要
US-001-xx を実装しました

## 実装内容
- 実装内容 1
- 実装内容 2

## テスト結果
✅ XX tests passing" \
  --base main
```

---

## �📖 PR の確認と仕様更新

ユーザーストーリーの実装状況を確認する場合、`gh pr view` コマンドで PR の詳細を確認できます。

```bash
# PR番号を指定して詳細を確認
gh pr view <PR番号>

# 例: PR #4 の確認
gh pr view 4
```

確認した実装内容に基づいて：

1. 仕様ドキュメントのチェックボックスを埋める
2. 実装内容が仕様から変わっていないか確認
3. 必要に応じてドキュメントを修正

### コミット命名規則

- `feat:` 新機能
- `fix:` バグ修正
- `refactor:` リファクタリング
- `docs:` ドキュメント
- `test:` テスト
- `chore:` その他

---

## �📚 追加リソース

詳細なコーディング規約は以下を参照:

- [コーディング規約](../docs/development/coding_rules/README.md)
- [アーキテクチャ設計](../docs/development/architecture.md)
- [開発ドキュメント](../docs/development/README.md)

---

最終更新: 2025 年 10 月 19 日
