-- =============================================================================
-- SportBridge -- fix-roles.sql
-- Run this FIRST in Supabase SQL Editor, THEN run seed.sql
-- Safe to run multiple times
-- =============================================================================

-- ─── 1. Patch profiles role constraint to include sports_analyst ──────────────
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles drop constraint if exists profiles_role_allowed;
alter table public.profiles add constraint profiles_role_check
  check (role in ('player','coach','sports_analyst','agent','academy','super_admin'));

-- ─── 2. Patch players availability constraint ─────────────────────────────────
alter table public.players drop constraint if exists players_availability_check;
alter table public.players drop constraint if exists players_availability_allowed;
alter table public.players add constraint players_availability_check
  check (availability in ('available_now','available_jan_2026','available_jul_2026','under_contract'));

-- Fix any existing rows with invalid availability value
update public.players
set availability = 'available_now'
where availability not in ('available_now','available_jan_2026','available_jul_2026','under_contract')
   or availability is null;

-- ─── 3. Fix lookmanpodcast user role (and any other wrong roles) ──────────────
-- We bypass the privilege trigger by updating auth.users metadata first,
-- then updating profiles directly (SQL Editor runs as service role so it works)

update auth.users
set raw_user_meta_data = jsonb_set(
      coalesce(raw_user_meta_data, '{}'::jsonb),
      '{role}', '"sports_analyst"'
    ),
    updated_at = now()
where email = 'lookmanpodcast@lookup.com';

-- Direct update — service role in SQL Editor bypasses RLS and row-level triggers
update public.profiles
set role = 'sports_analyst',
    updated_at = now()
where email = 'lookmanpodcast@lookup.com';

-- ─── 4. Mark all demo profiles as verified and active ────────────────────────
update public.profiles
set verification_status = 'verified',
    status = 'active'
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

-- ─── 5. Confirm results ───────────────────────────────────────────────────────
select email, role, verification_status, status
from public.profiles
order by role, email
limit 100;
