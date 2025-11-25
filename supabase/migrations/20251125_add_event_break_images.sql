-- Create event_break_images table for storing break screen images

CREATE TABLE event_break_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for event_id lookup
CREATE INDEX idx_event_break_images_event_id ON event_break_images(event_id);

-- Enable RLS
ALTER TABLE event_break_images ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read images (public break screen images)
CREATE POLICY "enable_read_all_users" ON event_break_images
  FOR SELECT
  USING (TRUE);

-- RLS Policy: Only authenticated admins can insert (via Server Action)
CREATE POLICY "enable_insert_authenticated" ON event_break_images
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policy: Only authenticated admins can delete (via Server Action)
CREATE POLICY "enable_delete_authenticated" ON event_break_images
  FOR DELETE
  USING (auth.role() = 'authenticated');
