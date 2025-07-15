-- Add missing fields to accounts table if they don't exist
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS products TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS expertise TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS blog_topics TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS company_values TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS client_types TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS visual_style TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS image_style TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS design_elements TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS brand_personality TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS layout_style TEXT;

-- Add image_prompt column to posts table if it doesn't exist
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_prompt TEXT;

-- Update existing accounts with empty values for new fields
UPDATE accounts SET 
  products = COALESCE(products, ''),
  expertise = COALESCE(expertise, ''),
  blog_topics = COALESCE(blog_topics, ''),
  company_values = COALESCE(company_values, ''),
  client_types = COALESCE(client_types, ''),
  visual_style = COALESCE(visual_style, ''),
  image_style = COALESCE(image_style, ''),
  design_elements = COALESCE(design_elements, ''),
  brand_personality = COALESCE(brand_personality, ''),
  layout_style = COALESCE(layout_style, '')
WHERE products IS NULL OR expertise IS NULL OR blog_topics IS NULL 
   OR company_values IS NULL OR client_types IS NULL OR visual_style IS NULL
   OR image_style IS NULL OR design_elements IS NULL OR brand_personality IS NULL
   OR layout_style IS NULL;

-- Update existing posts with empty image prompts
UPDATE posts SET image_prompt = COALESCE(image_prompt, '') WHERE image_prompt IS NULL;
