-- Migration 007: JWT role injection hook
-- Injects the user's role from public.users into Supabase Auth JWT claims.
-- This is what makes auth.jwt()->>'role' = 'admin' work in RLS policies.
-- Without this hook, all admin write policies silently fail.

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims    JSONB;
  user_role TEXT;
BEGIN
  -- Fetch the user's role from the public.users table
  SELECT role INTO user_role
  FROM public.users
  WHERE id = (event->>'user_id')::UUID;

  -- Extract current claims from the event
  claims := event->'claims';

  -- Inject the role into claims (defaults to 'public' if not found)
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
  ELSE
    claims := jsonb_set(claims, '{role}', '"public"');
  END IF;

  -- Return the modified event with updated claims
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

-- Grant permissions required by Supabase Auth to call this function
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;