-- PeriodQuiz RLS Policies - Complete Implementation with Admin Sessions
-- Purpose: User と Admin セッションを分離した RLS ポリシー
-- Date: 2025-10-23

-- ============================================================================
-- 1. Admin Tables
-- ============================================================================

-- Admin セッションテーブル
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE,
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  CHECK (expires_at > created_at)
);

COMMENT ON TABLE admin_sessions IS
'Admin セッション管理。7日間有効なセッション。Basic認証でのみ作成される';

CREATE INDEX idx_admin_sessions_session_id ON admin_sessions(session_id);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- ============================================================================
-- 2. Helper Functions
-- ============================================================================

-- User セッション有効性チェック
CREATE OR REPLACE FUNCTION is_session_valid(p_session_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE session_id = p_session_id 
    AND last_active_at > NOW() - INTERVAL '24 hours'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_session_valid IS
'User セッションが有効かチェック（24時間以内のアクティビティ）';

-- Admin セッション有効性チェック
CREATE OR REPLACE FUNCTION is_admin_session_valid(p_session_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_sessions 
    WHERE session_id = p_session_id 
    AND last_active_at > NOW() - INTERVAL '24 hours'
    AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_admin_session_valid IS
'Admin セッションが有効かチェック（7日以内の作成、24時間以内のアクティビティ、期限内）';

-- ============================================================================
-- 3. Users Table Policies (User Sessions)
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "users_select" ON users;
DROP POLICY IF EXISTS "users_insert" ON users;
DROP POLICY IF EXISTS "users_update" ON users;
DROP POLICY IF EXISTS "users_delete" ON users;

-- SELECT: ユーザーは自分のセッションの記録のみ見える
CREATE POLICY "users_select" ON users
FOR SELECT
USING (is_session_valid(session_id));

COMMENT ON POLICY "users_select" ON users IS
'ユーザーは有効なセッション経由でのみレコード参照可能';

-- INSERT: ユーザー登録は Server Action を通す
CREATE POLICY "users_insert" ON users
FOR INSERT
WITH CHECK (is_session_valid(session_id));

COMMENT ON POLICY "users_insert" ON users IS
'新規ユーザーは有効なセッション情報で登録';

-- UPDATE: 自分のセッションレコードのみ更新
CREATE POLICY "users_update" ON users
FOR UPDATE
USING (is_session_valid(session_id))
WITH CHECK (is_session_valid(session_id));

COMMENT ON POLICY "users_update" ON users IS
'ユーザーは有効なセッション経由でのみレコード更新可能';

-- DELETE: 禁止（監査ログとして保持）

-- ============================================================================
-- 4. Answers Table Policies (User Generated)
-- ============================================================================

DROP POLICY IF EXISTS "answers_select" ON answers;
DROP POLICY IF EXISTS "answers_insert" ON answers;
DROP POLICY IF EXISTS "answers_update" ON answers;
DROP POLICY IF EXISTS "answers_delete" ON answers;

-- SELECT: 全員が見える（他人の回答を見るため）
CREATE POLICY "answers_select" ON answers
FOR SELECT
USING (true);

COMMENT ON POLICY "answers_select" ON answers IS
'全員が回答を閲覧可能（匿名回答データの可視化）';

-- INSERT: 有効なセッションのユーザーのみ
CREATE POLICY "answers_insert" ON answers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = answers.user_id 
    AND is_session_valid(users.session_id)
  )
);

COMMENT ON POLICY "answers_insert" ON answers IS
'回答は有効なセッションを持つユーザーのみ作成可能';

-- UPDATE/DELETE: 禁止（回答は不変）

-- ============================================================================
-- 5. Events Table Policies (Admin Managed)
-- ============================================================================

DROP POLICY IF EXISTS "events_select" ON events;
DROP POLICY IF EXISTS "events_insert" ON events;
DROP POLICY IF EXISTS "events_update" ON events;

-- SELECT: 全員が見える
CREATE POLICY "events_select" ON events
FOR SELECT
USING (true);

COMMENT ON POLICY "events_select" ON events IS
'全員がイベント情報を閲覧可能';

-- INSERT: admin セッション経由のみ
CREATE POLICY "events_insert" ON events
FOR INSERT
WITH CHECK (is_admin_session_valid(current_setting('app.admin_session_id')::uuid));

COMMENT ON POLICY "events_insert" ON events IS
'イベント作成は admin セッション経由のみ';

-- UPDATE: admin セッション経由のみ
CREATE POLICY "events_update" ON events
FOR UPDATE
USING (true)
WITH CHECK (is_admin_session_valid(current_setting('app.admin_session_id')::uuid));

COMMENT ON POLICY "events_update" ON events IS
'イベント更新は admin セッション経由のみ';

-- ============================================================================
-- 6. Periods Table Policies (Admin Managed)
-- ============================================================================

DROP POLICY IF EXISTS "periods_select" ON periods;
DROP POLICY IF EXISTS "periods_insert" ON periods;
DROP POLICY IF EXISTS "periods_update" ON periods;

CREATE POLICY "periods_select" ON periods
FOR SELECT
USING (true);

CREATE POLICY "periods_insert" ON periods
FOR INSERT
WITH CHECK (is_admin_session_valid(current_setting('app.admin_session_id')::uuid));

CREATE POLICY "periods_update" ON periods
FOR UPDATE
USING (true)
WITH CHECK (is_admin_session_valid(current_setting('app.admin_session_id')::uuid));

-- ============================================================================
-- 7. Questions Table Policies (Admin Managed)
-- ============================================================================

DROP POLICY IF EXISTS "questions_select" ON questions;
DROP POLICY IF EXISTS "questions_insert" ON questions;
DROP POLICY IF EXISTS "questions_update" ON questions;

CREATE POLICY "questions_select" ON questions
FOR SELECT
USING (true);

CREATE POLICY "questions_insert" ON questions
FOR INSERT
WITH CHECK (is_admin_session_valid(current_setting('app.admin_session_id')::uuid));

CREATE POLICY "questions_update" ON questions
FOR UPDATE
USING (true)
WITH CHECK (is_admin_session_valid(current_setting('app.admin_session_id')::uuid));

-- ============================================================================
-- 8. Choices Table Policies (Admin Managed)
-- ============================================================================

DROP POLICY IF EXISTS "choices_select" ON choices;
DROP POLICY IF EXISTS "choices_insert" ON choices;
DROP POLICY IF EXISTS "choices_update" ON choices;

CREATE POLICY "choices_select" ON choices
FOR SELECT
USING (true);

CREATE POLICY "choices_insert" ON choices
FOR INSERT
WITH CHECK (is_admin_session_valid(current_setting('app.admin_session_id')::uuid));

CREATE POLICY "choices_update" ON choices
FOR UPDATE
USING (true)
WITH CHECK (is_admin_session_valid(current_setting('app.admin_session_id')::uuid));

-- ============================================================================
-- 9. Quiz Control Table Policies (Admin Managed)
-- ============================================================================

DROP POLICY IF EXISTS "quiz_control_select" ON quiz_control;
DROP POLICY IF EXISTS "quiz_control_insert" ON quiz_control;
DROP POLICY IF EXISTS "quiz_control_update" ON quiz_control;

CREATE POLICY "quiz_control_select" ON quiz_control
FOR SELECT
USING (true);

CREATE POLICY "quiz_control_insert" ON quiz_control
FOR INSERT
WITH CHECK (is_admin_session_valid(current_setting('app.admin_session_id')::uuid));

CREATE POLICY "quiz_control_update" ON quiz_control
FOR UPDATE
USING (true)
WITH CHECK (is_admin_session_valid(current_setting('app.admin_session_id')::uuid));

-- ============================================================================
-- 10. Question Displays Table Policies (Admin Managed)
-- ============================================================================

DROP POLICY IF EXISTS "question_displays_select" ON question_displays;
DROP POLICY IF EXISTS "question_displays_insert" ON question_displays;
DROP POLICY IF EXISTS "question_displays_update" ON question_displays;

CREATE POLICY "question_displays_select" ON question_displays
FOR SELECT
USING (true);

CREATE POLICY "question_displays_insert" ON question_displays
FOR INSERT
WITH CHECK (is_admin_session_valid(current_setting('app.admin_session_id')::uuid));

CREATE POLICY "question_displays_update" ON question_displays
FOR UPDATE
USING (true)
WITH CHECK (is_admin_session_valid(current_setting('app.admin_session_id')::uuid));

-- ============================================================================
-- Summary
-- ============================================================================

/*
セキュリティルール:

1. User テーブル（users, answers）
   ┌─ SELECT: 有効なセッション経由のみ
   ├─ INSERT/UPDATE: 有効なセッションのみ
   └─ DELETE: 禁止（監査ログとして保持）

2. Admin テーブル（events, periods, questions, choices, quiz_control, question_displays）
   ┌─ SELECT: 全員（読み取り専用）
   ├─ INSERT/UPDATE: admin セッション経由のみ
   └─ DELETE: なし

3. セッション有効性
   ┌─ User: last_active_at が 24時間以内
   ├─ Admin: last_active_at が 24時間以内 かつ expires_at > NOW()
   └─ 両方とも is_session_valid() 関数でチェック

4. Server Actions での実装
   ├─ User 操作: Cookie から user.session_id を取得
   ├─ Admin 操作: Cookie から admin_sessions.session_id を取得
   ├─ current_setting('app.admin_session_id') で RLS に渡す
   └─ RLS は最終防御線
*/
