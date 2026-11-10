-- =============================================================================
-- SportBridge — patch-social-media.sql
-- Adds optional social media links to all profile tables
-- Run in Supabase SQL Editor (safe to run multiple times)
-- =============================================================================

-- ── players table ─────────────────────────────────────────────────────────────
alter table public.players
  add column if not exists facebook_url   text,
  add column if not exists twitter_url    text,
  add column if not exists instagram_url  text,
  add column if not exists youtube_url    text,
  add column if not exists tiktok_url     text,
  add column if not exists website_url    text;

-- ── coach_profiles table ──────────────────────────────────────────────────────
alter table public.coach_profiles
  add column if not exists facebook_url   text,
  add column if not exists twitter_url    text,
  add column if not exists instagram_url  text,
  add column if not exists youtube_url    text,
  add column if not exists tiktok_url     text,
  add column if not exists website_url    text;

-- ── agent_profiles table ──────────────────────────────────────────────────────
alter table public.agent_profiles
  add column if not exists facebook_url   text,
  add column if not exists twitter_url    text,
  add column if not exists instagram_url  text,
  add column if not exists youtube_url    text,
  add column if not exists tiktok_url     text,
  add column if not exists website_url    text;

-- ── academy_profiles table ────────────────────────────────────────────────────
alter table public.academy_profiles
  add column if not exists facebook_url   text,
  add column if not exists twitter_url    text,
  add column if not exists instagram_url  text,
  add column if not exists youtube_url    text,
  add column if not exists tiktok_url     text;
  -- website already exists via clubs table

-- ── clubs table (website already exists) ─────────────────────────────────────
alter table public.clubs
  add column if not exists facebook_url   text,
  add column if not exists twitter_url    text,
  add column if not exists instagram_url  text,
  add column if not exists youtube_url    text,
  add column if not exists tiktok_url     text;

-- ── Expand authenticated grants to include new social columns ─────────────────

-- Players — add social columns to UPDATE grant
revoke update on public.players from authenticated;
grant update (
  display_name, position, secondary_position, age, country, nationality, bio,
  is_public, sport, gender, foot, preferred_foot, dominant_hand, height_cm,
  weight_kg, current_club, achievements, linkedin, region, stats, updated_at,
  availability, age_group,
  facebook_url, twitter_url, instagram_url, youtube_url, tiktok_url, website_url
) on public.players to authenticated;

revoke insert on public.players from authenticated;
grant insert (
  profile_id, academy_id, display_name, position, secondary_position, age,
  country, nationality, bio, is_public, sport, gender, foot, preferred_foot,
  dominant_hand, height_cm, weight_kg, current_club, achievements, linkedin,
  region, stats, updated_at, availability, age_group,
  facebook_url, twitter_url, instagram_url, youtube_url, tiktok_url, website_url
) on public.players to authenticated;

grant update (views_count) on public.players to authenticated;

-- Players anon SELECT grant — add social columns
revoke select on public.players from anon;
grant select (
  id, profile_id, academy_id, display_name, position, secondary_position,
  age, country, nationality, gender, bio, sport, primary_photo_path,
  is_public, status, region, preferred_foot, foot, dominant_hand, height_cm,
  weight_kg, age_group, availability, stats, achievements, achievements_data,
  linkedin, views_count, current_club, created_at,
  facebook_url, twitter_url, instagram_url, youtube_url, tiktok_url, website_url
) on public.players to anon;

grant select (
  id, profile_id, academy_id, display_name, position, secondary_position,
  age, country, nationality, gender, bio, sport, primary_photo_path,
  is_public, status, region, preferred_foot, foot, dominant_hand, height_cm,
  weight_kg, age_group, availability, stats, achievements, achievements_data,
  linkedin, views_count, current_club, created_at,
  facebook_url, twitter_url, instagram_url, youtube_url, tiktok_url, website_url
) on public.players to authenticated;

-- Clubs anon SELECT grant — add social columns
revoke select on public.clubs from anon;
grant select (
  id, name, slug, sports, country, state, about, website,
  logo_path, cover_image_path, status, verified_badge, created_at,
  facebook_url, twitter_url, instagram_url, youtube_url, tiktok_url
) on public.clubs to anon;

-- Reload PostgREST schema cache
notify pgrst, 'reload schema';

-- Verify columns added
select table_name, column_name
from information_schema.columns
where table_schema = 'public'
  and column_name in ('facebook_url','twitter_url','instagram_url','youtube_url','tiktok_url','website_url')
  and table_name in ('players','coach_profiles','agent_profiles','academy_profiles','clubs')
order by table_name, column_name;
