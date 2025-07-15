-- Add social media URL fields to accounts table
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500);

-- Add additional business fields
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS products TEXT,
ADD COLUMN IF NOT EXISTS expertise TEXT,
ADD COLUMN IF NOT EXISTS blog_topics TEXT,
ADD COLUMN IF NOT EXISTS company_values TEXT,
ADD COLUMN IF NOT EXISTS client_types TEXT;

-- Add visual style fields
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS visual_style TEXT,
ADD COLUMN IF NOT EXISTS image_style VARCHAR(100) DEFAULT 'corporate_professional',
ADD COLUMN IF NOT EXISTS design_elements TEXT,
ADD COLUMN IF NOT EXISTS brand_personality TEXT,
ADD COLUMN IF NOT EXISTS layout_style TEXT;
