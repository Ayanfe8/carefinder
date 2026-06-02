-- Migration 003: GIST spatial index on hospitals.location
-- Essential for PostGIS ST_DWithin query performance at scale.
-- Must exist before any geospatial queries run in production.

CREATE INDEX hospitals_location_idx
  ON public.hospitals
  USING GIST (location);