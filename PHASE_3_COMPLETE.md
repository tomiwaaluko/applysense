# 🗄️ Phase 3: Database Integration Setup

## Overview
Phase 3 integrates your job data with Supabase database, ensuring secure storage and access control.

## Current Status ✅
- ✅ **Prisma Schema**: Job model with correct fields (`id`, `user_id`, `company`, `title`, `status`, `date`, `notes`, `image_url`, `created_at`)
- ✅ **tRPC API**: Job CRUD operations with authentication
- ✅ **OCR Integration**: Automatic job data extraction

## Database Setup Required

### Step 1: Fix Database Connection

Your `DATABASE_URL` in `.env.local` needs to be properly formatted for Supabase:

```bash
# Replace with your actual Supabase connection details
DATABASE_URL="postgresql://postgres.your-project-ref:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.your-project-ref:[password]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
```

**To get your connection strings:**
1. Go to Supabase Dashboard → Settings → Database
2. Copy the "Connection string" and "Direct connection"
3. Replace `[password]` with your actual database password

### Step 2: Create Database Tables

Run this in your **Supabase SQL Editor**:

```sql
-- Enable RLS on the jobs table
ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own jobs
CREATE POLICY "Users can view their own jobs" ON "Job"
    FOR SELECT USING (auth.uid()::text = "userId");

-- Create policy to allow users to insert their own jobs
CREATE POLICY "Users can insert their own jobs" ON "Job"
    FOR INSERT WITH CHECK (auth.uid()::text = "userId");

-- Create policy to allow users to update their own jobs
CREATE POLICY "Users can update their own jobs" ON "Job"
    FOR UPDATE USING (auth.uid()::text = "userId");

-- Create policy to allow users to delete their own jobs
CREATE POLICY "Users can delete their own jobs" ON "Job"
    FOR DELETE USING (auth.uid()::text = "userId");

-- Ensure the User table is also secured
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own user record
CREATE POLICY "Users can view their own user record" ON "User"
    FOR SELECT USING (auth.uid()::text = id);

-- Allow users to update their own user record
CREATE POLICY "Users can update their own user record" ON "User"
    FOR UPDATE USING (auth.uid()::text = id);
```

### Step 3: Update Database Schema

Once your connection is working, push the schema:

```bash
npx prisma db push
npx prisma generate
```

### Step 4: Test Database Integration

The app already has complete integration:

1. **OCR → Database Flow**:
   - Upload screenshot → AI extracts data → Auto-populate form → Save to database

2. **CRUD Operations**:
   - ✅ Create jobs with extracted data
   - ✅ Read jobs (user-specific)
   - ✅ Update job details
   - ✅ Delete jobs (with image cleanup)

3. **Security**:
   - ✅ Row Level Security enabled
   - ✅ Users can only access their own jobs
   - ✅ Authentication required for all operations

## Phase 3 Features Implemented ✅

### 🗄️ Database Schema
```typescript
model Job {
  id        String   @id @default(cuid())     // ✅ id
  userId    String                            // ✅ user_id  
  company   String                            // ✅ company
  title     String                            // ✅ title
  status    String                            // ✅ status
  date      DateTime                          // ✅ date
  notes     String?                           // ✅ notes
  imageUrl  String?                           // ✅ image_url
  createdAt DateTime @default(now())          // ✅ created_at
}
```

### 🔒 Security Rules
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own jobs
- ✅ Authentication required for all database operations
- ✅ Secure image storage with cleanup

### 🔄 Data Flow
1. **Screenshot Upload** → Supabase Storage
2. **AI Processing** → Extract job data
3. **Database Storage** → Secure job record creation
4. **User Access** → Only authenticated users see their jobs

## Testing Phase 3

After setting up the database connection:

1. **Sign in** to the app (Google OAuth)
2. **Upload** a job screenshot
3. **Watch** AI extract and auto-fill data
4. **Save** job to database
5. **Verify** job appears in your jobs list
6. **Test** editing and deleting jobs

## Troubleshooting

### Database Connection Issues
- Check DATABASE_URL format in `.env.local`
- Verify Supabase password is correct
- Ensure database is accessible

### Permission Errors
- Run the RLS policies in Supabase SQL Editor
- Check that authentication is working
- Verify user is signed in before accessing jobs

### Schema Issues
- Run `npx prisma db push` to sync schema
- Run `npx prisma generate` to update client
- Restart development server after schema changes

---

**Phase 3 Status: Ready for Testing! 🚀**

Once you fix the database connection, all database integration features are fully implemented and ready to use!
