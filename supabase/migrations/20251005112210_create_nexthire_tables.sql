/*
  # NextHire Database Setup
  
  1. New Tables
    - `Users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `picture` (text)
      - `credits` (integer, default 10)
      - `created_at` (timestamptz)
    
    - `Interviews`
      - `id` (uuid, primary key)
      - `interview_id` (text, unique)
      - `jobPosition` (text)
      - `jobDescription` (text)
      - `duration` (integer)
      - `type` (text array)
      - `questionList` (jsonb)
      - `questions` (jsonb)
      - `userEmail` (text)
      - `created_by` (text)
      - `resume_used` (boolean)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Users can read/update their own data
    - Anyone (anon) can read interviews by ID (for taking interviews)
    - Authenticated users can create and manage their interviews
  
  3. Indexes
    - Performance indexes on email and interview_id fields
*/

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
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'Users' AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data"
      ON public."Users"
      FOR SELECT
      TO authenticated
      USING (auth.jwt() ->> 'email' = email);
  END IF;
END $$;

-- Users can update their own data
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'Users' AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data"
      ON public."Users"
      FOR UPDATE
      TO authenticated
      USING (auth.jwt() ->> 'email' = email)
      WITH CHECK (auth.jwt() ->> 'email' = email);
  END IF;
END $$;

-- Allow insert for new users
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'Users' AND policyname = 'Users can insert own data'
  ) THEN
    CREATE POLICY "Users can insert own data"
      ON public."Users"
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.jwt() ->> 'email' = email);
  END IF;
END $$;

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
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'Interviews' AND policyname = 'Users can read own interviews'
  ) THEN
    CREATE POLICY "Users can read own interviews"
      ON public."Interviews"
      FOR SELECT
      TO authenticated
      USING (
        auth.jwt() ->> 'email' = "userEmail"
        OR auth.jwt() ->> 'email' = "created_by"
      );
  END IF;
END $$;

-- CRITICAL: Anyone can read interviews by ID (for taking interviews)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'Interviews' AND policyname = 'Anyone can read interviews by ID'
  ) THEN
    CREATE POLICY "Anyone can read interviews by ID"
      ON public."Interviews"
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Users can insert interviews
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'Interviews' AND policyname = 'Users can insert interviews'
  ) THEN
    CREATE POLICY "Users can insert interviews"
      ON public."Interviews"
      FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.jwt() ->> 'email' = "userEmail"
        OR auth.jwt() ->> 'email' = "created_by"
      );
  END IF;
END $$;

-- Users can update their own interviews
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'Interviews' AND policyname = 'Users can update own interviews'
  ) THEN
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
  END IF;
END $$;

-- ============================================
-- 3. Create Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public."Users"(email);
CREATE INDEX IF NOT EXISTS idx_interviews_interview_id ON public."Interviews"(interview_id);
CREATE INDEX IF NOT EXISTS idx_interviews_user_email ON public."Interviews"("userEmail");
CREATE INDEX IF NOT EXISTS idx_interviews_created_by ON public."Interviews"("created_by");