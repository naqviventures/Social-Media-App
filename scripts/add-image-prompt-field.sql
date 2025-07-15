-- Add image_prompt column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_prompt TEXT;

-- Update existing posts with empty image prompts
UPDATE posts SET image_prompt = '' WHERE image_prompt IS NULL;
