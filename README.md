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
- Docker Desktop
- Supabase CLI

### セットアップ

```bash
# リポジトリのクローン
git clone <repository-url>
cd PeriodQuiz

# パッケージのインストール
npm install

# Supabaseローカル環境の起動
supabase start

# 環境変数の設定
cp .env.local.example .env.local
# .env.localを編集してSupabaseの接続情報を設定

# Next.js開発サーバーの起動
npm run dev
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
│   ├── (admin)/          # 管理者向け画面
│   └── _lib/             # 共通ライブラリ
├── infra/                # インフラ設定
│   └── supabase/         # Supabase設定・マイグレーション
└── public/               # 静的ファイル
```

詳細は [アーキテクチャ設計](./docs/development/architecture.md) を参照してください。

## 使い方

### ユーザー（参加者）

1. システムにアクセス
2. ニックネームを入力して参加
3. 管理者の画面制御に従ってクイズに回答
4. ピリオドごと・全体のランキングを確認

### 管理者

1. `/admin` にアクセス（Basic認証）
2. クイズ問題とピリオドを作成
3. イベントを開始
4. 制御パネルから画面遷移を操作
   - 待機画面 → 問題表示 → 正解発表 → 集計結果
5. リアルタイムで回答状況を確認

## ライセンス

TBD

## 作成日

2025年10月19日