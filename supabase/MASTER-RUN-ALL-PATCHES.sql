-- =============================================================================
-- SportBridge — MASTER PATCH FILE
-- Run this ONCE in Supabase SQL Editor to apply ALL updates and upgrades.
-- Go to: https://supabase.com/dashboard/project/pzfohowzaeunywaqukwe/sql/new
-- Paste entire file → click Run
-- Safe to re-run (all statements use IF NOT EXISTS / OR REPLACE / DROP IF EXISTS)
-- =============================================================================

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 1: Extensions
-- ═══════════════════════════════════════════════════════════════════════════════
create extension if not exists pgcrypto;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 2: Profiles — patch constraints and add missing columns
-- ═══════════════════════════════════════════════════════════════════════════════
alter table public.profiles
  add column if not exists username           text,
  add column if not exists phone              text,
  add column if not exists avatar_path        text,
  add column if not exists country            text,
  add column if not exists region             text,
  add column if not exists sport              text default 'football',
  add column if not exists status             text default 'active',
  add column if not exists updated_at         timestamptz default now(),
  add column if not exists nationality        text,
  add column if not exists verification_badge text;

-- Fix role constraint to include sports_analyst
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles drop constraint if exists profiles_role_allowed;
alter table public.profiles add constraint profiles_role_check
  check (role in ('player','coach','sports_analyst','agent','academy','super_admin'));

-- Fix status constraint
alter table public.profiles drop constraint if exists profiles_status_allowed;
alter table public.profiles add constraint profiles_status_allowed
  check (status in ('pending','active','suspended','denied'));

-- Fix verification_status constraint
alter table public.profiles drop constraint if exists profiles_verif_status_check;
alter table public.profiles add constraint profiles_verif_status_check
  check (verification_status in ('unverified','pending','verified','rejected'));

-- Grants
revoke update on public.profiles from authenticated;
grant update (
  full_name, username, avatar_path, phone, country, region, updated_at,
  role, status, verification_status, sport
) on public.profiles to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 3: Players — add missing columns + fix availability constraint + grants
-- ═══════════════════════════════════════════════════════════════════════════════
alter table public.players
  add column if not exists sport              text default 'football',
  add column if not exists secondary_position text,
  add column if not exists gender             text,
  add column if not exists nationality        text,
  add column if not exists foot               text,
  add column if not exists preferred_foot     text,
  add column if not exists dominant_hand      text,
  add column if not exists height_cm          integer,
  add column if not exists weight_kg          integer,
  add column if not exists jersey_number      integer,
  add column if not exists primary_photo_path text,
  add column if not exists current_club       text,
  add column if not exists achievements       text,
  add column if not exists achievements_data  jsonb default '[]'::jsonb,
  add column if not exists linkedin           text,
  add column if not exists is_public          boolean default false,
  add column if not exists status             text default 'active',
  add column if not exists updated_at         timestamptz default now(),
  add column if not exists region             text,
  add column if not exists stats              jsonb default '{}'::jsonb,
  add column if not exists views_count        integer default 0,
  add column if not exists age_group          text,
  add column if not exists dob                date;

-- Fix availability constraint
alter table public.players drop constraint if exists players_availability_check;
alter table public.players drop constraint if exists players_availability_allowed;
alter table public.players add constraint players_availability_check
  check (availability in ('available_now','available_jan_2026','available_jul_2026','under_contract'));

-- Fix any existing bad availability values
update public.players
set availability = 'available_now'
where availability not in ('available_now','available_jan_2026','available_jul_2026','under_contract')
   or availability is null;

-- Fix age_group constraint
alter table public.players drop constraint if exists players_age_group_check;
alter table public.players add constraint players_age_group_check
  check (age_group in ('U13','U15','U17','U20','U23','Senior') or age_group is null);

-- Fix status constraint
alter table public.players drop constraint if exists players_status_allowed;
alter table public.players add constraint players_status_allowed
  check (status in ('pending','active','suspended','denied'));

-- Player grants (include availability and age_group)
revoke select on public.players from anon;
grant select (
  id, profile_id, academy_id, display_name, position, secondary_position,
  age, country, nationality, gender, bio, sport, primary_photo_path,
  is_public, status, region, preferred_foot, foot, dominant_hand, height_cm,
  weight_kg, age_group, availability, stats, achievements, achievements_data,
  linkedin, views_count, current_club, created_at
) on public.players to anon;

grant select (
  id, profile_id, academy_id, display_name, position, secondary_position,
  age, country, nationality, gender, bio, sport, primary_photo_path,
  is_public, status, region, preferred_foot, foot, dominant_hand, height_cm,
  weight_kg, age_group, availability, stats, achievements, achievements_data,
  linkedin, views_count, current_club, created_at
) on public.players to authenticated;

revoke update on public.players from authenticated;
grant update (
  display_name, position, secondary_position, age, country, nationality, bio,
  is_public, sport, gender, foot, preferred_foot, dominant_hand, height_cm,
  weight_kg, current_club, achievements, linkedin, region, stats, updated_at,
  availability, age_group
) on public.players to authenticated;

revoke insert on public.players from authenticated;
grant insert (
  profile_id, academy_id, display_name, position, secondary_position, age,
  country, nationality, bio, is_public, sport, gender, foot, preferred_foot,
  dominant_hand, height_cm, weight_kg, current_club, achievements, linkedin,
  region, stats, updated_at, availability, age_group
) on public.players to authenticated;

grant update (views_count) on public.players to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 4: Clubs — add missing columns
-- ═══════════════════════════════════════════════════════════════════════════════
alter table public.clubs
  add column if not exists sports             text[] default array['football']::text[],
  add column if not exists country            text,
  add column if not exists state              text,
  add column if not exists address            text,
  add column if not exists about              text,
  add column if not exists website            text,
  add column if not exists logo_path          text,
  add column if not exists status             text default 'active',
  add column if not exists verified_badge     boolean default false,
  add column if not exists updated_at         timestamptz default now();

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 5: Academy profiles — add leagues and languages columns
-- ═══════════════════════════════════════════════════════════════════════════════
alter table public.academy_profiles
  add column if not exists leagues   text[] default '{}',
  add column if not exists languages text[] default '{}',
  add column if not exists linkedin  text;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 6: Jobs — add missing columns
-- ═══════════════════════════════════════════════════════════════════════════════
alter table public.jobs
  add column if not exists posted_by_user_id  uuid references public.profiles(id) on delete set null,
  add column if not exists sport              text default 'football',
  add column if not exists job_type           text default 'player_needed',
  add column if not exists player_position    text,
  add column if not exists staff_role         text,
  add column if not exists age_group          text,
  add column if not exists region             text,
  add column if not exists country            text,
  add column if not exists nationality        text,
  add column if not exists work_type          text,
  add column if not exists budget             integer,
  add column if not exists salary             integer,
  add column if not exists free_agent_only    boolean default false,
  add column if not exists license_required   boolean default false,
  add column if not exists facility_pictures  jsonb default '[]'::jsonb,
  add column if not exists is_verified        boolean default false,
  add column if not exists posted_by          uuid references public.profiles(id) on delete set null,
  add column if not exists status             text default 'open',
  add column if not exists updated_at         timestamptz default now();

-- Jobs anon grant
revoke select on public.jobs from anon;
grant select (
  id, club_id, posted_by_user_id, posted_by,
  title, description, job_type, player_position, staff_role,
  age_group, region, country, nationality, work_type, budget, salary,
  free_agent_only, license_required, facility_pictures,
  is_verified, sport, status, created_at
) on public.jobs to anon;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 7: Opportunities — add fee_currency column
-- ═══════════════════════════════════════════════════════════════════════════════
alter table public.opportunities
  add column if not exists fee_currency text default 'NGN';

-- Add check constraint if not already there
alter table public.opportunities
  drop constraint if exists opportunities_fee_currency_check;
alter table public.opportunities
  add constraint opportunities_fee_currency_check
  check (fee_currency in ('NGN','USD','GBP','EUR','GHS'));

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 8: Reports — add reviewer_id + expand status check
-- ═══════════════════════════════════════════════════════════════════════════════
alter table public.reports
  add column if not exists reviewer_notes text,
  add column if not exists reviewer_id    uuid references public.profiles(id) on delete set null;

alter table public.reports
  drop constraint if exists reports_status_check,
  drop constraint if exists reports_reported_user_id_fkey;

alter table public.reports
  add constraint reports_status_check
    check (status in ('pending','investigating','confirmed_scam','dismissed','actioned'));

alter table public.reports alter column reported_user_id drop not null;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 9: Media assets — add video_kind and file_hash columns
-- ═══════════════════════════════════════════════════════════════════════════════
alter table public.media_assets
  add column if not exists video_kind text,
  add column if not exists file_hash  text;

-- Add constraints only if not already present
do $$ begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.media_assets'::regclass and conname = 'media_assets_video_kind_check') then
    alter table public.media_assets add constraint media_assets_video_kind_check
      check (video_kind is null or video_kind in ('highlight','full_match','training'));
  end if;
end $$;

grant select (video_kind, file_hash) on public.media_assets to anon;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 10: Verification requests — fix status constraint
-- ═══════════════════════════════════════════════════════════════════════════════
alter table public.verification_requests
  drop constraint if exists verification_requests_status_check;
alter table public.verification_requests
  add constraint verification_requests_status_check
  check (status in ('pending','approved','rejected'));

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 11: public_profile_badges view — fix 42P16 error
-- ═══════════════════════════════════════════════════════════════════════════════
drop view if exists public.public_profile_badges cascade;

create view public.public_profile_badges
with (security_barrier = true)
as
select id, role, verification_status, verification_badge
from public.profiles
where status = 'active';

revoke all on public.public_profile_badges from public;
grant select on public.public_profile_badges to anon, authenticated;

-- Computed-relationship functions for PostgREST embedding
create or replace function public.public_profile_badges(player_row public.players)
returns setof public.public_profile_badges rows 1 language sql stable set search_path = ''
as $$ select b.* from public.public_profile_badges b where b.id = player_row.profile_id $$;

create or replace function public.public_profile_badges(job_row public.jobs)
returns setof public.public_profile_badges rows 1 language sql stable set search_path = ''
as $$ select b.* from public.public_profile_badges b where b.id = job_row.posted_by_user_id $$;

create or replace function public.public_profile_badges(post_row public.feed_posts)
returns setof public.public_profile_badges rows 1 language sql stable set search_path = ''
as $$ select b.* from public.public_profile_badges b where b.id = post_row.author_id $$;

create or replace function public.public_profile_badges(opportunity_row public.opportunities)
returns setof public.public_profile_badges rows 1 language sql stable set search_path = ''
as $$ select b.* from public.public_profile_badges b where b.id = opportunity_row.posted_by $$;

revoke all on function public.public_profile_badges(public.players)       from public;
revoke all on function public.public_profile_badges(public.jobs)          from public;
revoke all on function public.public_profile_badges(public.feed_posts)    from public;
revoke all on function public.public_profile_badges(public.opportunities) from public;
grant execute on function public.public_profile_badges(public.players)       to anon, authenticated;
grant execute on function public.public_profile_badges(public.jobs)          to anon, authenticated;
grant execute on function public.public_profile_badges(public.feed_posts)    to anon, authenticated;
grant execute on function public.public_profile_badges(public.opportunities) to anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 12: Core helper functions
-- ═══════════════════════════════════════════════════════════════════════════════
create or replace function public.current_user_is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'super_admin') $$;

create or replace function public.profile_is_active(p_user_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.profiles where id = p_user_id and status = 'active') $$;

create or replace function public.current_user_is_verified()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.profiles where id = (select auth.uid()) and status = 'active' and verification_status = 'verified') $$;

revoke all on function public.current_user_is_admin()       from public, anon;
revoke all on function public.profile_is_active(uuid)       from public, anon;
revoke all on function public.current_user_is_verified()    from public, anon;
grant execute on function public.current_user_is_admin()    to authenticated;
grant execute on function public.profile_is_active(uuid)    to authenticated;
grant execute on function public.current_user_is_verified() to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 13: Indexes
-- ═══════════════════════════════════════════════════════════════════════════════
create index if not exists players_views_idx          on public.players (views_count desc) where is_public = true and status = 'active';
create index if not exists players_availability_idx   on public.players (availability, is_public, status);
create index if not exists players_age_group_idx      on public.players (age_group, is_public, status);
create index if not exists players_nationality_idx    on public.players (nationality, is_public);
create index if not exists players_public_listing_idx on public.players (sport, country, position) where is_public = true and status = 'active';
create index if not exists jobs_public_listing_idx    on public.jobs (sport, status, created_at desc);
create index if not exists reports_queue_idx          on public.reports (status, created_at desc);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 14: Demo accounts — reset passwords + confirm emails
-- ═══════════════════════════════════════════════════════════════════════════════
-- Reset admin password
update auth.users
set encrypted_password = extensions.crypt('SportBridge2026!', extensions.gen_salt('bf', 10)),
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at = now()
where email = 'sportbridge.com.ng@gmail.com';

-- Ensure admin has correct profile
update public.profiles
set role = 'super_admin', status = 'active', verification_status = 'verified', updated_at = now()
where email = 'sportbridge.com.ng@gmail.com';

-- Reset all demo account passwords and confirm emails
update auth.users
set encrypted_password = extensions.crypt('Demo@SportBridge1!', extensions.gen_salt('bf', 10)),
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at = now()
where email like '%@sportbridge.demo'
   or email like '%@elitelondonfc.demo'
   or email like '%@academie-paris.demo'
   or email like '%@ghanafinstitute.demo'
   or email like '%@sportinglisboa.demo'
   or email like '%@riversunited.demo'
   or email like '%@global-talent.demo'
   or email like '%@sabridge.demo'
   or email like '%@desertsports.demo'
   or email like '%@ajaxnetwork.demo'
   or email like '%@wascouts.demo';

-- Ensure demo profiles are active and verified
update public.profiles
set status = 'active', verification_status = 'verified', updated_at = now()
where email like '%@sportbridge.demo'
   or email like '%@elitelondonfc.demo'
   or email like '%@academie-paris.demo'
   or email like '%@ghanafinstitute.demo'
   or email like '%@sportinglisboa.demo'
   or email like '%@riversunited.demo'
   or email like '%@global-talent.demo'
   or email like '%@sabridge.demo'
   or email like '%@desertsports.demo'
   or email like '%@ajaxnetwork.demo'
   or email like '%@wascouts.demo';

-- Ensure demo player rows are active + public
update public.players pl set status = 'active', is_public = true
from auth.users u
where pl.profile_id = u.id and u.email like '%@sportbridge.demo';

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 15: PostgREST — reload schema cache
-- ═══════════════════════════════════════════════════════════════════════════════
notify pgrst, 'reload schema';

-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFICATION — confirm all patches applied correctly
-- ═══════════════════════════════════════════════════════════════════════════════
select
  'profiles.sport column'          as check_name, exists(select 1 from information_schema.columns where table_name='profiles' and column_name='sport')           as ok
union all select
  'profiles.verification_badge',      exists(select 1 from information_schema.columns where table_name='profiles' and column_name='verification_badge')
union all select
  'players.availability column',      exists(select 1 from information_schema.columns where table_name='players' and column_name='availability')
union all select
  'players.age_group column',         exists(select 1 from information_schema.columns where table_name='players' and column_name='age_group')
union all select
  'players.stats column',             exists(select 1 from information_schema.columns where table_name='players' and column_name='stats')
union all select
  'opportunities.fee_currency',       exists(select 1 from information_schema.columns where table_name='opportunities' and column_name='fee_currency')
union all select
  'reports.reviewer_id',              exists(select 1 from information_schema.columns where table_name='reports' and column_name='reviewer_id')
union all select
  'reports.reviewer_notes',           exists(select 1 from information_schema.columns where table_name='reports' and column_name='reviewer_notes')
union all select
  'media_assets.video_kind',          exists(select 1 from information_schema.columns where table_name='media_assets' and column_name='video_kind')
union all select
  'academy_profiles.leagues',         exists(select 1 from information_schema.columns where table_name='academy_profiles' and column_name='leagues')
union all select
  'academy_profiles.languages',       exists(select 1 from information_schema.columns where table_name='academy_profiles' and column_name='languages')
union all select
  'public_profile_badges view',       exists(select 1 from information_schema.views where table_name='public_profile_badges' and table_schema='public')
union all select
  'admin confirmed',                  exists(select 1 from public.profiles where email='sportbridge.com.ng@gmail.com' and role='super_admin')
union all select
  'demo accounts confirmed',          (select count(*)::text from auth.users where email_confirmed_at is not null and (email like '%@sportbridge.demo' or email like '%@elitelondonfc.demo')) || ' confirmed';
