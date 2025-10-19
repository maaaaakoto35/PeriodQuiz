-- PeriodQuiz Initial Schema Migration
-- Created: 2025-10-19

-- ============================================================================
-- Tables
-- ============================================================================

-- events（イベント）
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    allow_registration BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_status ON events(status);

-- periods（ピリオド）
CREATE TABLE periods (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_num INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, order_num)
);

CREATE INDEX idx_periods_event_id ON periods(event_id);
CREATE INDEX idx_periods_status ON periods(status);

-- questions（問題）
CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    image_url TEXT,
    explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- choices（選択肢）
CREATE TABLE choices (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    image_url TEXT,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    order_num INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(question_id, order_num)
);

CREATE INDEX idx_choices_question_id ON choices(question_id);

-- period_questions（ピリオドと問題の紐付け）
CREATE TABLE period_questions (
    id BIGSERIAL PRIMARY KEY,
    period_id BIGINT NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    order_num INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(period_id, question_id),
    UNIQUE(period_id, order_num)
);

CREATE INDEX idx_period_questions_period_id ON period_questions(period_id);
CREATE INDEX idx_period_questions_question_id ON period_questions(question_id);

-- users（ユーザー）
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    session_id UUID UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, nickname)
);

CREATE INDEX idx_users_event_id ON users(event_id);
CREATE INDEX idx_users_nickname ON users(event_id, nickname);
CREATE INDEX idx_users_session_id ON users(session_id);

COMMENT ON COLUMN users.session_id IS 'Unique session identifier stored in user cookie for authentication';

-- answers（回答）
CREATE TABLE answers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    choice_id BIGINT NOT NULL REFERENCES choices(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    response_time_ms INTEGER NOT NULL,
    UNIQUE(user_id, question_id)
);

CREATE INDEX idx_answers_user_id ON answers(user_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_answered_at ON answers(answered_at);

-- quiz_control（クイズ進行制御）
CREATE TABLE quiz_control (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    current_screen TEXT NOT NULL DEFAULT 'waiting' CHECK (current_screen IN ('waiting', 'question', 'answer', 'period_result', 'final_result')),
    current_period_id BIGINT REFERENCES periods(id) ON DELETE SET NULL,
    current_question_id BIGINT REFERENCES questions(id) ON DELETE SET NULL,
    question_displayed_at TIMESTAMPTZ,
    question_closed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id)
);

CREATE INDEX idx_quiz_control_event_id ON quiz_control(event_id);

-- question_displays（問題表示記録）
CREATE TABLE question_displays (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    period_id BIGINT NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
    displayed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    UNIQUE(period_id, question_id)
);

CREATE INDEX idx_question_displays_period_id ON question_displays(period_id);
CREATE INDEX idx_question_displays_question_id ON question_displays(question_id);

-- ============================================================================
-- Views
-- ============================================================================

-- period_rankings（ピリオドランキング）
CREATE OR REPLACE VIEW period_rankings AS
SELECT
    u.event_id,
    pq.period_id,
    u.id AS user_id,
    u.nickname,
    COUNT(CASE WHEN a.is_correct THEN 1 END) AS correct_count,
    COALESCE(SUM(a.response_time_ms), 0) AS total_response_time_ms,
    COUNT(a.id) AS answered_count
FROM users u
CROSS JOIN period_questions pq
LEFT JOIN answers a ON a.user_id = u.id AND a.question_id = pq.question_id
WHERE u.event_id = (SELECT event_id FROM periods WHERE id = pq.period_id)
GROUP BY u.event_id, pq.period_id, u.id, u.nickname
ORDER BY correct_count DESC, total_response_time_ms ASC;

-- event_rankings（全体ランキング）
CREATE OR REPLACE VIEW event_rankings AS
SELECT
    u.event_id,
    u.id AS user_id,
    u.nickname,
    COUNT(CASE WHEN a.is_correct THEN 1 END) AS correct_count,
    COALESCE(SUM(a.response_time_ms), 0) AS total_response_time_ms,
    COUNT(a.id) AS answered_count
FROM users u
LEFT JOIN answers a ON a.user_id = u.id
GROUP BY u.event_id, u.id, u.nickname
ORDER BY correct_count DESC, total_response_time_ms ASC;

-- ============================================================================
-- Functions
-- ============================================================================

-- get_unanswered_time（未回答ユーザーの回答時間を計算）
CREATE OR REPLACE FUNCTION get_unanswered_time(
    p_question_id BIGINT,
    p_period_id BIGINT
)
RETURNS INTEGER AS $$
DECLARE
    v_displayed_at TIMESTAMPTZ;
    v_closed_at TIMESTAMPTZ;
BEGIN
    SELECT displayed_at, closed_at
    INTO v_displayed_at, v_closed_at
    FROM question_displays
    WHERE question_id = p_question_id AND period_id = p_period_id;

    IF v_displayed_at IS NULL OR v_closed_at IS NULL THEN
        RETURN 0;
    END IF;

    RETURN EXTRACT(EPOCH FROM (v_closed_at - v_displayed_at))::INTEGER * 1000;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_displays ENABLE ROW LEVEL SECURITY;

-- events: 読み取りは全員可能
CREATE POLICY "events_select_all" ON events FOR SELECT USING (true);

-- periods: 読み取りは全員可能
CREATE POLICY "periods_select_all" ON periods FOR SELECT USING (true);

-- questions: 読み取りは全員可能
CREATE POLICY "questions_select_all" ON questions FOR SELECT USING (true);

-- choices: 読み取りは全員可能
CREATE POLICY "choices_select_all" ON choices FOR SELECT USING (true);

-- period_questions: 読み取りは全員可能
CREATE POLICY "period_questions_select_all" ON period_questions FOR SELECT USING (true);

-- users: 読み取り・作成は全員可能
CREATE POLICY "users_select_all" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_all" ON users FOR INSERT WITH CHECK (true);

-- answers: 読み取りは全員可能、作成は全員可能
CREATE POLICY "answers_select_all" ON answers FOR SELECT USING (true);
CREATE POLICY "answers_insert_all" ON answers FOR INSERT WITH CHECK (true);

-- quiz_control: 読み取りは全員可能
CREATE POLICY "quiz_control_select_all" ON quiz_control FOR SELECT USING (true);

-- question_displays: 読み取りは全員可能
CREATE POLICY "question_displays_select_all" ON question_displays FOR SELECT USING (true);

-- ============================================================================
-- Triggers
-- ============================================================================

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_periods_updated_at BEFORE UPDATE ON periods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_control_updated_at BEFORE UPDATE ON quiz_control
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
