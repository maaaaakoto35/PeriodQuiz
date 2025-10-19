# PeriodQuiz

ピリオドごとにチャンピオンが決まるリアルタイムクイズシステム。

## 概要

PeriodQuizは、クイズイベントを複数のピリオド（セクション）に分けて実施し、各ピリオドおよび全体でのチャンピオンを決定するシステムです。管理者が全ユーザーの画面をリアルタイムで制御し、120人規模の同時参加に対応します。

### 主な機能

- **リアルタイム画面制御**: 管理者が全ユーザーの画面を一斉に操作
- **ピリオド制**: 10-20問ごとのセクションでチャンピオンを決定
- **同時参加**: 最大120人が同時にクイズに参加可能
- **即時集計**: 正解数と回答時間でランキングを自動生成
- **画像対応**: 問題と選択肢に画像を表示可能

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | Next.js (App Router), TypeScript, Tailwind CSS |
| バックエンド | Supabase (PostgreSQL), Server Actions |
| インフラ | Vercel, Supabase Storage |
| リアルタイム | Supabase Realtime |
| 認証 | Cookie (User), Basic認証 (Admin) |
| 開発環境 | Docker, Supabase CLI |

## ドキュメント

### 機能仕様
[`docs/spec/`](./docs/spec/) - システムの機能要件とユーザーストーリー

- [機能仕様README](./docs/spec/README.md) - システム要件の概要
- [001 - ユーザー参加とセッション管理](./docs/spec/001-ユーザー参加とセッション管理.md)
- [002 - クイズとピリオドの管理](./docs/spec/002-クイズとピリオドの管理.md)
- [003 - 画面遷移制御](./docs/spec/003-画面遷移制御.md)
- [004 - 回答記録と時間計測](./docs/spec/004-回答記録と時間計測.md)
- [005 - 集計とランキング表示](./docs/spec/005-集計とランキング表示.md)
- [006 - システムの初期化とリセット](./docs/spec/006-システムの初期化とリセット.md)

### 技術仕様
[`docs/development/`](./docs/development/) - アーキテクチャと実装の詳細

- [技術仕様README](./docs/development/README.md) - 技術ドキュメントのナビゲーション
- [技術スタック](./docs/development/tech-stack.md)
- [アーキテクチャ設計](./docs/development/architecture.md)
- [データベース設計](./docs/development/database.md)
- [リアルタイム通信](./docs/development/realtime.md)
- [認証・セッション管理](./docs/development/authentication.md)
- [画像管理](./docs/development/image-storage.md)
- [ローカル開発環境](./docs/development/local-development.md)

## クイックスタート

### 必要な環境
- Node.js 18.x以上
- pnpm 8.x以上
- Docker Desktop (または OrbStack)
- Supabase CLI

### セットアップ

```bash
# リポジトリのクローン
git clone <repository-url>
cd PeriodQuiz

# パッケージのインストール
pnpm install

# Supabaseローカル環境の起動
supabase start

# 環境変数の設定
# .env.localファイルのNEXT_PUBLIC_SUPABASE_ANON_KEYを
# supabase start実行後に表示されたanon keyに置き換えてください

# Next.js開発サーバーの起動
pnpm dev
```

### Lintの実行

```bash
# Lintチェックを実行
pnpm lint

# Lintエラーを自動修正
pnpm lint:fix
```

### テストの実行

```bash
# テストを実行（watchモード）
pnpm test

# テストを1回だけ実行
pnpm test:run

# UIモードでテストを実行
pnpm test:ui
```

#### テストファイルの配置（コロケーションパターン）

このプロジェクトでは、テストファイルを実装ファイルと同じディレクトリに配置するコロケーションパターンを採用しています。

```
app/
├── _lib/
│   ├── types/
│   │   ├── database.ts        # 型定義
│   │   └── database.spec.ts   # 型定義のテスト
│   ├── supabase/
│   │   ├── client.ts          # Supabaseクライアント
│   │   └── client.spec.ts     # クライアントのテスト
│   └── utils.spec.ts          # ユーティリティのテスト
└── (user)/
    ├── page.tsx               # ユーザーページ
    └── page.spec.ts           # ページのテスト
```

**テストファイルの命名規則:**
- 拡張子: `.spec.ts` または `.spec.tsx`
- describe/it: 日本語で記述

```typescript
// 例: utils.spec.ts
describe('ユーティリティ関数', () => {
  it('正しく動作すること', () => {
    expect(formatNickname('test')).toBe('test')
  })
})
```

### パスエイリアス

プロジェクト内では、相対パスの代わりに `@/` エイリアスを使用してインポートできます。

```typescript
// ❌ 相対パスを使用
import { Database } from '../../../types/database'

// ✅ パスエイリアスを使用
import { Database } from '@/app/_lib/types/database'
```

### アクセス

- **ユーザー画面**: http://localhost:3000
- **管理画面**: http://localhost:3000/admin (Basic認証)
- **Supabase Studio**: http://localhost:54323

詳細なセットアップ手順は [ローカル開発環境](./docs/development/local-development.md) を参照してください。

## プロジェクト構成

```
PeriodQuiz/
├── docs/                   # ドキュメント
│   ├── spec/              # 機能仕様
│   └── development/       # 技術仕様
├── app/                   # Next.js App Router
│   ├── (user)/           # ユーザー向け画面
│   │   ├── page.tsx
│   │   └── page.spec.ts  # コロケーションテスト
│   ├── (admin)/          # 管理者向け画面
│   │   └── admin/
│   │       ├── page.tsx
│   │       └── page.spec.ts
│   └── _lib/             # 共通ライブラリ
│       ├── types/
│       │   ├── database.ts
│       │   └── database.spec.ts
│       └── supabase/
│           ├── client.ts
│           └── client.spec.ts
├── supabase/             # Supabaseマイグレーション
│   └── migrations/
├── vitest.config.ts      # Vitest設定
├── vitest.setup.ts       # テストセットアップ
└── public/               # 静的ファイル
```

## 開発ガイドライン

### コード品質

- **Linter**: ESLint with Next.js recommended config
- **自動修正**: `pnpm lint:fix` でコードスタイルを自動修正

### テスト

- **フレームワーク**: Vitest
- **パターン**: コロケーション（テストを実装の隣に配置）
- **命名**: `*.spec.ts` または `*.spec.tsx`
- **言語**: describe/itは日本語で記述

### パスエイリアス

- `@/` でプロジェクトルートからのパスを指定可能
- 相対パス（`../../../`）は避ける

## ライセンス

MIT
