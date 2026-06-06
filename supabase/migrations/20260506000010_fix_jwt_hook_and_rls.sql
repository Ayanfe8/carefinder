-- Migration 010: Fix JWT hook and RLS policies
-- Root cause: custom_access_token_hook was injecting the user role into the
-- top-level JWT 'role' claim. PostgREST reads that specific claim and executes
-- SET LOCAL ROLE "{value}" before every query. Since 'public' is a schema in
-- Postgres (not a database role), every anonymous request crashed with:
--   error 22023 'role "public" does not exist'
--
-- Fix: inject into app_metadata.role (a nested claim PostgREST ignores) and
-- update all admin RLS policies to read from there instead.

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims    JSONB;
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = (event->>'user_id')::UUID;

  claims := event->'claims';

  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{app_metadata,role}', to_jsonb(user_role));
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- hospitals admin policies
DROP POLICY IF EXISTS "hospitals_admin_insert" ON public.hospitals;
DROP POLICY IF EXISTS "hospitals_admin_update" ON public.hospitals;
DROP POLICY IF EXISTS "hospitals_admin_delete" ON public.hospitals;

CREATE POLICY "hospitals_admin_insert"
  ON public.hospitals
  FOR INSERT
  WITH CHECK ((auth.jwt()->'app_metadata'->>'role') = 'admin');

CREATE POLICY "hospitals_admin_update"
  ON public.hospitals
  FOR UPDATE
  USING ((auth.jwt()->'app_metadata'->>'role') = 'admin');

CREATE POLICY "hospitals_admin_delete"
  ON public.hospitals
  FOR DELETE
  USING ((auth.jwt()->'app_metadata'->>'role') = 'admin');

-- reviews admin moderation policy
DROP POLICY IF EXISTS "reviews_admin_moderate" ON public.reviews;

CREATE POLICY "reviews_admin_moderate"
  ON public.reviews
  FOR UPDATE
  USING ((auth.jwt()->'app_metadata'->>'role') = 'admin');

-- hospital_images admin policies
DROP POLICY IF EXISTS "hospital_images_admin_insert" ON public.hospital_images;
DROP POLICY IF EXISTS "hospital_images_admin_delete" ON public.hospital_images;

CREATE POLICY "hospital_images_admin_insert"
  ON public.hospital_images
  FOR INSERT
  WITH CHECK ((auth.jwt()->'app_metadata'->>'role') = 'admin');

CREATE POLICY "hospital_images_admin_delete"
  ON public.hospital_images
  FOR DELETE
  USING ((auth.jwt()->'app_metadata'->>'role') = 'admin');
