-- Create blogs table for SEO content
CREATE TABLE IF NOT EXISTS blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  target_keyword TEXT,
  secondary_keywords TEXT[],
  word_count INTEGER,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add SEO settings to accounts table
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS monthly_blog_count INTEGER DEFAULT 2;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS target_keywords TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS competitor_urls TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blogs_account_id ON blogs(account_id);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON blogs(published_at);
CREATE INDEX IF NOT EXISTS idx_blogs_target_keyword ON blogs(target_keyword);

-- Update existing accounts with default blog settings
UPDATE accounts SET 
  monthly_blog_count = 2,
  target_keywords = COALESCE(target_keywords, ''),
  competitor_urls = COALESCE(competitor_urls, '')
WHERE monthly_blog_count IS NULL;
