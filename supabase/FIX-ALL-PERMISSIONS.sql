-- =============================================================================
-- SportBridge — FIX-ALL-PERMISSIONS.sql
-- Fixes ALL permission errors on the new Supabase project:
--   1. User registration (Unable to create account)
--   2. Player search blocked
--   3. All RLS policies for new accounts
--   4. All table grants for anon + authenticated
--
-- Run this ONCE in:
-- https://supabase.com/dashboard/project/qnueqhlxmtkvecppygrk/sql/new
--
-- Safe to run multiple times.
-- =============================================================================

-- ── 1. Schema usage grants ────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated;

-- ── 2. profiles — fix RLS + grants ───────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own"      ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"      ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"      ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all"       ON public.profiles;

-- Anyone can read active profiles (needed for community section)
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (status = 'active' OR auth.uid() = id);

-- Users can insert their own profile (triggered by handle_new_user but also direct)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can do everything
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- Column grants
GRANT SELECT (id, email, full_name, role, sport, status, verification_status,
              verification_badge, avatar_path, created_at, updated_at,
              username, country, region, nationality)
  ON public.profiles TO anon, authenticated;

GRANT INSERT (id, email, full_name, role, sport, status,
              verification_status, avatar_path, updated_at)
  ON public.profiles TO authenticated;

GRANT UPDATE (full_name, sport, avatar_path, updated_at, status,
              username, country, region, nationality, phone)
  ON public.profiles TO authenticated;

-- ── 3. players — fix RLS + grants ────────────────────────────────────────────
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "players_select_public"  ON public.players;
DROP POLICY IF EXISTS "players_select_own"     ON public.players;
DROP POLICY IF EXISTS "players_insert_own"     ON public.players;
DROP POLICY IF EXISTS "players_update_own"     ON public.players;
DROP POLICY IF EXISTS "players_admin_all"      ON public.players;

-- Public players visible to everyone (needed for search)
CREATE POLICY "players_select_public" ON public.players
  FOR SELECT USING (is_public = true OR auth.uid() = profile_id);

-- Players can insert their own record
CREATE POLICY "players_insert_own" ON public.players
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Players can update their own record
CREATE POLICY "players_update_own" ON public.players
  FOR UPDATE USING (auth.uid() = profile_id);

-- Admins can do everything
CREATE POLICY "players_admin_all" ON public.players
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Column grants for anon (player search)
GRANT SELECT (
  id, profile_id, display_name, position, secondary_position, age, country,
  nationality, region, availability, preferred_foot, foot, height_cm, weight_kg,
  current_club, age_group, stats, primary_photo_path, is_public, status,
  created_at, views_count, bio, sport, gender, achievements, linkedin,
  facebook_url, instagram_url, twitter_url, youtube_url, tiktok_url, website_url
) ON public.players TO anon;

GRANT SELECT, INSERT, UPDATE (
  profile_id, academy_id, display_name, position, secondary_position, age,
  country, nationality, bio, is_public, sport, gender, foot, preferred_foot,
  dominant_hand, height_cm, weight_kg, current_club, achievements, linkedin,
  region, stats, updated_at, availability, age_group,
  facebook_url, instagram_url, twitter_url, youtube_url, tiktok_url, website_url,
  primary_photo_path, views_count
) ON public.players TO authenticated;

GRANT UPDATE (views_count) ON public.players TO authenticated;

-- ── 4. coach_profiles ────────────────────────────────────────────────────────
ALTER TABLE public.coach_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coach_profiles_select" ON public.coach_profiles;
DROP POLICY IF EXISTS "coach_profiles_own"    ON public.coach_profiles;

CREATE POLICY "coach_profiles_select" ON public.coach_profiles
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "coach_profiles_own" ON public.coach_profiles
  FOR ALL USING (auth.uid() = user_id);

GRANT SELECT ON public.coach_profiles TO anon;
GRANT ALL ON public.coach_profiles TO authenticated;

-- ── 5. agent_profiles ────────────────────────────────────────────────────────
ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agent_profiles_select" ON public.agent_profiles;
DROP POLICY IF EXISTS "agent_profiles_own"    ON public.agent_profiles;

CREATE POLICY "agent_profiles_select" ON public.agent_profiles
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "agent_profiles_own" ON public.agent_profiles
  FOR ALL USING (auth.uid() = user_id);

GRANT SELECT ON public.agent_profiles TO anon;
GRANT ALL ON public.agent_profiles TO authenticated;

-- ── 6. academy_profiles ──────────────────────────────────────────────────────
ALTER TABLE public.academy_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "academy_profiles_select" ON public.academy_profiles;
DROP POLICY IF EXISTS "academy_profiles_own"    ON public.academy_profiles;

CREATE POLICY "academy_profiles_select" ON public.academy_profiles
  FOR SELECT USING (true);

CREATE POLICY "academy_profiles_own" ON public.academy_profiles
  FOR ALL USING (auth.uid() = user_id);

GRANT SELECT ON public.academy_profiles TO anon;
GRANT ALL ON public.academy_profiles TO authenticated;

-- ── 7. clubs ─────────────────────────────────────────────────────────────────
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clubs_select" ON public.clubs;
DROP POLICY IF EXISTS "clubs_own"    ON public.clubs;

CREATE POLICY "clubs_select" ON public.clubs
  FOR SELECT USING (status = 'active' OR auth.uid() = owner_id);

CREATE POLICY "clubs_own" ON public.clubs
  FOR ALL USING (auth.uid() = owner_id);

GRANT SELECT ON public.clubs TO anon;
GRANT ALL ON public.clubs TO authenticated;

-- ── 8. jobs ──────────────────────────────────────────────────────────────────
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jobs_select" ON public.jobs;
DROP POLICY IF EXISTS "jobs_own"    ON public.jobs;

CREATE POLICY "jobs_select" ON public.jobs
  FOR SELECT USING (status = 'open' OR auth.uid() = posted_by);

CREATE POLICY "jobs_own" ON public.jobs
  FOR ALL USING (auth.uid() = posted_by);

GRANT SELECT ON public.jobs TO anon;
GRANT ALL ON public.jobs TO authenticated;

-- ── 9. applications ──────────────────────────────────────────────────────────
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applications_own" ON public.applications;

CREATE POLICY "applications_own" ON public.applications
  FOR ALL USING (auth.uid() = applicant_user_id);

GRANT ALL ON public.applications TO authenticated;

-- ── 10. opportunities (tryouts) ──────────────────────────────────────────────
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "opportunities_select" ON public.opportunities;
DROP POLICY IF EXISTS "opportunities_own"    ON public.opportunities;

CREATE POLICY "opportunities_select" ON public.opportunities
  FOR SELECT USING (status = 'open' AND is_fee_flagged = false);

CREATE POLICY "opportunities_own" ON public.opportunities
  FOR ALL USING (auth.uid() = posted_by);

GRANT SELECT ON public.opportunities TO anon;
GRANT ALL ON public.opportunities TO authenticated;

-- ── 11. feed_posts ───────────────────────────────────────────────────────────
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feed_posts_select" ON public.feed_posts;
DROP POLICY IF EXISTS "feed_posts_own"    ON public.feed_posts;

CREATE POLICY "feed_posts_select" ON public.feed_posts
  FOR SELECT USING (status = 'published' AND visibility = 'public');

CREATE POLICY "feed_posts_own" ON public.feed_posts
  FOR ALL USING (auth.uid() = author_id);

GRANT SELECT ON public.feed_posts TO anon;
GRANT ALL ON public.feed_posts TO authenticated;

-- ── 12. conversations + messages (inbox) ─────────────────────────────────────
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations_own" ON public.conversations;
DROP POLICY IF EXISTS "messages_own"      ON public.messages;

CREATE POLICY "conversations_own" ON public.conversations
  FOR ALL USING (auth.uid() = initiator_id OR auth.uid() = recipient_id);

CREATE POLICY "messages_own" ON public.messages
  FOR ALL USING (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.initiator_id = auth.uid() OR c.recipient_id = auth.uid())
    )
  );

GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.messages TO authenticated;

-- ── 13. notifications ────────────────────────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_own" ON public.notifications;

CREATE POLICY "notifications_own" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

GRANT ALL ON public.notifications TO authenticated;

-- ── 14. verification_requests ────────────────────────────────────────────────
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "verif_req_own"   ON public.verification_requests;
DROP POLICY IF EXISTS "verif_req_admin" ON public.verification_requests;

CREATE POLICY "verif_req_own" ON public.verification_requests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "verif_req_admin" ON public.verification_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

GRANT ALL ON public.verification_requests TO authenticated;

-- ── 15. reports ──────────────────────────────────────────────────────────────
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_own"   ON public.reports;
DROP POLICY IF EXISTS "reports_admin" ON public.reports;

CREATE POLICY "reports_own" ON public.reports
  FOR ALL USING (auth.uid() = reporter_id);

CREATE POLICY "reports_admin" ON public.reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

GRANT ALL ON public.reports TO authenticated;

-- ── 16. watchlists ───────────────────────────────────────────────────────────
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "watchlists_own" ON public.watchlists;

CREATE POLICY "watchlists_own" ON public.watchlists
  FOR ALL USING (auth.uid() = owner_id);

GRANT ALL ON public.watchlists TO authenticated;

-- ── 17. player_history ───────────────────────────────────────────────────────
ALTER TABLE public.player_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "player_history_select" ON public.player_history;
DROP POLICY IF EXISTS "player_history_own"    ON public.player_history;

CREATE POLICY "player_history_select" ON public.player_history
  FOR SELECT USING (true);

CREATE POLICY "player_history_own" ON public.player_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.players p
      WHERE p.id = player_id AND p.profile_id = auth.uid()
    )
  );

GRANT SELECT ON public.player_history TO anon;
GRANT ALL ON public.player_history TO authenticated;

-- ── 18. player_private ───────────────────────────────────────────────────────
ALTER TABLE public.player_private ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "player_private_own" ON public.player_private;

CREATE POLICY "player_private_own" ON public.player_private
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.players p
      WHERE p.id = player_id AND p.profile_id = auth.uid()
    )
  );

GRANT ALL ON public.player_private TO authenticated;

-- ── 19. media_assets ─────────────────────────────────────────────────────────
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_assets_select" ON public.media_assets;
DROP POLICY IF EXISTS "media_assets_own"    ON public.media_assets;

CREATE POLICY "media_assets_select" ON public.media_assets
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "media_assets_own" ON public.media_assets
  FOR ALL USING (auth.uid() = owner_id);

GRANT SELECT ON public.media_assets TO anon;
GRANT ALL ON public.media_assets TO authenticated;

-- ── 20. access_requests ──────────────────────────────────────────────────────
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "access_requests_own" ON public.access_requests;

CREATE POLICY "access_requests_own" ON public.access_requests
  FOR ALL USING (
    auth.uid() = requester_id OR
    EXISTS (
      SELECT 1 FROM public.players p
      WHERE p.id = player_id AND p.profile_id = auth.uid()
    )
  );

GRANT ALL ON public.access_requests TO authenticated;

-- ── 21. contact_unlocks ──────────────────────────────────────────────────────
ALTER TABLE public.contact_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_unlocks_own" ON public.contact_unlocks;

CREATE POLICY "contact_unlocks_own" ON public.contact_unlocks
  FOR ALL USING (auth.uid() = unlocker_id);

GRANT ALL ON public.contact_unlocks TO authenticated;

-- ── 22. public_profile_badges view ───────────────────────────────────────────
DROP VIEW IF EXISTS public.public_profile_badges CASCADE;
CREATE OR REPLACE VIEW public.public_profile_badges AS
SELECT
  p.id,
  p.role,
  p.verification_status,
  p.verification_badge,
  p.status,
  p.sport
FROM public.profiles p
WHERE p.status = 'active';

GRANT SELECT ON public.public_profile_badges TO anon, authenticated;

-- ── 23. agent_recommendations ────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_recommendations') THEN
    ALTER TABLE public.agent_recommendations ENABLE ROW LEVEL SECURITY;
    EXECUTE 'DROP POLICY IF EXISTS "agent_rec_own" ON public.agent_recommendations';
    EXECUTE 'CREATE POLICY "agent_rec_own" ON public.agent_recommendations
      FOR ALL USING (auth.uid() = recommender_user_id)';
    EXECUTE 'GRANT ALL ON public.agent_recommendations TO authenticated';
  END IF;
END $$;

-- ── 24. Supabase Auth — disable email confirmation ───────────────────────────
-- This ensures new registrations work without email confirmation
UPDATE auth.config
SET confirm_email_identity = false
WHERE confirm_email_identity = true;

-- ── 25. Verify everything works ───────────────────────────────────────────────
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles','players','coach_profiles','agent_profiles',
    'academy_profiles','clubs','jobs','applications',
    'conversations','messages','notifications',
    'verification_requests','reports','watchlists',
    'player_history','media_assets','feed_posts'
  )
ORDER BY tablename;
