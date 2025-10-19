# 開発ドキュメント

## 概要
PeriodQuizシステムの技術仕様とアーキテクチャに関するドキュメント集。

---

## 📚 ドキュメント一覧

### 1. [技術スタック](./tech-stack.md)
採用技術の一覧と選定理由

**主な内容:**
- フロントエンド: Next.js, TypeScript, Tailwind CSS
- バックエンド: Supabase, Server Actions
- インフラ: Vercel, Supabase Storage
- リアルタイム通信: Supabase Realtime
- 技術選定の理念とスケール戦略

---

### 2. [アーキテクチャ設計](./architecture.md)
システム全体のアーキテクチャとディレクトリ構成

**主な内容:**
- システムアーキテクチャ図
- 詳細なディレクトリ構成
- レイヤー構造
- コロケーションパターン
- データフロー
- セキュリティ境界

---

### 3. [データベース設計](./database.md)
Supabase (PostgreSQL) のテーブル設計とRLS

**主な内容:**
- ER図
- 全テーブル定義
- Row Level Security (RLS) ポリシー
- ビュー（集計用）
- ヘルパー関数
- マイグレーション戦略

---

### 4. [リアルタイム通信](./realtime.md)
Supabase Realtimeを使った画面制御の実装

**主な内容:**
- Supabase Realtimeの仕組み
- Admin側: 画面遷移制御の実装
- User側: リアルタイム画面同期
- フォールバック: Polling
- リアルタイム集計表示
- パフォーマンス最適化
- トラブルシューティング

---

### 5. [認証・セッション管理](./authentication.md)
ユーザーセッションと管理者認証の実装

**主な内容:**
- ユーザーセッション管理（Cookie）
- セッションの作成・取得・削除
- ニックネーム入力フォーム
- 管理者Basic認証（Middleware）
- セキュリティのベストプラクティス
- セッションクリーンアップ

---

### 6. [画像管理](./image-storage.md)
Supabase Storageを使った画像管理

**主な内容:**
- Supabase Storageの設定
- ディレクトリ構造
- Row Level Security (RLS) ポリシー
- 画像アップロードの実装
- 画像の最適化
- ストレージ容量の管理
- 将来的なCDN追加

---

### 7. [ローカル開発環境](./local-development.md)
DockerとSupabase CLIを使った開発環境のセットアップ

**主な内容:**
- 必要なツール（Node.js, Supabase CLI, Docker）
- セットアップ手順
- 日常的な開発フロー
- Supabase Studioの使い方
- トラブルシューティング
- 本番環境との同期

---

### 8. [コーディング規約](./coding_rules/README.md)
プロジェクトのコーディング規約とベストプラクティス

**主な内容:**
- コロケーション設計（Colocation Pattern）
- UI実装と動作確認（Chrome DevTools MCP使用）
- 命名規則
- テスト配置ルール
- セキュリティガイドライン
- パフォーマンスのベストプラクティス

---

## 🚀 クイックスタート

### 1. 環境準備
```bash
# リポジトリのクローン
git clone <repository-url>
cd PeriodQuiz

# パッケージインストール
npm install

# Supabase起動
supabase start
```

### 2. 環境変数設定
```bash
# .env.localを作成
cp .env.local.example .env.local

# 必要な変数を設定
# - Supabase接続情報
# - Admin認証情報
```

### 3. 開発開始
```bash
# Next.js開発サーバー起動
npm run dev

# ユーザー画面: http://localhost:3000
# 管理画面: http://localhost:3000/admin
# Supabase Studio: http://localhost:54323
```

詳細は [ローカル開発環境](./local-development.md) を参照。

---

## 📋 技術スタック概要

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | Next.js (App Router), TypeScript, Tailwind CSS |
| バックエンド | Supabase (PostgreSQL), Server Actions |
| インフラ | Vercel, Supabase Storage |
| リアルタイム | Supabase Realtime |
| 認証 | Cookie (User), Basic認証 (Admin) |
| 開発環境 | Docker, Supabase CLI |

---

## 🎯 設計原則

### 1. **統合性重視**
Supabaseで統一することで開発速度を最大化

### 2. **シンプルに始める**
過剰な最適化はせず、必要になったら段階的にスケール

### 3. **セキュリティファースト**
- クライアントからセキュアなデータにアクセスしない
- Server Actions/Componentsで処理
- Row Level Security (RLS)で権限制御

### 4. **将来性を考慮**
必要になったらCloudflare CDNやS3への移行パスを残す

---

## 📖 関連ドキュメント

### 機能仕様
[`../spec/`](../spec/) ディレクトリ配下に配置

- [機能仕様README](../spec/README.md)
- [001 - ユーザー参加とセッション管理](../spec/001-ユーザー参加とセッション管理.md)
- [002 - クイズとピリオドの管理](../spec/002-クイズとピリオドの管理.md)
- [003 - 画面遷移制御](../spec/003-画面遷移制御.md)
- [004 - 回答記録と時間計測](../spec/004-回答記録と時間計測.md)
- [005 - 集計とランキング表示](../spec/005-集計とランキング表示.md)
- [006 - システムの初期化とリセット](../spec/006-システムの初期化とリセット.md)

---

## 🔧 実装時の注意点

### パフォーマンス
- 120人の同時接続を想定
- データベースインデックスの最適化
- Supabase Realtime接続数制限に注意（Proプラン推奨）

### セキュリティ
- 環境変数を`.env.local`で管理（Gitにコミットしない）
- Basic認証のパスワードは強力なものを使用
- RLSポリシーの適切な設定

### レスポンシブデザイン
- User画面: スマートフォン最適化（max-width: 600px）
- Admin画面: PC最適化（min-width: 1024px）

---

## 📞 サポート

問題が発生した場合は各ドキュメントの「トラブルシューティング」セクションを参照してください。

---

最終更新: 2025年10月19日
