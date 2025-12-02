# Commit Workflow Prompt

このプロンプトは GitHub Copilot が実行すべきコミット・プッシュ・PR 作成のワークフローを定義しています。

## 📋 ワークフロー手順

### 1️⃣ 変更内容の確認

```bash
git status
```

- 変更されたファイル一覧を表示
- Untracked files と Changed files を確認

### 現在のブランチを確認

```bash
git branch --show-current
```

- 現在のブランチと変更内容が合っているか確認
- あっていない場合はブランチ名を提案する
- 現在が main ブランチの場合にも提案を行う

### 2️⃣ 詳細な変更内容の確認

```bash
git diff --cached --name-status
# または
git diff --name-status
```

- 具体的な変更ファイルを確認

### 3️⃣ すべての変更をステージング

```bash
git add -A
```

- すべての変更をステージングエリアに追加
- サブモジュール内の`.git`ディレクトリがある場合は先に削除する

### 4️⃣ ステージング確認

```bash
git status
```

### 5️⃣ コミット実行

```bash
git commit -m "feat: 機能の説明

- 実装内容 1
- 実装内容 2
- テスト: XX tests passing"
```

**コミットメッセージ規則:**

- `feat:` 新機能
- `fix:` バグ修正
- `refactor:` リファクタリング
- `docs:` ドキュメント
- `test:` テスト
- `chore:` その他

### 6️⃣ プッシュ

```bash
git push origin <branch-name>
```

- 現在のブランチをリモートにプッシュ

### 7️⃣ PR 作成（必要に応じて）

```bash
gh pr create --title "feat: 機能タイトル" \
  --body "## 概要
説明

## テスト結果
✅ XX tests passing" \
  --base main
```

## 📝 実行例

```bash
# 1. 変更確認
git status

# 2. すべてステージング
git add -A

# 3. コミット
git commit -m "feat: バックエンド初期セットアップ

- Rails プロジェクトの基本構成
- ユーザーモデルとマイグレーション
- 開発環境設定 (Docker, Compose)
- CI/CD パイプライン設定
- テスト: 初期スペック確認"

# 4. プッシュ
git push origin feature/init-backend

# 5. PR 作成
gh pr create --title "feat: バックエンド初期セットアップ" \
  --body "## 概要
Rails プロジェクトの基本構成と開発環境を構築しました。

## テスト結果
✅ 77ファイル作成
✅ 基本構成確認完了" \
  --base main
```

## 🎯 チェックリスト

- [ ] `git status` で変更内容確認
- [ ] `git add -A` でステージング
- [ ] `git commit -m "..."` でコミット
- [ ] `git push origin <branch>` でプッシュ
- [ ] `gh pr create` で PR 作成（必要に応じて）
