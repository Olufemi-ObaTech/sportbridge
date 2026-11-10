-- =============================================================================
-- SportBridge — patch-player-grants.sql
-- Adds age_group and availability to the authenticated column grants
-- so players can set these from their dashboard.
-- Run in Supabase SQL Editor (safe to run multiple times).
-- =============================================================================

-- Revoke and re-grant player UPDATE columns including age_group and availability
revoke update on public.players from authenticated;
grant update (
  display_name, position, secondary_position, age, country, nationality, bio,
  is_public, sport, gender, foot, preferred_foot, dominant_hand, height_cm,
  weight_kg, current_club, achievements, linkedin, region, stats, updated_at,
  availability, age_group
) on public.players to authenticated;

-- Revoke and re-grant player INSERT columns including age_group and availability
revoke insert on public.players from authenticated;
grant insert (
  profile_id, academy_id, display_name, position, secondary_position, age,
  country, nationality, bio, is_public, sport, gender, foot, preferred_foot,
  dominant_hand, height_cm, weight_kg, current_club, achievements, linkedin,
  region, stats, updated_at, availability, age_group
) on public.players to authenticated;

-- Verify
select grantee, privilege_type, column_name
from information_schema.column_privileges
where table_name = 'players' and grantee = 'authenticated'
  and column_name in ('age_group', 'availability')
order by column_name;
