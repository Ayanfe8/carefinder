-- Migration 001: Create users table
-- Stores public-facing user profiles linked to Supabase Auth.
-- The role field drives all RLS policies across the application.

CREATE TABLE public.users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'public'
               CHECK (role IN ('public', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own row only
CREATE POLICY "users_read_own"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own row only
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);