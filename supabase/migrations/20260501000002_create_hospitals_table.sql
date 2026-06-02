-- Migration 002: Create hospitals table
-- Core table for the hospital directory.
-- Includes PostGIS geography column for geospatial search.
-- status field added for v2 self-registration compatibility.

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE public.hospitals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  address        TEXT NOT NULL,
  city           TEXT NOT NULL,
  lga            TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT,
  specialties    TEXT[] DEFAULT '{}',
  ownership      TEXT CHECK (ownership IN ('public', 'private')),
  location       GEOGRAPHY(POINT, 4326),
  description_md TEXT,
  visiting_hours TEXT,
  rating_avg     NUMERIC(3,2) DEFAULT 0,
  review_count   INT DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'published'
                   CHECK (status IN ('draft', 'pending_review', 'published')),
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- Public can read all published hospitals
CREATE POLICY "hospitals_read_all"
  ON public.hospitals
  FOR SELECT
  USING (status = 'published');

-- Admin only insert
CREATE POLICY "hospitals_admin_insert"
  ON public.hospitals
  FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Admin only update
CREATE POLICY "hospitals_admin_update"
  ON public.hospitals
  FOR UPDATE
  USING (auth.jwt()->>'role' = 'admin');

-- Admin only delete
CREATE POLICY "hospitals_admin_delete"
  ON public.hospitals
  FOR DELETE
  USING (auth.jwt()->>'role' = 'admin');