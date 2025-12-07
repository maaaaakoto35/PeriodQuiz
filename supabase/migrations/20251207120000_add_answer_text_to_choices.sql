-- Add answer_text field to choices table
-- Purpose: Store alternative text displayed during answer reveal on monitor screen

ALTER TABLE choices
ADD COLUMN answer_text TEXT;

COMMENT ON COLUMN choices.answer_text IS 'モニター画面の正解発表時に表示される専用テキスト（任意）';
