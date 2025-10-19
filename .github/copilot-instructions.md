# GitHub Copilot 開発指示

このドキュメントは GitHub Copilot が常に参照すべき開発指示を記載しています。

---

## 🎨 UI 実装と動作確認

### 必須ツールの使用

**UI 実装や動作確認には Chrome DevTools MCP を必ず使用すること**

### 実装フロー

1. **コンポーネント実装**

   - TypeScript と React でコンポーネントを作成
   - Tailwind CSS でスタイリング

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

## 📚 追加リソース

詳細なコーディング規約は以下を参照:

- [コーディング規約](../docs/development/coding_rules/README.md)
- [アーキテクチャ設計](../docs/development/architecture.md)
- [開発ドキュメント](../docs/development/README.md)

---

最終更新: 2025 年 10 月 19 日
