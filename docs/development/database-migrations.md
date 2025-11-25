# データベースマイグレーション

## 概要

Supabaseでのデータベースマイグレーションの作成・管理・デプロイ方法について説明します。

データベースマイグレーションは、データベーススキーマの変更（テーブル作成、カラム追加など）をバージョン管理できる仕組みです。これにより、開発環境から本番環境まで、確実に同じスキーマを展開できます。

詳細は [Supabase公式ドキュメント](https://supabase.com/docs/guides/deployment/database-migrations) を参照してください。

---

## マイグレーションの作成と管理

### 基本フロー

#### 1. 新規マイグレーションファイルの作成

```bash
# 説明的な名前でマイグレーションファイルを生成
supabase migration new <migration_name>

# 例: テーブル作成
supabase migration new create_events_table

# 例: カラム追加
supabase migration new add_created_at_column
```

このコマンドにより、`supabase/migrations/` ディレクトリに以下の形式でファイルが作成されます:

```
supabase/migrations/<timestamp>_<migration_name>.sql
```

#### 2. マイグレーションファイルに SQL を記述

作成されたファイルに、スキーマ変更の SQL を記述:

```sql
-- supabase/migrations/20251125000000_create_events_table.sql
create table if not exists public.events (
  id bigint primary key generated always as identity,
  name text not null,
  created_at timestamptz default now()
);
```

#### 3. ローカルで検証

```bash
# ローカルデータベースにマイグレーションを適用
supabase migration up

# または、データベースを初期化してテスト
supabase db reset
```

### マイグレーション命名規則

マイグレーションファイル名は以下の規則に従う:

- **テーブル作成**: `create_<table_name>_table`
- **カラム追加**: `add_<column_name>_column`
- **カラム削除**: `drop_<column_name>_column`
- **カラム変更**: `alter_<table_name>_<column_name>`
- **RLS 設定**: `add_rls_<table_name>`
- **その他**: 変更内容を簡潔に記述

```bash
# ✅ Good
supabase migration new create_users_table
supabase migration new add_email_to_users
supabase migration new add_rls_events

# ❌ Bad
supabase migration new update_db
supabase migration new fix
```

### Dashboard を使用した自動生成

Dashboard で作成したテーブルやカラムから自動的にマイグレーションを生成:

```bash
# Dashboard での変更をマイグレーションファイルとして生成（Diff）
supabase db diff -f <migration_name>

# 例: Dashboard で作成した cities テーブルをマイグレーション化
supabase db diff -f create_cities_table
```

---

## データシードの管理

開発時のテストデータは `supabase/seed.sql` で管理:

```sql
-- supabase/seed.sql
insert into public.events (name, created_at)
values
  ('Quiz Event 1', now()),
  ('Quiz Event 2', now());

insert into public.users (nickname, event_id)
values
  ('Alice', 1),
  ('Bob', 1);
```

```bash
# マイグレーションとシードを実行してリセット
supabase db reset
```

---

## 本番環境へのデプロイ

### デプロイの手順

#### 1. Supabase CLI にログイン

```bash
supabase login
```

#### 2. プロジェクトをリンク

```bash
supabase link
```

#### 3. マイグレーションをデプロイ

```bash
# マイグレーションのみを本番環境にプッシュ
supabase db push

# マイグレーション + シードデータをプッシュ（初回のみ）
supabase db push --include-seed
```

---

## マイグレーション時の注意事項

### ✅ ベストプラクティス

- **小さな変更を重ねる**: 1 つのマイグレーション = 1 つの変更
- **テスト**: 必ずローカルで `supabase db reset` で検証
- **逆方向操作**: `DROP` 前に `IF EXISTS` を使用
- **データ型**: 既存データとの互換性を考慮
- **制約**: NOT NULL 制約追加時は DEFAULT 値を指定

```sql
-- ✅ Good: 安全なカラム追加
alter table if exists public.users
add column if not exists email text default '';

-- ❌ Bad: 既存行で失敗
alter table public.users
add column email text not null;
```

### ⚠️ 本番環境での慎重な対応

- 大規模テーブルへの制約追加はダウンタイムが発生する可能性
- 重大な変更は事前にバックアップを取得
- 緊急時に戻せるようロールバック手順を準備

---

## よく使うコマンド

```bash
# マイグレーション一覧（ステータス確認）
supabase migration list

# マイグレーション状態確認（ローカル vs リモート）
supabase migration list --remote

# 特定のマイグレーションまで戻す
supabase db reset

# ローカルマイグレーション適用
supabase migration up

# 本番環境に新規マイグレーションをプッシュ
supabase db push
```

---

## トラブルシューティング

### マイグレーションが適用されない

```bash
# マイグレーション履歴をリセットして再適用
supabase db reset
```

### 本番環境とローカルのスキーマが異なる

```bash
# リモートのマイグレーション状態を確認
supabase migration list --remote

# 差分を確認
supabase db diff
```

### ロールバックしたい

```bash
# 前回のマイグレーション前の状態に戻す
supabase db reset

# または、古いマイグレーションファイルを確認して手動で修正
supabase migration list
```

---

## 参考リンク

- [Supabase Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/supabase-migration-new)

---

最終更新: 2025年11月25日
