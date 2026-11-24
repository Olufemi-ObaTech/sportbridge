-- =============================================================================
-- SportBridge — patch-fix-view.sql
-- Fixes: ERROR 42P16 "cannot drop columns from view"
-- Run this in Supabase SQL Editor (safe to run multiple times).
-- =============================================================================

-- Drop the existing view (CASCADE drops the computed-relationship functions too,
-- but they get recreated right below).
drop view if exists public.public_profile_badges cascade;

-- Recreate the view with the correct column set
create view public.public_profile_badges
with (security_barrier = true)
as
select id, role, verification_status, verification_badge
from public.profiles
where status = 'active';

-- Restore permissions
revoke all on public.public_profile_badges from public;
grant select on public.public_profile_badges to anon, authenticated;

-- Recreate the computed-relationship functions so PostgREST can embed
-- badge data when querying players, jobs, feed_posts, and opportunities.

create or replace function public.public_profile_badges(player_row public.players)
returns setof public.public_profile_badges rows 1
language sql stable set search_path = ''
as $$ select badge.* from public.public_profile_badges as badge where badge.id = player_row.profile_id $$;

create or replace function public.public_profile_badges(job_row public.jobs)
returns setof public.public_profile_badges rows 1
language sql stable set search_path = ''
as $$ select badge.* from public.public_profile_badges as badge where badge.id = job_row.posted_by_user_id $$;

create or replace function public.public_profile_badges(post_row public.feed_posts)
returns setof public.public_profile_badges rows 1
language sql stable set search_path = ''
as $$ select badge.* from public.public_profile_badges as badge where badge.id = post_row.author_id $$;

create or replace function public.public_profile_badges(opportunity_row public.opportunities)
returns setof public.public_profile_badges rows 1
language sql stable set search_path = ''
as $$ select badge.* from public.public_profile_badges as badge where badge.id = opportunity_row.posted_by $$;

-- Restore function permissions
revoke all on function public.public_profile_badges(public.players)      from public;
revoke all on function public.public_profile_badges(public.jobs)         from public;
revoke all on function public.public_profile_badges(public.feed_posts)   from public;
revoke all on function public.public_profile_badges(public.opportunities) from public;

grant execute on function public.public_profile_badges(public.players)      to anon, authenticated;
grant execute on function public.public_profile_badges(public.jobs)         to anon, authenticated;
grant execute on function public.public_profile_badges(public.feed_posts)   to anon, authenticated;
grant execute on function public.public_profile_badges(public.opportunities) to anon, authenticated;

-- Tell PostgREST to reload its schema cache
notify pgrst, 'reload schema';

-- Verify
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'public_profile_badges'
order by ordinal_position;
