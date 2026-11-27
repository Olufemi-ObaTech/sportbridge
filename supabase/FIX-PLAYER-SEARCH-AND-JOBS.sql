-- =============================================================================
-- SportBridge — FIX-PLAYER-SEARCH-AND-JOBS.sql
-- Fixes:
--   1. Player search blocked by Supabase permissions
--   2. public_profile_badges relationship disambiguation
--
-- Run in: https://supabase.com/dashboard/project/qnueqhlxmtkvecppygrk/sql/new
-- =============================================================================

-- ── 1. Ensure anon can search public players ──────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Full column grant for anon player search
GRANT SELECT (
  id, profile_id, academy_id, display_name, position, secondary_position,
  age, country, nationality, region, availability, preferred_foot, foot,
  dominant_hand, height_cm, weight_kg, current_club, age_group, stats,
  primary_photo_path, is_public, status, created_at, views_count, bio,
  sport, gender, achievements, linkedin,
  facebook_url, instagram_url, twitter_url, youtube_url, tiktok_url, website_url
) ON public.players TO anon;

GRANT SELECT, INSERT, UPDATE (
  profile_id, academy_id, display_name, position, secondary_position, age,
  country, nationality, bio, is_public, sport, gender, foot, preferred_foot,
  dominant_hand, height_cm, weight_kg, current_club, achievements, linkedin,
  region, stats, updated_at, availability, age_group, primary_photo_path,
  facebook_url, instagram_url, twitter_url, youtube_url, tiktok_url, website_url,
  views_count
) ON public.players TO authenticated;

-- ── 2. Fix public_profile_badges view — add explicit column alias ─────────────
-- The view was causing ambiguous FK issues because PostgREST couldn't determine
-- which FK to use when joining from jobs/opportunities.
-- Solution: recreate without the ambiguous hint, app now joins in JS.
DROP VIEW IF EXISTS public.public_profile_badges CASCADE;

CREATE OR REPLACE VIEW public.public_profile_badges AS
SELECT
  p.id            AS profile_id,
  p.role,
  p.verification_status,
  p.verification_badge,
  p.status,
  p.sport
FROM public.profiles p
WHERE p.status = 'active';

-- Grant access
GRANT SELECT ON public.public_profile_badges TO anon, authenticated;

-- ── 3. Ensure player RLS allows anon reads ────────────────────────────────────
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "players_select"      ON public.players;
DROP POLICY IF EXISTS "players_select_public" ON public.players;

-- Allow anon to read public players (needed for search)
CREATE POLICY "players_select" ON public.players
  FOR SELECT USING (
    is_public = true          -- any public player visible to all
    OR auth.uid() = profile_id -- own profile always visible
  );

-- ── 4. Verify ─────────────────────────────────────────────────────────────────
SELECT
  'players anon select' AS check_name,
  COUNT(*) AS column_grants
FROM information_schema.column_privileges
WHERE table_name = 'players'
  AND grantee = 'anon'
  AND privilege_type = 'SELECT';
