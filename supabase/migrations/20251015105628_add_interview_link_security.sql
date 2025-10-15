/*
  # Add Interview Link Security Features

  1. New Columns to Interviews Table
    - `link_expires_at` (timestamptz) - Optional expiration date for interview links
    - `access_token` (text) - Secure token for accessing interviews
    - `is_link_active` (boolean) - Toggle to enable/disable interview links
    - `max_attempts` (integer) - Maximum number of times the interview can be accessed
    - `attempt_count` (integer) - Current number of access attempts

  2. Security Features
    - Add index on access_token for quick lookups
    - Update RLS policy to check link expiration and active status
    - Support for time-limited interview links

  3. Notes
    - Existing interviews will have is_link_active set to true by default
    - No expiration date by default (null = never expires)
    - access_token will be generated when sharing links
*/

-- Add new security columns to Interviews table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Interviews' AND column_name = 'link_expires_at'
  ) THEN
    ALTER TABLE public."Interviews" ADD COLUMN link_expires_at TIMESTAMPTZ DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Interviews' AND column_name = 'access_token'
  ) THEN
    ALTER TABLE public."Interviews" ADD COLUMN access_token TEXT DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Interviews' AND column_name = 'is_link_active'
  ) THEN
    ALTER TABLE public."Interviews" ADD COLUMN is_link_active BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Interviews' AND column_name = 'max_attempts'
  ) THEN
    ALTER TABLE public."Interviews" ADD COLUMN max_attempts INTEGER DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Interviews' AND column_name = 'attempt_count'
  ) THEN
    ALTER TABLE public."Interviews" ADD COLUMN attempt_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create index on access_token for performance
CREATE INDEX IF NOT EXISTS idx_interviews_access_token ON public."Interviews"(access_token);

-- Update the anonymous access policy to check link validity
DROP POLICY IF EXISTS "Anyone can read interviews by ID" ON public."Interviews";

CREATE POLICY "Anyone can read valid interviews by ID"
  ON public."Interviews"
  FOR SELECT
  TO anon
  USING (
    is_link_active = true
    AND (link_expires_at IS NULL OR link_expires_at > now())
    AND (max_attempts IS NULL OR attempt_count < max_attempts)
  );

-- Add policy for authenticated users to bypass link restrictions on their own interviews
DROP POLICY IF EXISTS "Users can read own interviews" ON public."Interviews";

CREATE POLICY "Users can read own interviews"
  ON public."Interviews"
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = "userEmail"
    OR auth.jwt() ->> 'email' = "created_by"
  );
