-- Add location radius and statewide fields
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS primary_location_radius INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS primary_location_statewide BOOLEAN DEFAULT FALSE;

-- Update service_locations to support radius and statewide
-- Note: service_locations is stored as JSONB, so we don't need to alter the column structure
-- The JSON objects will include radius and is_statewide fields

-- Update existing accounts with default radius values
UPDATE accounts 
SET 
  primary_location_radius = COALESCE(primary_location_radius, 25),
  primary_location_statewide = COALESCE(primary_location_statewide, FALSE)
WHERE primary_location_radius IS NULL OR primary_location_statewide IS NULL;
