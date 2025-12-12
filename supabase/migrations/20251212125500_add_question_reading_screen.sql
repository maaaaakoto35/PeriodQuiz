-- Add 'question_reading' to quiz_control current_screen check constraint

-- Drop the existing constraint
ALTER TABLE quiz_control DROP CONSTRAINT IF EXISTS quiz_control_current_screen_check;

-- Add the new constraint with 'question_reading' included
ALTER TABLE quiz_control ADD CONSTRAINT quiz_control_current_screen_check
CHECK (current_screen IN ('waiting', 'question_reading', 'question', 'answer_check', 'answer', 'break', 'period_result', 'final_result'));
