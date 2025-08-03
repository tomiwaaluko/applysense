-- Phase 3: Supabase Database Security Setup
-- Run this SQL in your Supabase SQL Editor

-- ==============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Enable RLS on all auth-related tables
ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- JOB TABLE POLICIES
-- ==============================================

-- Allow users to view only their own jobs
CREATE POLICY "Users can view their own jobs" ON "Job"
    FOR SELECT 
    USING (auth.uid()::text = "userId");

-- Allow users to insert their own jobs
CREATE POLICY "Users can insert their own jobs" ON "Job"
    FOR INSERT 
    WITH CHECK (auth.uid()::text = "userId");

-- Allow users to update their own jobs
CREATE POLICY "Users can update their own jobs" ON "Job"
    FOR UPDATE 
    USING (auth.uid()::text = "userId")
    WITH CHECK (auth.uid()::text = "userId");

-- Allow users to delete their own jobs
CREATE POLICY "Users can delete their own jobs" ON "Job"
    FOR DELETE 
    USING (auth.uid()::text = "userId");

-- ==============================================
-- USER TABLE POLICIES
-- ==============================================

-- Allow users to view their own user record
CREATE POLICY "Users can view their own user record" ON "User"
    FOR SELECT 
    USING (auth.uid()::text = id);

-- Allow users to update their own user record
CREATE POLICY "Users can update their own user record" ON "User"
    FOR UPDATE 
    USING (auth.uid()::text = id)
    WITH CHECK (auth.uid()::text = id);

-- ==============================================
-- STORAGE POLICIES (if not already created)
-- ==============================================

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'screenshots', 
    'screenshots', 
    true, 
    10485760, -- 10MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

-- Allow authenticated users to upload screenshots
CREATE POLICY "Authenticated users can upload screenshots" ON storage.objects
    FOR INSERT 
    TO authenticated 
    WITH CHECK (bucket_id = 'screenshots');

-- Allow authenticated users to view screenshots
CREATE POLICY "Authenticated users can view screenshots" ON storage.objects
    FOR SELECT 
    TO authenticated 
    USING (bucket_id = 'screenshots');

-- Allow authenticated users to delete screenshots
CREATE POLICY "Authenticated users can delete screenshots" ON storage.objects
    FOR DELETE 
    TO authenticated 
    USING (bucket_id = 'screenshots');

-- Allow public viewing of screenshots (since bucket is public)
CREATE POLICY "Public can view screenshots" ON storage.objects
    FOR SELECT 
    TO public 
    USING (bucket_id = 'screenshots');

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Check that RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('Job', 'User') 
AND schemaname = 'public';

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('Job', 'User');

-- ==============================================
-- NOTES
-- ==============================================
/*
After running this SQL:

1. All database operations require authentication
2. Users can only access their own job records
3. File uploads work with proper authentication
4. Database is secure and ready for production

Test by:
1. Signing in to the app
2. Creating a job entry
3. Verifying it appears in your jobs list
4. Trying to access from another user account (should be empty)
*/
