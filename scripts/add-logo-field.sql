-- Add logo_url field to accounts table
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Update existing accounts with placeholder logos
UPDATE accounts SET logo_url = CASE 
  WHEN logo_url IS NULL OR logo_url = '' THEN '/placeholder.svg?height=40&width=40&text=' || LEFT(name, 1)
  ELSE logo_url
END;
