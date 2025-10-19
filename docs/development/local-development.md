# ローカル開発環境

## 概要
Supabase CLIとDockerを使用したローカル開発環境の構築方法。

---

## 必要なツール

- **Node.js**: v18以上
- **pnpm**: v8以上（または npm/yarn）
- **Docker Desktop**: Supabaseローカル環境の起動に必要
- **Supabase CLI**: ローカルSupabase環境を管理

---

## セットアップ手順

### 1. リポジトリのクローン
プロジェクトをローカルにクローンして、ディレクトリに移動。

### 2. 依存関係のインストール
Node.jsのパッケージマネージャーで依存関係をインストール。

### 3. Supabase CLIのインストール

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Linux:**
```bash
brew install supabase/tap/supabase
```

---

### 4. Supabaseローカル環境の起動

**起動コマンド:**
```bash
supabase start
```

**起動されるコンテナ:**
- **PostgreSQL**: データベース本体
- **Supabase Studio**: Web管理画面（ポート54323）
- **Supabase API**: RESTful API（ポート54321）
- **Supabase Realtime**: リアルタイム通信
- **Supabase Storage**: ファイルストレージ

**初回起動時の情報:**
起動後、以下の情報がターミナルに表示されます:
- API URL: `http://localhost:54321`
- Studio URL: `http://localhost:54323`
- DB URL: `postgresql://postgres:postgres@localhost:54322/postgres`
- anon key: JWT認証用の匿名キー
- service_role key: 管理者用のキー

**注意事項:**
- これらのキーは`.env.local`に保存
- 本番環境とは異なるキーが使用される

---

### 5. 環境変数の設定

**`.env.local`ファイルを作成:**
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password123
```

**重要な環境変数:**
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseのAPIエンドポイント
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: クライアント側で使用するJWTキー
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`: Basic認証用の管理者認証情報

---

### 6. マイグレーションの実行

**データベーススキーマの適用:**
```bash
supabase db reset
```

**動作:**
- 既存のデータベースをリセット
- `supabase/migrations/`配下の全マイグレーションを順番に適用
- シードデータがあれば挿入

---

### 7. Next.jsアプリケーションの起動

**開発サーバーの起動:**
```bash
pnpm dev
```

**アクセス:**
- Next.jsアプリ: http://localhost:3000
- Supabase Studio: http://localhost:54323

---

## 主要コマンド

### Supabase CLI

**基本操作:**
- `supabase start` - ローカル環境の起動
- `supabase stop` - ローカル環境の停止
- `supabase status` - サービスの状態確認

**データベース操作:**
- `supabase db reset` - データベースのリセット（全マイグレーション再実行）
- `supabase migration new <name>` - 新しいマイグレーションファイル作成
- `supabase db push` - マイグレーションを本番環境に適用
- `supabase db pull` - 本番環境のスキーマをローカルに取得

**その他:**
- `supabase functions deploy` - Edge Functionsのデプロイ
- `supabase gen types typescript` - TypeScript型定義の生成

---

### Next.js

**開発:**
- `pnpm dev` - 開発サーバー起動（http://localhost:3000）
- `pnpm build` - 本番用ビルド
- `pnpm start` - 本番モードで起動

**コード品質:**
- `pnpm lint` - ESLintによる構文チェック
- `pnpm type-check` - TypeScriptの型チェック
- `pnpm format` - Prettierによる整形

---

## Supabase Studioの使用

**アクセス:**
http://localhost:54323

**主要機能:**
- **Table Editor**: テーブルのデータ確認・編集
- **SQL Editor**: SQLクエリの実行とクエリ履歴
- **Authentication**: ユーザー管理（本プロジェクトでは未使用）
- **Storage**: ファイルのアップロード・管理
- **Realtime**: Realtime接続状況の監視
- **Database**: スキーマ、RLSポリシー、関数の確認

**便利な使い方:**
- テストデータの手動挿入
- SQLクエリのデバッグ
- RLSポリシーの動作確認

---

## トラブルシューティング

### Dockerが起動しない
**原因と対処:**
- Docker Desktopが起動しているか確認
- ポート54321-54324が既に使用されていないか確認
  - `lsof -i :54321` でポート使用状況を確認
  - 使用中の場合、該当プロセスを終了
- Dockerのメモリ割り当てを確認（最低4GB推奨）

---

### データベース接続エラー
**確認項目:**
- `supabase status`でサービスが起動しているか確認
- `.env.local`の環境変数が正しいか確認
- PostgreSQLコンテナが起動しているか確認
  - `docker ps | grep supabase`

**対処方法:**
- `supabase stop` → `supabase start`で再起動
- Dockerコンテナを全て削除して再度起動

---

### マイグレーションエラー
**原因:**
- SQL構文エラー
- 依存関係の問題（テーブルの削除順序など）

**対処方法:**
- `supabase db reset`でデータベースをリセット
- マイグレーションファイルのSQLを確認
- エラーメッセージから該当行を特定して修正

---

## 開発ワークフロー

### 1. 新機能の開発
**フロー:**
1. フィーチャーブランチを作成
2. 開発サーバーを起動
3. 機能を実装
4. ブラウザで動作確認
5. コミット・プッシュ

---

### 2. データベーススキーマの変更
**手順:**
1. `supabase migration new add_new_table` - マイグレーションファイル作成
2. `supabase/migrations/`ディレクトリにSQLファイルが生成される
3. SQLを編集（テーブル追加、カラム変更など）
4. `supabase db reset` - マイグレーションを適用
5. Supabase Studioでスキーマを確認

**ベストプラクティス:**
- マイグレーション名は明確に（例: `20251019_add_sessions_table.sql`）
- ロールバック用のマイグレーションも作成
- 本番適用前にローカルで十分テスト

---

### 3. Realtimeのテスト
**手順:**
1. 複数のブラウザタブを開く
2. 一方で管理画面から`quiz_control`を更新
3. 他方のユーザー画面で変更が即座に反映されるか確認
4. ネットワークタブでWebSocket接続を監視

**確認ポイント:**
- 遅延時間
- 再接続の挙動
- エラーハンドリング

---

## E2Eテスト環境

### Playwrightのセットアップ
Playwrightをインストールして、複数ブラウザでのテストを実行。

**テストシナリオ例:**
- 管理画面で問題を表示 → 複数のクライアントが同時に遷移
- ネットワーク切断 → 再接続後の画面同期
- 同時回答送信 → 正しく記録される

---

## 本番環境へのデプロイ前チェックリスト

**マイグレーション:**
- [ ] `supabase db push`でマイグレーションを本番に適用
- [ ] 本番DBでスキーマを確認

**環境変数:**
- [ ] VercelまたはSupabase Dashboardで環境変数を設定
- [ ] `NEXT_PUBLIC_SUPABASE_URL`と`NEXT_PUBLIC_SUPABASE_ANON_KEY`を本番用に変更

**セキュリティ:**
- [ ] Basic認証のパスワードを強力なものに変更（20文字以上推奨）
- [ ] RLSポリシーが正しく設定されているか確認

**ストレージ:**
- [ ] Supabase Storageで`quiz-images`バケットを作成
- [ ] 公開アクセスを有効化

**動作確認:**
- [ ] 本番環境でクイズフローを一通りテスト
- [ ] リアルタイム同期が動作するか確認

---

最終更新: 2025年10月19日
