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

-- Insert questions (10 questions per period = 30 questions)
INSERT INTO questions (text)
VALUES 
  -- Period 1 questions
  ('ピリオド1: 問題1'),
  ('ピリオド1: 問題2'),
  ('ピリオド1: 問題3'),
  ('ピリオド1: 問題4'),
  ('ピリオド1: 問題5'),
  ('ピリオド1: 問題6'),
  ('ピリオド1: 問題7'),
  ('ピリオド1: 問題8'),
  ('ピリオド1: 問題9'),
  ('ピリオド1: 問題10'),
  -- Period 2 questions
  ('ピリオド2: 問題1'),
  ('ピリオド2: 問題2'),
  ('ピリオド2: 問題3'),
  ('ピリオド2: 問題4'),
  ('ピリオド2: 問題5'),
  ('ピリオド2: 問題6'),
  ('ピリオド2: 問題7'),
  ('ピリオド2: 問題8'),
  ('ピリオド2: 問題9'),
  ('ピリオド2: 問題10'),
  -- Period 3 questions
  ('ピリオド3: 問題1'),
  ('ピリオド3: 問題2'),
  ('ピリオド3: 問題3'),
  ('ピリオド3: 問題4'),
  ('ピリオド3: 問題5'),
  ('ピリオド3: 問題6'),
  ('ピリオド3: 問題7'),
  ('ピリオド3: 問題8'),
  ('ピリオド3: 問題9'),
  ('ピリオド3: 問題10');

-- Insert period_questions (link periods to questions)
INSERT INTO period_questions (period_id, question_id, order_num)
VALUES 
  -- Period 1 (question_id 1-10)
  (1, 1, 1),
  (1, 2, 2),
  (1, 3, 3),
  (1, 4, 4),
  (1, 5, 5),
  (1, 6, 6),
  (1, 7, 7),
  (1, 8, 8),
  (1, 9, 9),
  (1, 10, 10),
  -- Period 2 (question_id 11-20)
  (2, 11, 1),
  (2, 12, 2),
  (2, 13, 3),
  (2, 14, 4),
  (2, 15, 5),
  (2, 16, 6),
  (2, 17, 7),
  (2, 18, 8),
  (2, 19, 9),
  (2, 20, 10),
  -- Period 3 (question_id 21-30)
  (3, 21, 1),
  (3, 22, 2),
  (3, 23, 3),
  (3, 24, 4),
  (3, 25, 5),
  (3, 26, 6),
  (3, 27, 7),
  (3, 28, 8),
  (3, 29, 9),
  (3, 30, 10);

-- Insert choices (2-4 choices per question)
-- Question 1 (3 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (1, '選択肢1-1', true, 1),
  (1, '選択肢1-2', false, 2),
  (1, '選択肢1-3', false, 3);

-- Question 2 (4 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (2, '選択肢2-1', false, 1),
  (2, '選択肢2-2', true, 2),
  (2, '選択肢2-3', false, 3),
  (2, '選択肢2-4', false, 4);

-- Question 3 (2 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (3, '選択肢3-1', false, 1),
  (3, '選択肢3-2', true, 2);

-- Question 4 (3 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (4, '選択肢4-1', true, 1),
  (4, '選択肢4-2', false, 2),
  (4, '選択肢4-3', false, 3);

-- Question 5 (4 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (5, '選択肢5-1', false, 1),
  (5, '選択肢5-2', false, 2),
  (5, '選択肢5-3', true, 3),
  (5, '選択肢5-4', false, 4);

-- Question 6 (2 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (6, '選択肢6-1', true, 1),
  (6, '選択肢6-2', false, 2);

-- Question 7 (3 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (7, '選択肢7-1', false, 1),
  (7, '選択肢7-2', false, 2),
  (7, '選択肢7-3', true, 3);

-- Question 8 (4 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (8, '選択肢8-1', false, 1),
  (8, '選択肢8-2', true, 2),
  (8, '選択肢8-3', false, 3),
  (8, '選択肢8-4', false, 4);

-- Question 9 (2 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (9, '選択肢9-1', false, 1),
  (9, '選択肢9-2', true, 2);

-- Question 10 (3 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (10, '選択肢10-1', true, 1),
  (10, '選択肢10-2', false, 2),
  (10, '選択肢10-3', false, 3);

-- Question 11 (4 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (11, '選択肢11-1', false, 1),
  (11, '選択肢11-2', false, 2),
  (11, '選択肢11-3', true, 3),
  (11, '選択肢11-4', false, 4);

-- Question 12 (3 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (12, '選択肢12-1', true, 1),
  (12, '選択肢12-2', false, 2),
  (12, '選択肢12-3', false, 3);

-- Question 13 (2 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (13, '選択肢13-1', false, 1),
  (13, '選択肢13-2', true, 2);

-- Question 14 (4 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (14, '選択肢14-1', false, 1),
  (14, '選択肢14-2', true, 2),
  (14, '選択肢14-3', false, 3),
  (14, '選択肢14-4', false, 4);

-- Question 15 (3 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (15, '選択肢15-1', false, 1),
  (15, '選択肢15-2', false, 2),
  (15, '選択肢15-3', true, 3);

-- Question 16 (2 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (16, '選択肢16-1', true, 1),
  (16, '選択肢16-2', false, 2);

-- Question 17 (4 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (17, '選択肢17-1', false, 1),
  (17, '選択肢17-2', false, 2),
  (17, '選択肢17-3', false, 3),
  (17, '選択肢17-4', true, 4);

-- Question 18 (3 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (18, '選択肢18-1', false, 1),
  (18, '選択肢18-2', true, 2),
  (18, '選択肢18-3', false, 3);

-- Question 19 (2 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (19, '選択肢19-1', true, 1),
  (19, '選択肢19-2', false, 2);

-- Question 20 (3 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (20, '選択肢20-1', false, 1),
  (20, '選択肢20-2', false, 2),
  (20, '選択肢20-3', true, 3);

-- Question 21 (4 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (21, '選択肢21-1', false, 1),
  (21, '選択肢21-2', true, 2),
  (21, '選択肢21-3', false, 3),
  (21, '選択肢21-4', false, 4);

-- Question 22 (2 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (22, '選択肢22-1', false, 1),
  (22, '選択肢22-2', true, 2);

-- Question 23 (3 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (23, '選択肢23-1', true, 1),
  (23, '選択肢23-2', false, 2),
  (23, '選択肢23-3', false, 3);

-- Question 24 (4 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (24, '選択肢24-1', false, 1),
  (24, '選択肢24-2', false, 2),
  (24, '選択肢24-3', true, 3),
  (24, '選択肢24-4', false, 4);

-- Question 25 (2 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (25, '選択肢25-1', true, 1),
  (25, '選択肢25-2', false, 2);

-- Question 26 (3 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (26, '選択肢26-1', false, 1),
  (26, '選択肢26-2', true, 2),
  (26, '選択肢26-3', false, 3);

-- Question 27 (4 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (27, '選択肢27-1', false, 1),
  (27, '選択肢27-2', false, 2),
  (27, '選択肢27-3', false, 3),
  (27, '選択肢27-4', true, 4);

-- Question 28 (3 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (28, '選択肢28-1', true, 1),
  (28, '選択肢28-2', false, 2),
  (28, '選択肢28-3', false, 3);

-- Question 29 (2 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (29, '選択肢29-1', false, 1),
  (29, '選択肢29-2', true, 2);

-- Question 30 (4 choices)
INSERT INTO choices (question_id, text, is_correct, order_num)
VALUES 
  (30, '選択肢30-1', false, 1),
  (30, '選択肢30-2', true, 2),
  (30, '選択肢30-3', false, 3),
  (30, '選択肢30-4', false, 4);

-- Insert quiz_control for the event (event_id = 1)
INSERT INTO quiz_control (event_id, current_screen)
VALUES (
  1,
  'waiting'
);
