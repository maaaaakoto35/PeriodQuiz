# アーキテクチャ設計

## 概要
PeriodQuizシステムのアーキテクチャとディレクトリ構成。

---

## システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                         クライアント                          │
│  ┌──────────────┐              ┌──────────────┐            │
│  │ User Browser │              │Admin Browser │            │
│  │  (Mobile)    │              │   (Desktop)  │            │
│  └──────┬───────┘              └──────┬───────┘            │
└─────────┼──────────────────────────────┼──────────────────┘
          │                              │
          │ HTTPS                        │ HTTPS (Basic Auth)
          │                              │
┌─────────┼──────────────────────────────┼──────────────────┐
│         ▼                              ▼                   │
│  ┌──────────────────────────────────────────────────┐     │
│  │            Next.js (Vercel)                      │     │
│  │  ┌────────────────┐    ┌────────────────┐       │     │
│  │  │ Server         │    │ Client         │       │     │
│  │  │ Components     │    │ Components     │       │     │
│  │  │ - DB Access    │    │ - UI           │       │     │
│  │  │ - Session      │    │ - Realtime     │       │     │
│  │  │ - Server       │    │   Subscribe    │       │     │
│  │  │   Actions      │    │                │       │     │
│  │  └────────────────┘    └────────────────┘       │     │
│  └──────────────┬────────────────┬──────────────────┘     │
└─────────────────┼────────────────┼────────────────────────┘
                  │                │
                  │ SQL/REST       │ WebSocket (Realtime)
                  ▼                ▼
         ┌─────────────────────────────────┐
         │         Supabase                │
         │  ┌─────────────────────────┐   │
         │  │ PostgreSQL              │   │
         │  │ - Tables                │   │
         │  │ - RLS                   │   │
         │  │ - Functions             │   │
         │  └─────────────────────────┘   │
         │  ┌─────────────────────────┐   │
         │  │ Realtime                │   │
         │  │ - Postgres Changes      │   │
         │  │ - Broadcast             │   │
         │  └─────────────────────────┘   │
         │  ┌─────────────────────────┐   │
         │  │ Storage                 │   │
         │  │ - quiz-images/          │   │
         │  └─────────────────────────┘   │
         └─────────────────────────────────┘
```

---

## ディレクトリ構成

```
PeriodQuiz/
├── docs/                           # ドキュメント
│   ├── spec/                       # 機能仕様
│   │   ├── README.md
│   │   ├── 001-ユーザー参加とセッション管理.md
│   │   ├── 002-クイズとピリオドの管理.md
│   │   ├── 003-画面遷移制御.md
│   │   ├── 004-回答記録と時間計測.md
│   │   ├── 005-集計とランキング表示.md
│   │   └── 006-システムの初期化とリセット.md
│   └── development/                # 技術仕様
│       ├── README.md               # この文書へのナビゲーション
│       ├── tech-stack.md           # 技術スタック
│       ├── architecture.md         # アーキテクチャ設計
│       ├── database.md             # データベース設計
│       ├── realtime.md             # リアルタイム通信
│       ├── authentication.md       # 認証・セッション管理
│       ├── image-storage.md        # 画像管理
│       └── local-development.md    # ローカル開発環境
│
├── app/                            # Next.js App Router
│   ├── (user)/                     # ユーザー向けルート
│   │   ├── layout.tsx
│   │   ├── page.tsx                # ニックネーム入力画面
│   │   ├── quiz/
│   │   │   ├── waiting/
│   │   │   │   └── page.tsx        # 待機画面
│   │   │   ├── question/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx    # クイズ問題画面
│   │   │   │       └── _components/
│   │   │   ├── answer/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # 正解発表画面
│   │   │   ├── period-result/
│   │   │   │   └── page.tsx        # ピリオド結果画面
│   │   │   └── final-result/
│   │   │       └── page.tsx        # 最終結果画面
│   │   └── _components/            # ユーザー画面共通コンポーネント
│   │       ├── QuizSync.tsx        # リアルタイム同期
│   │       ├── QuestionCard.tsx
│   │       └── RankingTable.tsx
│   │
│   ├── (admin)/                    # 管理者向けルート (Basic認証)
│   │   ├── layout.tsx
│   │   └── admin/
│   │       ├── page.tsx            # ダッシュボード
│   │       ├── questions/          # 問題管理
│   │       │   ├── page.tsx        # 問題一覧
│   │       │   ├── new/
│   │       │   │   └── page.tsx    # 問題作成
│   │       │   ├── [id]/
│   │       │   │   └── edit/
│   │       │   │       └── page.tsx # 問題編集
│   │       │   └── _components/
│   │       ├── periods/            # ピリオド管理
│   │       │   ├── page.tsx
│   │       │   ├── new/
│   │       │   │   └── page.tsx
│   │       │   └── _components/
│   │       ├── events/             # イベント管理
│   │       │   ├── page.tsx
│   │       │   ├── new/
│   │       │   │   └── page.tsx
│   │       │   ├── [id]/
│   │       │   │   └── page.tsx    # イベント詳細
│   │       │   └── _components/
│   │       ├── control/            # 進行制御
│   │       │   ├── page.tsx        # 制御パネル
│   │       │   └── _components/
│   │       │       ├── ControlPanel.tsx
│   │       │       ├── LiveStats.tsx
│   │       │       └── ParticipantList.tsx
│   │       └── _components/        # 管理画面共通コンポーネント
│   │           └── AdminNav.tsx
│   │
│   ├── api/                        # API Routes（必要に応じて）
│   │   └── webhook/
│   │       └── route.ts
│   │
│   ├── _lib/                       # 共通ライブラリ
│   │   ├── supabase/               # Supabaseクライアント
│   │   │   ├── client.ts           # クライアントコンポーネント用
│   │   │   ├── server.ts           # サーバーコンポーネント用
│   │   │   └── middleware.ts       # Middleware用
│   │   ├── actions/                # Server Actions
│   │   │   ├── user.ts             # ユーザー関連
│   │   │   ├── session.ts          # セッション管理
│   │   │   ├── quiz.ts             # クイズ回答
│   │   │   ├── admin.ts            # 管理者操作
│   │   │   └── upload.ts           # 画像アップロード
│   │   ├── hooks/                  # カスタムフック
│   │   │   ├── useQuizState.ts     # クイズ状態管理
│   │   │   ├── useSession.ts       # セッション取得
│   │   │   └── useRealtime.ts      # Realtime接続
│   │   ├── types/                  # 型定義
│   │   │   ├── database.ts         # Supabase生成型
│   │   │   ├── quiz.ts             # クイズ関連型
│   │   │   └── session.ts          # セッション関連型
│   │   └── utils/                  # ユーティリティ関数
│   │       ├── date.ts
│   │       ├── ranking.ts          # ランキング計算
│   │       └── validation.ts
│   │
│   ├── globals.css                 # グローバルスタイル
│   ├── layout.tsx                  # ルートレイアウト
│   └── middleware.ts               # Basic認証など
│
├── supabase/                       # Supabase設定
│   ├── migrations/                 # マイグレーションファイル
│   │   └── 20251019000000_initial_schema.sql
│   ├── seed.sql                    # シードデータ（任意）
│   └── config.toml                 # Supabase設定
│
├── public/                         # 静的ファイル
│   ├── images/
│   └── favicon.ico
│
├── .env.sample                     # 環境変数サンプル
├── .env.local                      # 環境変数（gitignore）
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## レイヤー構造

### プレゼンテーション層
- **Page Components**: ルートに対応するページコンポーネント
- **UI Components**: 再利用可能なUIコンポーネント
- **Client Components**: インタラクティブな機能（'use client'）

### ビジネスロジック層
- **Server Actions**: データ変更のロジック
- **Utilities**: ビジネスロジックのヘルパー関数
- **Hooks**: クライアント側のロジック

### データアクセス層
- **Supabase Client**: データベースアクセス
- **Server Components**: サーバーサイドでのデータ取得

---

## コロケーションパターン

関連するコンポーネントは近くに配置:

```
app/
└── (user)/
    └── quiz/
        └── question/
            └── [id]/
                ├── page.tsx
                └── _components/          # このページ専用のコンポーネント
                    ├── QuestionImage.tsx
                    ├── ChoiceButton.tsx
                    └── Timer.tsx
```

共通コンポーネントは上位に:

```
app/
└── (user)/
    └── _components/                      # ユーザー画面全体で共通
        ├── Header.tsx
        └── Footer.tsx
```

---

## データフロー

### ユーザー画面のリアルタイム更新

```
1. Admin: Server Actionで quiz_control テーブルを更新
   └─> Supabase: テーブルが変更される
       └─> Supabase Realtime: 変更を検知
           └─> User Browser: Realtimeで通知を受け取る
               └─> Next.js Router: 画面遷移
```

### クイズ回答の流れ

```
1. User: 選択肢をクリック
   └─> Client Component: Server Actionを呼び出し
       └─> Server Action: 回答を検証・記録
           └─> Supabase: answersテーブルに挿入
               └─> Admin Dashboard: リアルタイムで集計更新
```

---

## セキュリティ境界

```
┌─────────────────────────────────────────┐
│         Client Components               │ ← 信頼できない環境
│  - UIのみ                               │
│  - セキュアなデータにアクセスしない       │
└─────────────────────────────────────────┘
                  │
                  │ Server Actions呼び出し
                  ▼
┌─────────────────────────────────────────┐
│      Server Components / Actions        │ ← 信頼できる環境
│  - セッション検証                        │
│  - データベースアクセス                   │
│  - ビジネスロジック                      │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│           Supabase (RLS)                │ ← データベース層でも検証
│  - Row Level Security                   │
└─────────────────────────────────────────┘
```

---

最終更新: 2025年10月19日
