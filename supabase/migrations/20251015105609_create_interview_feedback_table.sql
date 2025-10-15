/*
  # Create Interview Feedback Table
  
  1. New Table
    - `interview_feedback`
      - `id` (uuid, primary key)
      - `userName` (text) - Name of the candidate
      - `userEmail` (text) - Email of the candidate
      - `interview_id` (text) - Reference to interview
      - `feedback` (jsonb) - AI-generated feedback JSON
      - `recommended` (boolean) - Whether candidate is recommended for hire
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Anyone can insert feedback (candidates submitting feedback)
    - Only authenticated users can read feedback for their interviews
  
  3. Indexes
    - Performance index on interview_id
*/

CREATE TABLE IF NOT EXISTS public.interview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userName" TEXT,
  "userEmail" TEXT,
  interview_id TEXT NOT NULL,
  feedback JSONB,
  recommended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interview_feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can insert feedback (for candidates completing interviews)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'interview_feedback' AND policyname = 'Anyone can insert feedback'
  ) THEN
    CREATE POLICY "Anyone can insert feedback"
      ON public.interview_feedback
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Authenticated users can read feedback for interviews they created
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'interview_feedback' AND policyname = 'Users can read feedback for their interviews'
  ) THEN
    CREATE POLICY "Users can read feedback for their interviews"
      ON public.interview_feedback
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public."Interviews"
          WHERE public."Interviews".interview_id = public.interview_feedback.interview_id
          AND (
            auth.jwt() ->> 'email' = public."Interviews"."userEmail"
            OR auth.jwt() ->> 'email' = public."Interviews"."created_by"
          )
        )
      );
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_interview_feedback_interview_id ON public.interview_feedback(interview_id);
