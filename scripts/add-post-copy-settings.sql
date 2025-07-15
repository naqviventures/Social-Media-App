-- Add post copy settings columns to accounts table
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS post_length VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS emoji_usage VARCHAR(20) DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS hashtag_strategy VARCHAR(20) DEFAULT 'targeted',
ADD COLUMN IF NOT EXISTS cta_style VARCHAR(20) DEFAULT 'question';

-- Update existing accounts with default values
UPDATE accounts 
SET 
  post_length = COALESCE(post_length, 'medium'),
  emoji_usage = COALESCE(emoji_usage, 'moderate'),
  hashtag_strategy = COALESCE(hashtag_strategy, 'targeted'),
  cta_style = COALESCE(cta_style, 'question')
WHERE post_length IS NULL OR emoji_usage IS NULL OR hashtag_strategy IS NULL OR cta_style IS NULL;
