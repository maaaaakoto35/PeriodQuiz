-- Test data for development
-- Insert test event
INSERT INTO events (name, description, status, allow_registration)
VALUES (
  'テストクイズイベント',
  'テスト用のクイズイベントです',
  'active',
  true
);

-- Insert quiz_control for the event (event_id = 1)
INSERT INTO quiz_control (event_id, current_screen)
VALUES (
  1,
  'waiting'
);
