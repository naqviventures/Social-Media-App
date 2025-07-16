-- Add video support to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS media_type VARCHAR(10) DEFAULT 'image';

-- Update existing posts to have media_type as 'image'
UPDATE posts 
SET media_type = 'image' 
WHERE media_type IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_media_type ON posts(media_type);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('video_url', 'media_type');
