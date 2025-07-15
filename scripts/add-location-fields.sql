-- Add location and geo-targeting fields to accounts table
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS service_locations JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS target_regions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS location_strategy VARCHAR(100) DEFAULT 'local',
ADD COLUMN IF NOT EXISTS primary_location JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS monthly_blog_count INTEGER DEFAULT 2;

-- Add location fields to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS target_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS local_keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS geo_modifiers TEXT[] DEFAULT '{}';

-- Add location fields to blogs table
ALTER TABLE blogs 
ADD COLUMN IF NOT EXISTS target_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS local_keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS geo_modifiers TEXT[] DEFAULT '{}';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_service_locations ON accounts USING GIN (service_locations);
CREATE INDEX IF NOT EXISTS idx_accounts_target_regions ON accounts USING GIN (target_regions);
CREATE INDEX IF NOT EXISTS idx_posts_target_location ON posts (target_location);
CREATE INDEX IF NOT EXISTS idx_blogs_target_location ON blogs (target_location);
