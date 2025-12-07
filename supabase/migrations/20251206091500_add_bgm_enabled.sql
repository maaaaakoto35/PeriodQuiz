-- Add BGM control field to quiz_control table
-- Created: 2025-12-06

ALTER TABLE quiz_control
ADD COLUMN bgm_enabled BOOLEAN NOT NULL DEFAULT false;
