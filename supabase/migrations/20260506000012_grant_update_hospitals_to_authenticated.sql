-- Migration 012: Grant UPDATE on hospitals to authenticated role
-- Root cause: the rating trigger (create_rating_trigger.sql) updates
-- hospitals.rating_avg and hospitals.review_count whenever a review is
-- inserted/updated/deleted. RLS policies alone do not grant table-level
-- privileges — Postgres requires both. The authenticated role had RLS
-- policies but no UPDATE grant on hospitals, causing error 42501
-- (permission denied for table hospitals).

GRANT UPDATE (rating_avg, review_count) ON public.hospitals TO authenticated;
