-- =============================================================================
-- STEP 1 of 6 — Prepare: extensions + constraints
-- Run this FIRST in Supabase SQL Editor
-- =============================================================================
create extension if not exists pgcrypto;

-- Fix profiles role constraint
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles drop constraint if exists profiles_role_allowed;
alter table public.profiles add constraint profiles_role_check
  check (role in ('player','coach','sports_analyst','agent','academy','super_admin'));

-- Add missing profile columns
alter table public.profiles add column if not exists status              text        default 'active';
alter table public.profiles add column if not exists sport               text        default 'football';
alter table public.profiles add column if not exists verification_status text        default 'unverified';
alter table public.profiles add column if not exists updated_at          timestamptz default now();

-- Fix players availability constraint
alter table public.players drop constraint if exists players_availability_check;
alter table public.players drop constraint if exists players_availability_allowed;
alter table public.players add constraint players_availability_check
  check (availability in ('available_now','available_jan_2026','available_jul_2026','under_contract'));

update public.players
set availability = 'available_now'
where availability not in ('available_now','available_jan_2026','available_jul_2026','under_contract')
   or availability is null;

-- Fix reports table
alter table public.reports add column if not exists reviewer_notes text;
alter table public.reports add column if not exists reviewer_id uuid
  references public.profiles(id) on delete set null;
alter table public.reports drop constraint if exists reports_status_check;
alter table public.reports drop constraint if exists reports_reported_user_id_fkey;
alter table public.reports add constraint reports_status_check
  check (status in ('pending','investigating','confirmed_scam','dismissed','actioned'));
alter table public.reports alter column reported_user_id drop not null;

-- Fix clubs table
alter table public.clubs add column if not exists updated_at timestamptz default now();

select 'Step 1 complete — ready for Step 2' as result;
