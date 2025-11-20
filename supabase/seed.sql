-- Test data for development
-- Insert test event
INSERT INTO events (name, description)
VALUES (
  'テストクイズイベント',
  'テスト用のクイズイベントです'
);

-- Insert periods
INSERT INTO periods (event_id, name, order_num)
VALUES 
  (1, 'ピリオド1', 1),
  (1, 'ピリオド2', 2),
  (1, 'ピリオド3', 3);

-- Insert questions
INSERT INTO questions (text)
VALUES 
  ('最初の質問です'),
  ('2番目の質問です'),
  ('ピリオド2の質問です'),
  ('ピリオド3の質問です');

-- Insert period_questions (link periods to questions)
INSERT INTO period_questions (period_id, question_id, order_num)
VALUES 
  (1, 1, 1),
  (1, 2, 2),
  (2, 3, 1),
  (3, 4, 1);

-- Insert quiz_control for the event (event_id = 1)
INSERT INTO quiz_control (event_id, current_screen)
VALUES (
  1,
  'waiting'
);
