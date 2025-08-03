# 🔧 Fix Upload Error: Supabase RLS Policy Setup

## The Problem
You're seeing "new row violates row-level security policy" because Supabase has Row Level Security (RLS) enabled but no policies allow file uploads.

## Quick Fix - Option 1: Allow Anonymous Uploads (Easiest)

**Go to your Supabase Dashboard → SQL Editor and run this:**

```sql
-- Allow anonymous users to upload to screenshots bucket
CREATE POLICY "Allow anonymous uploads to screenshots" ON storage.objects
FOR INSERT 
TO anon 
WITH CHECK (bucket_id = 'screenshots');

-- Allow anyone to view screenshots (since bucket is public)
CREATE POLICY "Allow public to view screenshots" ON storage.objects
FOR SELECT 
TO public 
USING (bucket_id = 'screenshots');

-- Allow anonymous users to delete screenshots
CREATE POLICY "Allow anonymous to delete screenshots" ON storage.objects
FOR DELETE 
TO anon 
USING (bucket_id = 'screenshots');
```

## Alternative - Option 2: Require Authentication (More Secure)

If you want users to be logged in before uploading:

```sql
-- Only allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads to screenshots" ON storage.objects
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'screenshots');

-- Allow anyone to view screenshots
CREATE POLICY "Allow public to view screenshots" ON storage.objects
FOR SELECT 
TO public 
USING (bucket_id = 'screenshots');

-- Only allow authenticated users to delete
CREATE POLICY "Allow authenticated to delete screenshots" ON storage.objects
FOR DELETE 
TO authenticated 
USING (bucket_id = 'screenshots');
```

## Step-by-Step Instructions

1. **Open Supabase Dashboard**: Go to your project at https://supabase.com/dashboard
2. **Navigate to SQL Editor**: Click "SQL Editor" in the left sidebar
3. **Run the SQL**: Copy one of the SQL blocks above and paste it, then click "RUN"
4. **Test Upload**: Go back to your app and try uploading again

## Verify Your Bucket Settings

Also make sure your `screenshots` bucket exists and is configured properly:

1. Go to **Storage** in Supabase Dashboard
2. Check that `screenshots` bucket exists
3. Verify it's set to **Public** 
4. File size limit should be around 10MB

## After Running SQL

Once you run the SQL, try uploading a screenshot again. The error should be gone!

---

**Recommendation**: Start with Option 1 (anonymous uploads) for testing, then switch to Option 2 (authenticated) when you're ready for production.
