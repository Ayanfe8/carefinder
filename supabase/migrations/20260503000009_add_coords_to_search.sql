-- Migration 009: Add latitude/longitude to search_hospitals return type
-- Required for the Mapbox GL JS map to position markers.
-- ST_X(GEOMETRY) = longitude, ST_Y(GEOMETRY) = latitude for WGS84 points.
-- Must DROP first — Postgres cannot change a function's return type in-place.

DROP FUNCTION IF EXISTS public.search_hospitals(text, text[], text, double precision, double precision, double precision, text, integer, integer);

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
  latitude       DOUBLE PRECISION,
  longitude      DOUBLE PRECISION,
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
    ST_Y(h.location::GEOMETRY)                                               AS latitude,
    ST_X(h.location::GEOMETRY)                                               AS longitude,
    CASE
      WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL
      THEN ST_Distance(h.location, ST_MakePoint(p_lng, p_lat)::GEOGRAPHY) / 1000.0
      ELSE NULL::DOUBLE PRECISION
    END                                                                      AS distance_km
  FROM public.hospitals h
  WHERE h.status = 'published'
    AND (
      p_query IS NULL OR p_query = '' OR
      h.name ILIKE '%' || p_query || '%' OR
      h.city ILIKE '%' || p_query || '%' OR
      h.lga  ILIKE '%' || p_query || '%'
    )
    AND (
      p_specialties IS NULL OR
      cardinality(p_specialties) = 0 OR
      h.specialties && p_specialties
    )
    AND (p_ownership IS NULL OR p_ownership = '' OR h.ownership = p_ownership)
    AND (
      p_lat IS NULL OR p_lng IS NULL OR p_radius_km IS NULL OR
      ST_DWithin(
        h.location,
        ST_MakePoint(p_lng, p_lat)::GEOGRAPHY,
        p_radius_km * 1000.0
      )
    )
  ORDER BY
    CASE WHEN p_sort_by = 'rating'
         THEN h.rating_avg
    END DESC NULLS LAST,
    CASE WHEN p_sort_by = 'distance' AND p_lat IS NOT NULL AND p_lng IS NOT NULL
         THEN ST_Distance(h.location, ST_MakePoint(p_lng, p_lat)::GEOGRAPHY)
    END ASC NULLS LAST,
    h.name ASC
  LIMIT  GREATEST(1, LEAST(COALESCE(p_limit, 20), 100))
  OFFSET GREATEST(0, COALESCE(p_offset, 0));
$$;

GRANT EXECUTE ON FUNCTION public.search_hospitals TO anon, authenticated;
