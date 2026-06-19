-- Migration 011: Add missing SELECT policy for users to read own reviews
-- Root cause: submitReview() inserts then immediately selects the new row
-- to return it to the client. The only existing SELECT policy restricts to
-- status='approved', so newly-inserted 'pending' reviews can't be read back,
-- causing the insert+select chain to fail even though the insert succeeded.

CREATE POLICY "reviews_user_read_own"
  ON public.reviews
  FOR SELECT
  USING (auth.uid() = user_id);
