-- Run after schema.sql. Create the safe public projection before declaring
-- computed relationships that return its row type.
begin;

alter table public.profiles
  add column if not exists role text not null default 'player'
    check (role in ('player','coach','agent','academy','super_admin')),
  add column if not exists status text not null default 'active'
    check (status in ('pending','active','suspended','denied')),
  add column if not exists verification_status text not null default 'unverified'
    check (verification_status in ('unverified','pending','verified','rejected')),
  add column if not exists verification_badge text;

create or replace view public.public_profile_badges
with (security_barrier = true)
as
select id, role, verification_status, verification_badge
from public.profiles
where status = 'active';

revoke all on public.public_profile_badges from public;
grant select on public.public_profile_badges to anon, authenticated;

-- PostgREST cannot infer a foreign-key relationship to a view.
create or replace function public.public_profile_badges(player_row public.players)
returns setof public.public_profile_badges
rows 1
language sql
stable
set search_path = ''
as $function$
  select badge.*
  from public.public_profile_badges as badge
  where badge.id = player_row.profile_id
$function$;

create or replace function public.public_profile_badges(job_row public.jobs)
returns setof public.public_profile_badges
rows 1
language sql
stable
set search_path = ''
as $function$
  select badge.*
  from public.public_profile_badges as badge
  where badge.id = job_row.posted_by_user_id
$function$;

create or replace function public.public_profile_badges(post_row public.feed_posts)
returns setof public.public_profile_badges
rows 1
language sql
stable
set search_path = ''
as $function$
  select badge.*
  from public.public_profile_badges as badge
  where badge.id = post_row.author_id
$function$;

create or replace function public.public_profile_badges(opportunity_row public.opportunities)
returns setof public.public_profile_badges
rows 1
language sql
stable
set search_path = ''
as $function$
  select badge.*
  from public.public_profile_badges as badge
  where badge.id = opportunity_row.posted_by
$function$;

revoke all on function public.public_profile_badges(public.players) from public;
revoke all on function public.public_profile_badges(public.jobs) from public;
revoke all on function public.public_profile_badges(public.feed_posts) from public;
revoke all on function public.public_profile_badges(public.opportunities) from public;
grant execute on function public.public_profile_badges(public.players) to anon, authenticated;
grant execute on function public.public_profile_badges(public.jobs) to anon, authenticated;
grant execute on function public.public_profile_badges(public.feed_posts) to anon, authenticated;
grant execute on function public.public_profile_badges(public.opportunities) to anon, authenticated;

notify pgrst, 'reload schema';

commit;
