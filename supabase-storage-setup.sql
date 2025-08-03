-- Supabase Storage Setup for Screenshots Bucket
-- Run this SQL in your Supabase SQL Editor

-- 1. Create the screenshots bucket (if not already created)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'screenshots', 
  'screenshots', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

-- 2. Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload screenshots" ON storage.objects
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'screenshots');

-- 4. Create policy to allow authenticated users to view their own files
CREATE POLICY "Allow authenticated users to view screenshots" ON storage.objects
FOR SELECT 
TO authenticated 
USING (bucket_id = 'screenshots');

-- 5. Create policy to allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated users to delete screenshots" ON storage.objects
FOR DELETE 
TO authenticated 
USING (bucket_id = 'screenshots');

-- 6. Create policy to allow authenticated users to update their own files
CREATE POLICY "Allow authenticated users to update screenshots" ON storage.objects
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'screenshots')
WITH CHECK (bucket_id = 'screenshots');

-- 7. Allow public access to view files (since the bucket is public)
CREATE POLICY "Allow public to view screenshots" ON storage.objects
FOR SELECT 
TO public 
USING (bucket_id = 'screenshots');

-- Alternative: If you want to allow anonymous uploads (less secure but simpler for testing)
-- Uncomment the following policies and comment out the authenticated ones above:

-- CREATE POLICY "Allow anonymous uploads to screenshots" ON storage.objects
-- FOR INSERT 
-- TO anon 
-- WITH CHECK (bucket_id = 'screenshots');

-- CREATE POLICY "Allow anonymous to view screenshots" ON storage.objects
-- FOR SELECT 
-- TO anon 
-- USING (bucket_id = 'screenshots');

-- CREATE POLICY "Allow anonymous to delete screenshots" ON storage.objects
-- FOR DELETE 
-- TO anon 
-- USING (bucket_id = 'screenshots');
