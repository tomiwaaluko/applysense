# Supabase Storage Setup for Screenshots

## Step 1: Configure Supabase Storage

1. In your Supabase dashboard, go to **Storage** → **Create a new bucket**
2. Bucket name: `screenshots`
3. Access level: **Public** (for now — you can secure it later)
4. Click **Create**

## Step 2: Set Environment Variables

Add these to your `.env` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 3: Install Dependencies

```bash
npm install @supabase/supabase-js
```

## Step 4: Test Upload

1. Start your development server: `npm run dev`
2. Go to `/jobs` page
3. Add a new job and try uploading a screenshot

## Features Implemented

- ✅ File upload component with drag & drop
- ✅ Image validation (type & size)
- ✅ Screenshot storage in Supabase
- ✅ Public URL generation
- ✅ File deletion when job is deleted
- ✅ Preview images in job cards
- ✅ TRPC integration for job management

## Security Considerations

For production, consider:

- Setting up RLS (Row Level Security) policies
- Restricting file types and sizes
- Adding user-based access controls
- Using signed URLs for private content
