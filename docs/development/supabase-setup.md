# Supabase 設定ガイド

本ドキュメントは、本番環境デプロイ時に必要な Supabase の設定手順を記載しています。

## 概要

PeriodQuiz では以下の Supabase 機能を使用しています：

- **PostgreSQL Database**: ユーザー、イベント、クイズ、回答記録などのデータ管理
- **Storage**: クイズ画像（問題画像・選択肢画像）の保管
- **Row Level Security (RLS)**: データベーステーブルのアクセス制御
- **Realtime**: リアルタイム画面制御（Admin 側の操作を User 側にリアルタイム配信）

---

## 1. Supabase Storage 設定

### 1.1 `quiz-images` Bucket の作成

ローカル開発環境では、マイグレーションによって自動作成されます。本番環境では以下の手順で手動作成してください。

**Supabase Dashboard から作成する場合：**

1. Supabase Dashboard にログイン
2. **Storage** → **Buckets** をクリック
3. **New Bucket** をクリック
4. 以下の情報を入力：
   - **Bucket name**: `quiz-images` (固定)
   - **Public bucket**: ✅ チェック（画像を公開で配信するため）
   - **Allowed file types** (任意):
     ```
     image/jpeg, image/png, image/webp, image/gif
     ```
   - **Max file size** (任意): `5MB` (ファイルサイズ制限)

5. **Create bucket** をクリック

### 1.2 Bucket の確認

作成後、以下の URL で画像にアクセスできることを確認してください：

```
https://<project-id>.supabase.co/storage/v1/object/public/quiz-images/<file-path>
```

---

## 2. Row Level Security (RLS) 設定

### 2.1 Storage RLS ポリシー

Storage の RLS ポリシーは自動的に設定されています。念のため、Supabase Dashboard で確認してください。

**確認手順：**

1. **Storage** → **Policies** をクリック
2. `quiz-images` bucket を選択
3. 以下のポリシーが存在することを確認：
   - `SELECT`: Public can view quiz images
   - `INSERT`: Authenticated users can upload
   - `UPDATE`: Authenticated users can update
   - `DELETE`: Authenticated users can delete

**ポリシーが存在しない場合は、以下の SQL で作成：**

```sql
-- Policy: Public can view quiz images
CREATE POLICY "Public can view quiz images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'quiz-images');

-- Policy: Authenticated users can upload
CREATE POLICY "Authenticated users can upload quiz images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'quiz-images');

-- Policy: Authenticated users can update
CREATE POLICY "Authenticated users can update quiz images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'quiz-images')
  WITH CHECK (bucket_id = 'quiz-images');

-- Policy: Authenticated users can delete
CREATE POLICY "Authenticated users can delete quiz images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'quiz-images');
```

### 2.2 Database テーブルの RLS

Database テーブル（`users`, `events`, `periods`, `questions`, `choices` など）の RLS ポリシーはマイグレーションによって自動設定されます。

確認方法：

1. **SQL Editor** → **Migrations** をクリック
2. `20251023_complete_rls_implementation.sql` が実行されていることを確認

### 2.3 Realtime 設定（`quiz_control` テーブル）

`quiz_control` テーブルはリアルタイム画面制御に使用されるため、**Realtime を有効化**する必要があります。

**Realtime 設定手順：**

1. Supabase Dashboard にアクセス
2. **Database** → **Tables** をクリック
3. `quiz_control` テーブルを選択
4. **Realtime** セクションで **Enable Realtime** をクリック
5. 確認画面で **Enable** をクリック

**ローカル開発環境での確認：**

Supabase Studio（http://localhost:54323）で同様の手順で Realtime を有効化できます。

---

## 3. ローカル開発環境での確認

### 3.1 Supabase CLI でローカル起動

```bash
# Supabase のローカルインスタンスを起動
supabase start

# コンソール出力：
# Seeding data from seed.sql...
# Started supabase local development server.
```

### 3.2 `quiz-images` Bucket の確認

```bash
# Supabase CLI で bucket 一覧を確認
supabase projects list

# または、Supabase Studio にアクセス
# http://localhost:54323 (ポート番号は起動時に表示)
```

### 3.3 画像アップロードテスト

開発サーバー起動後、管理画面からクイズを作成し、画像をアップロードしてください：

```bash
npm run dev

# http://localhost:3000/admin/login にアクセス
# ユーザー名・パスワードで管理画面にログイン
# イベント → ピリオド → クイズ → 新規クイズ作成
# 画像をアップロード
```

アップロード成功時、コンソールに以下のような URL が表示されます：

```
http://127.0.0.1:54321/storage/v1/object/public/quiz-images/questions/[timestamp].jpg
```

---

## 4. 本番環境デプロイ時のチェックリスト

本番環境（Vercel + Supabase Cloud）にデプロイする際は、以下を確認してください：

### 4.1 環境変数設定

Vercel の設定画面で以下の環境変数が正しく設定されていることを確認：

```bash
# Supabase 接続情報
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# 管理者認証
ADMIN_USERNAME=<secure-username>
ADMIN_PASSWORD=<secure-password>
```

### 4.2 Storage Bucket 作成

```bash
# Supabase Dashboard で `quiz-images` bucket を作成
# （ローカル環境では seed.sql で自動作成されますが、
#   本番環境では手動作成が必要）
```

### 4.3 RLS ポリシー確認

Supabase Dashboard → **Storage** → **Policies** で RLS ポリシーが設定されていることを確認

### 4.4 Realtime 設定確認

Supabase Dashboard → **Database** → **Tables** → `quiz_control` で **Realtime** が有効化されていることを確認

### 4.5 ドメイン設定（CDN 利用の場合）

将来的に Cloudflare などの CDN を前面に配置する場合は、以下の対応が必要です：

```bash
# Bucket のプレフィックスを変更
NEXT_PUBLIC_SUPABASE_STORAGE_URL=https://cdn.example.com/storage

# または、Supabase の Storage を S3 にリダイレクト
# 詳細は Supabase ドキュメント参照
```

### 4.6 デプロイ後のテスト

本番環境デプロイ後は以下をテストしてください：

1. **管理画面へのログイン**
   ```
   https://app.example.com/admin/login
   ```

2. **クイズ作成＋画像アップロード**
   - 管理画面 → イベント → ピリオド → クイズ
   - 画像が正常にアップロード＆表示されることを確認

3. **画像 URL の確認**
   - ブラウザ開発ツールで、画像 URL が以下の形式であることを確認：
     ```
     https://<project-id>.supabase.co/storage/v1/object/public/quiz-images/...
     ```

4. **RLS ポリシーの動作確認**
   - 認証されていないユーザーで画像 URL にアクセス → 表示可能（SELECT ポリシー）
   - 認証されたユーザーで画像アップロード → 成功（INSERT ポリシー）

5. **Realtime の動作確認**
   - 管理画面で画面制御（例：「問題表示」）を変更
   - ユーザー側の画面がリアルタイムで更新されることを確認
   - ブラウザ開発ツール → **Network** → **WebSocket** で接続を確認

---

## 5. トラブルシューティング

### 問題: 画像アップロード時に「Bucket not found」エラー

**原因**: `quiz-images` bucket が作成されていない

**解決策**:
1. Supabase Dashboard → **Storage** → **Buckets** を確認
2. `quiz-images` bucket が存在しない場合は、4.1 に従って作成

### 問題: 画像が表示されない（404 エラー）

**原因**: RLS ポリシーが設定されていない、または権限がない

**解決策**:
1. Supabase Dashboard → **Storage** → **Policies** で `SELECT` ポリシーを確認
2. ポリシーが存在しない場合は、2.2 の SQL を実行

### 問題: 管理画面でアップロード中に「Permission denied」エラー

**原因**: INSERT ポリシーが設定されていない

**解決策**:
1. Supabase Dashboard → **Storage** → **Policies** で `INSERT` ポリシーを確認
2. ポリシーが存在しない場合は、2.2 の SQL を実行

### 問題: ローカル開発で bucket が自動作成されない

**原因**: マイグレーションが実行されていない

**解決策**:
```bash
# Supabase を停止
supabase stop

# .supabase フォルダをクリア
rm -rf .supabase

# 再度起動（マイグレーション実行）
supabase start
```

---

## 6. 参考リソース

- [Supabase Storage ドキュメント](https://supabase.com/docs/guides/storage)
- [Supabase RLS ドキュメント](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI ドキュメント](https://supabase.com/docs/reference/cli/introduction)
- [PeriodQuiz アーキテクチャ設計](./architecture.md)
- [PeriodQuiz データベース設計](./database.md)

---

最終更新: 2025年11月18日
