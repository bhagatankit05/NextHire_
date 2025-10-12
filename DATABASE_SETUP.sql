-- NextHire Database Setup
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- ============================================
-- 1. Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS public."Users" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  picture TEXT,
  credits INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Users table
ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON public."Users"
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON public."Users"
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = email)
  WITH CHECK (auth.jwt() ->> 'email' = email);

-- Allow insert for new users
CREATE POLICY "Users can insert own data"
  ON public."Users"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = email);

-- ============================================
-- 2. Interviews Table
-- ============================================
CREATE TABLE IF NOT EXISTS public."Interviews" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id TEXT UNIQUE NOT NULL,
  "jobPosition" TEXT,
  "jobDescription" TEXT,
  duration INTEGER,
  type TEXT[],
  "questionList" JSONB,
  questions JSONB,
  "userEmail" TEXT,
  "created_by" TEXT,
  "resume_used" BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Interviews table
ALTER TABLE public."Interviews" ENABLE ROW LEVEL SECURITY;

-- Users can read their own interviews
CREATE POLICY "Users can read own interviews"
  ON public."Interviews"
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = "userEmail"
    OR auth.jwt() ->> 'email' = "created_by"
  );

-- Anyone can read interviews (for taking interviews)
CREATE POLICY "Anyone can read interviews by ID"
  ON public."Interviews"
  FOR SELECT
  TO anon
  USING (true);

-- Users can insert interviews
CREATE POLICY "Users can insert interviews"
  ON public."Interviews"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'email' = "userEmail"
    OR auth.jwt() ->> 'email' = "created_by"
  );

-- Users can update their own interviews
CREATE POLICY "Users can update own interviews"
  ON public."Interviews"
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = "userEmail"
    OR auth.jwt() ->> 'email' = "created_by"
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = "userEmail"
    OR auth.jwt() ->> 'email' = "created_by"
  );

-- ============================================
-- 3. Create Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public."Users"(email);
CREATE INDEX IF NOT EXISTS idx_interviews_interview_id ON public."Interviews"(interview_id);
CREATE INDEX IF NOT EXISTS idx_interviews_user_email ON public."Interviews"("userEmail");
CREATE INDEX IF NOT EXISTS idx_interviews_created_by ON public."Interviews"("created_by");

-- ============================================
-- 4. Enable Google OAuth
-- ============================================
-- Go to Authentication > Providers in Supabase Dashboard
-- Enable Google provider and add your OAuth credentials
