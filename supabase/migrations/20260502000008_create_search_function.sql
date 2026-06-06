-- Migration 008: search_hospitals function
-- Combines full-text search (name, city, LGA), specialty/ownership filters,
-- and PostGIS ST_DWithin radius in a single query.
-- Returns all Hospital fields (no raw GEOGRAPHY column) plus distance_km.
-- Called via supabase.rpc('search_hospitals', params).
-- DROP first: cannot use CREATE OR REPLACE when the remote function has a
-- different return type (e.g. the migration 009 version with lat/lng columns).
DROP FUNCTION IF EXISTS public.search_hospitals CASCADE;

CREATE FUNCTION public.search_hospitals(
  p_query        TEXT             DEFAULT NULL,
  p_specialties  TEXT[]           DEFAULT NULL,
  p_ownership    TEXT             DEFAULT NULL,
  p_lat          DOUBLE PRECISION DEFAULT NULL,
  p_lng          DOUBLE PRECISION DEFAULT NULL,
  p_radius_km    DOUBLE PRECISION DEFAULT NULL,
  p_sort_by      TEXT             DEFAULT 'name',
  p_limit        INT              DEFAULT 20,
  p_offset       INT              DEFAULT 0
)
RETURNS TABLE (
  id             UUID,
  name           TEXT,
  address        TEXT,
  city           TEXT,
  lga            TEXT,
  phone          TEXT,
  email          TEXT,
  specialties    TEXT[],
  ownership      TEXT,
  description_md TEXT,
  visiting_hours TEXT,
  rating_avg     NUMERIC(3,2),
  review_count   INT,
  status         TEXT,
  created_by     UUID,
  created_at     TIMESTAMPTZ,
  distance_km    DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    h.id,
    h.name,
    h.address,
    h.city,
    h.lga,
    h.phone,
    h.email,
    h.specialties,
    h.ownership,
    h.description_md,
    h.visiting_hours,
    h.rating_avg,
    h.review_count,
    h.status,
    h.created_by,
    h.created_at,
    CASE
      WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL
      THEN ST_Distance(h.location, ST_MakePoint(p_lng, p_lat)::GEOGRAPHY) / 1000.0
      ELSE NULL::DOUBLE PRECISION
    END AS distance_km
  FROM public.hospitals h
  WHERE h.status = 'published'
    -- full-text: name, city, or LGA contains query string
    AND (
      p_query IS NULL OR p_query = '' OR
      h.name ILIKE '%' || p_query || '%' OR
      h.city ILIKE '%' || p_query || '%' OR
      h.lga  ILIKE '%' || p_query || '%'
    )
    -- specialty: hospital must have at least one of the requested specialties
    AND (
      p_specialties IS NULL OR
      cardinality(p_specialties) = 0 OR
      h.specialties && p_specialties
    )
    -- ownership: exact match when specified
    AND (p_ownership IS NULL OR p_ownership = '' OR h.ownership = p_ownership)
    -- radius: ST_DWithin only applied when all three params are present
    AND (
      p_lat IS NULL OR p_lng IS NULL OR p_radius_km IS NULL OR
      ST_DWithin(
        h.location,
        ST_MakePoint(p_lng, p_lat)::GEOGRAPHY,
        p_radius_km * 1000.0
      )
    )
  ORDER BY
    -- rating sort: highest first; null when not active (falls to next clause)
    CASE WHEN p_sort_by = 'rating'
         THEN h.rating_avg
    END DESC NULLS LAST,
    -- distance sort: nearest first; null when no geolocation (falls to name)
    CASE WHEN p_sort_by = 'distance' AND p_lat IS NOT NULL AND p_lng IS NOT NULL
         THEN ST_Distance(h.location, ST_MakePoint(p_lng, p_lat)::GEOGRAPHY)
    END ASC NULLS LAST,
    -- name is always the final tiebreaker
    h.name ASC
  LIMIT  GREATEST(1, LEAST(COALESCE(p_limit, 20), 100))
  OFFSET GREATEST(0, COALESCE(p_offset, 0));
$$;

-- Grant execute to PostgREST API roles
GRANT EXECUTE ON FUNCTION public.search_hospitals TO anon, authenticated;
