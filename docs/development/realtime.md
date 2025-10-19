# リアルタイム同期

## 概要
Supabase Realtimeを使用した画面同期の実装方針。

---

## Supabase Realtimeの選定理由

| 項目 | Supabase Realtime | Redis Pub/Sub |
|------|-------------------|---------------|
| **統合性** | Supabaseのネイティブ機能 | 別途Redisインフラ必要 |
| **スケーラビリティ** | 自動スケーリング | 手動管理 |
| **コスト** | Supabaseプランに含まれる | Redis費用が追加 |
| **Vercel対応** | 完全対応 | WebSocket制約あり |
| **データ永続化** | PostgreSQLに保存 | 別途DBが必要 |

120名規模の想定では、Supabase Realtimeで十分対応可能。

---

## 購読対象テーブル

### quiz_control
- **目的:** 画面遷移を全クライアントに同期
- **購読内容:** `UPDATE`イベント
- **トリガー:** Admin画面から更新時
- **フィルター:** `event_id`で特定のイベントのみ

### answers
- **目的:** リアルタイム集計（管理画面用）
- **購読内容:** `INSERT`イベント
- **トリガー:** ユーザーが回答を送信時
- **用途:** ランキング表示の即時更新

---

## Client側の実装パターン

### quiz_controlの購読

**仕組み:**
1. クライアントはイベントIDでフィルタした`quiz_control`テーブルを購読
2. 管理画面から更新があると、PostgreSQLの変更通知を受信
3. `current_screen`と関連フィールドを元に適切な画面へ遷移

**主要な購読イベント:**
- `UPDATE`: 画面遷移や問題切り替え
- フィルター: `event_id=eq.{eventId}`

**画面遷移の処理:**
- `current_screen`の値に応じてルーティング
- `waiting` → 待機画面
- `question` → 問題画面（`current_question_id`を使用）
- `answer` → 解答画面
- `period_result` → ピリオドランキング
- `final_result` → 最終結果

---

### answersの購読（Admin用）

**仕組み:**
1. 管理画面で全ての`answers`テーブルの`INSERT`を購読
2. 新しい回答が追加されるたびにリアルタイムでランキングを更新
3. 集計ビュー（`period_rankings`, `event_rankings`）を再取得

**用途:**
- リアルタイムランキング表示
- 回答進捗の監視
- 未回答者の把握

---

## 画面遷移のフロー

### 1. 管理画面から遷移操作

**操作例:**
- 管理画面で「次の問題を表示」ボタンをクリック
- `quiz_control`テーブルを更新:
  - `current_screen` → `'question'`
  - `current_question_id` → 表示する問題のID
  - `question_displayed_at` → 現在時刻
  - `updated_at` → 現在時刻

### 2. 全クライアントが`quiz_control`の変更を検知

**処理フロー:**
1. Supabase RealtimeがPostgreSQLの変更を検知
2. 購読中の全クライアントに変更通知を送信
3. クライアントは`current_screen`の値を確認
4. Next.js Routerで適切な画面にリダイレクト

**画面遷移パターン:**
```
question → /quiz/[eventId]/question/[questionId]
answer → /quiz/[eventId]/answer/[questionId]
period_result → /quiz/[eventId]/period-result/[periodId]
final_result → /quiz/[eventId]/final-result
waiting → /quiz/[eventId]/waiting
```

---

## エラーハンドリング

### 再接続戦略
- **自動再接続:** Supabase Realtimeは自動的にネットワーク切断から復旧
- **再購読:** 接続復旧後、自動的にチャネルを再購読
- **状態の同期:** 再接続後、最新の`quiz_control`状態を取得して画面を同期

### ステータス監視

**監視すべきステータス:**
- `SUBSCRIBED`: 購読成功
- `CHANNEL_ERROR`: チャネルエラー（ログ記録、ユーザーに通知）
- `CLOSED`: チャネル閉鎖（再接続試行）
- `TIMED_OUT`: タイムアウト（再試行）

**対処方法:**
- エラー時はトースト通知でユーザーに状態を通知
- 自動再接続を試みながら、手動リロードのオプションも提供

---

## スケーラビリティの考慮

### 接続数の制限
- **Supabase Free Tier:** 最大200同時接続
- **Supabase Pro Tier:** 最大500同時接続
- **本プロジェクト:** 120名想定 → Free Tierで対応可能

### チャネルの最適化
- **イベント単位:** 各イベントごとに独立したチャネルを作成
- **フィルタリング:** PostgreSQL側で`event_id`によるフィルタリングを実行
- **RLS活用:** Row Level Securityでセキュリティとパフォーマンスを両立

**チャネル命名規則:**
- `quiz_control:{eventId}` - 画面制御用
- `answers:{eventId}` - 回答監視用（Admin）

---

## デバッグ方法

### Supabase Dashboard
- **Realtime タブ:** リアルタイム接続状況を確認
- **監視項目:**
  - 現在の接続数
  - チャネルごとの接続数
  - メッセージ送信レート

### Browser DevTools
- **WebSocket確認:** ネットワークタブでWS接続を監視
- **コンソールログ:** チャネルの状態変化をログ出力
- **React DevTools:** Hooksの状態変化を追跡

---

## テスト戦略

### ローカル開発
- **Supabase CLI:** ローカル環境でRealtimeが動作
- **起動方法:** `supabase start`
- **確認方法:** 複数ブラウザタブで同時接続して同期をテスト

### E2Eテスト
- **Playwright使用:** 複数ブラウザから同時接続をシミュレート
- **検証項目:**
  - 画面遷移の同期
  - ネットワーク切断からの復旧
  - 遅延接続時の画面状態同期

**テストシナリオ例:**
1. 管理画面で問題を表示
2. 複数のユーザー画面が同時に遷移することを確認
3. 一部のクライアントの接続を切断
4. 再接続後、正しい画面に同期されることを確認

---

最終更新: 2025年10月19日
