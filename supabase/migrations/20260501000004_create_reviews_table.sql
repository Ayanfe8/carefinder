-- Migration 004: Create reviews table
-- Stores user-submitted ratings and text reviews for hospitals.
-- status field controls moderation queue visibility.

CREATE TABLE public.reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id),
  rating      INT CHECK (rating BETWEEN 1 AND 5),
  text        TEXT,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('approved', 'hidden', 'pending')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public can read approved reviews only
CREATE POLICY "reviews_read_approved"
  ON public.reviews
  FOR SELECT
  USING (status = 'approved');

-- Authenticated users can insert their own reviews
CREATE POLICY "reviews_user_insert"
  ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews only
CREATE POLICY "reviews_user_update_own"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can moderate any review
CREATE POLICY "reviews_admin_moderate"
  ON public.reviews
  FOR UPDATE
  USING (auth.jwt()->>'role' = 'admin');