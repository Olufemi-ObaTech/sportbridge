-- =============================================================================
-- SportBridge patch: public_profile_badges view
-- Run in Supabase SQL Editor to fix the "Cannot coerce to single JSON object" 
-- error when viewing player profiles.
-- Safe to run multiple times (uses CREATE OR REPLACE VIEW).
-- =============================================================================

-- Add verification_badge column to profiles if missing
alter table public.profiles
  add column if not exists verification_badge boolean not null default false;

-- Create the public_profile_badges view
-- This is used by PlayerProfile.jsx and other components to get
-- verification badge info alongside player/coach data in a single query.
create or replace view public.public_profile_badges as
select
  id,
  role,
  verification_status,
  verification_badge,
  status,
  sport
from public.profiles
where status = 'active';

-- Grant read access to authenticated and anon users
grant select on public.public_profile_badges to authenticated;
grant select on public.public_profile_badges to anon;

-- Verify it works
select count(*) as badge_count from public.public_profile_badges;
