-- Verify all required fields exist in the accounts table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'accounts' 
ORDER BY ordinal_position;

-- Check if any accounts exist and show their data
SELECT id, name, industry, 
       CASE WHEN products IS NOT NULL THEN 'Has products' ELSE 'No products' END as products_status,
       CASE WHEN expertise IS NOT NULL THEN 'Has expertise' ELSE 'No expertise' END as expertise_status,
       CASE WHEN visual_style IS NOT NULL THEN 'Has visual_style' ELSE 'No visual_style' END as visual_style_status,
       CASE WHEN image_style IS NOT NULL THEN 'Has image_style' ELSE 'No image_style' END as image_style_status,
       updated_at
FROM accounts 
ORDER BY updated_at DESC;

-- Show the structure of the accounts table
\d accounts;
