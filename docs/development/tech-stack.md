# 技術スタック

## 概要
PeriodQuizシステムで採用する技術スタックの一覧。

---

## フロントエンド

### Framework
- **Next.js (App Router)**
  - バージョン: 最新安定版
  - Server ComponentsとClient Componentsを適切に使い分け
  - App Routerの機能をフル活用

### 言語
- **TypeScript**
  - 型安全性の確保
  - 保守性の向上
  - Supabaseの型生成との統合

### スタイリング
- **Tailwind CSS**
  - ユーティリティファーストのCSS
  - レスポンシブデザインが容易
  - カスタマイズ性が高い

### アーキテクチャ
- **コロケーションパターン**
  - 関連するコンポーネントを近くに配置
  - `_components`ディレクトリで管理
  - 再利用性と保守性のバランス

---

## バックエンド

### Database
- **Supabase (PostgreSQL)**
  - フルマネージドPostgreSQL
  - Row Level Security (RLS)による権限制御
  - リアルタイム機能統合
  - 無料枠が充実

### API
- **Next.js Server Actions**
  - フォームデータの処理
  - データベース操作
  - セッション管理

- **Next.js Route Handlers**
  - REST API（必要に応じて）
  - Webhook受信

### リアルタイム通信
- **Supabase Realtime**
  - PostgreSQLの変更をリアルタイムで配信
  - WebSocketベースの双方向通信
  - 追加インフラ不要

**選定理由:**
- Vercelは長時間接続（WebSocket）に向いていない
- Supabaseと完全統合、追加インフラ不要
- 120人規模なら十分な性能
- 追加コスト不要

**代替案として検討したもの:**
- Redis Pub/Sub: 高性能だが追加インフラとコストが必要
- WebSocket: Vercelでの実装が困難
- Polling: フォールバック用として実装を検討

---

## インフラ

### ホスティング
- **Vercel**
  - Next.jsとの完全統合
  - 自動デプロイ
  - Edge Network
  - サーバーレス関数

### ストレージ
- **Supabase Storage**
  - クイズ問題画像の保存
  - 選択肢画像の保存
  - Row Level Securityで権限管理

**選定理由:**
- データベースと同じSupabaseで一元管理
- 設定が簡単、開発速度が速い
- Supabaseの認証・RLSが使える
- このプロジェクト規模なら無料枠〜低コスト
- 120人規模に対応可能

**代替案との比較:**

| 項目 | Supabase Storage | AWS S3 + CloudFront | Vercel Blob |
|------|------------------|---------------------|-------------|
| 初期設定 | ⭐⭐⭐ 簡単 | ⭐ 複雑 | ⭐⭐⭐ 簡単 |
| 統合性 | ⭐⭐⭐ Supabaseと完全統合 | ⭐ 別管理 | ⭐⭐ Vercelと統合 |
| コスト（小規模） | ⭐⭐⭐ 無料枠あり | ⭐⭐ 従量課金 | ⭐ 高い |
| コスト（大規模） | ⭐⭐ やや高い | ⭐⭐⭐ 最安 | ⭐ 最も高い |
| CDN | ⭐⭐ 基本的な配信 | ⭐⭐⭐ CloudFront | ⭐⭐⭐ Edge Network |
| 柔軟性 | ⭐⭐ 基本機能 | ⭐⭐⭐ 高い | ⭐ 限定的 |

### ローカル開発
- **Docker (Supabase CLI)**
  - Supabaseローカル環境の構築
  - 本番環境と同じ構成で開発
- **Node.js (Next.js)**
  - ローカルで直接実行（`npm run dev`）

---

## 開発ツール

### パッケージマネージャー
- **npm** または **pnpm**
  - プロジェクトの要件に応じて選択

### 型生成
- **Supabase CLI**
  - データベーススキーマからTypeScript型を自動生成
  - `supabase gen types typescript`

### フォーマッター・リンター
- **Prettier** (予定)
  - コードフォーマット
- **ESLint** (予定)
  - コード品質チェック

---

## セキュリティ原則

### データアクセス
- クライアントコンポーネントからはセキュアなデータにアクセスしない
- セッション管理、DB操作は全てサーバーサイドで実行
- Server Actions、Server Componentsを活用

### 認証
- **ユーザー**: セッションベース（Cookie）
- **管理者**: Basic認証（Next.js Middleware）

### データベース
- **Row Level Security (RLS)**
  - テーブルレベルでの権限制御
  - Supabaseの強力な機能を活用

---

## スケール戦略

### 現在の構成（〜1000ユーザー/イベント）
- Supabase: 無料枠〜Proプラン
- Vercel: Hobbyプラン〜Proプラン
- コスト: 無料〜数千円/月

### 成長期（1000〜10000ユーザー/イベント）
- Cloudflare CDN追加（画像配信の最適化）
- Supabase: Proプラン以上
- Vercel: Proプラン
- コスト: 数千円〜数万円/月

### 大規模（10000ユーザー超/イベント）
- AWS S3 + CloudFront移行を検討
- Database Connection Poolingの最適化
- 複数リージョン展開
- コスト: 要見積もり

---

## 技術選定の理念

1. **統合性重視**: Supabaseで統一することで開発速度を最大化
2. **シンプルに始める**: 過剰な最適化はせず、必要になったら段階的にスケール
3. **Vercelの特性を理解**: 長時間接続が苦手なので、Supabase Realtimeを活用
4. **将来性を考慮**: 必要になったらCloudflare CDNやS3への移行パスを残す

---

最終更新: 2025年10月19日
