-- Restore the least-privilege reads required by the public player directory.
-- Run in the Supabase SQL Editor if player search reports permission denied.
begin;

grant usage on schema public to anon, authenticated;

grant select (
  id, profile_id, display_name, position, age, country, nationality, region,
  availability, preferred_foot, foot, height_cm, current_club, age_group,
  stats, primary_photo_path, is_public, status, created_at, views_count
) on public.players to anon;

grant select (
  id, profile_id, academy_id, display_name, position, age, country,
  nationality, region, availability, preferred_foot, foot, height_cm,
  current_club, age_group, stats, primary_photo_path, is_public, status,
  created_at, views_count
) on public.players to authenticated;

grant select on public.public_profile_badges to anon, authenticated;

commit;
