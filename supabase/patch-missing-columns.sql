-- =============================================================================
-- SportBridge — Patch: Add all missing columns to existing tables
-- Run this in Supabase SQL Editor if schema.sql fails because columns exist.
-- This is safe to run multiple times — all statements use IF NOT EXISTS.
-- =============================================================================

-- ── profiles ──────────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists username           text,
  add column if not exists phone              text,
  add column if not exists avatar_path        text,
  add column if not exists sport              text not null default 'football',
  add column if not exists status             text not null default 'active',
  add column if not exists referred_by        uuid references public.profiles(id) on delete set null,
  add column if not exists updated_at         timestamptz not null default now(),
  add column if not exists nationality        text,
  add column if not exists verification_status text not null default 'unverified'
    check (verification_status in ('unverified','pending','verified','rejected'));

create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username)) where username is not null;

-- ── clubs ─────────────────────────────────────────────────────────────────────
alter table public.clubs
  add column if not exists slug               text,
  add column if not exists sports             text[] not null default array['football']::text[],
  add column if not exists country            text,
  add column if not exists state              text,
  add column if not exists address            text,
  add column if not exists about              text,
  add column if not exists website            text,
  add column if not exists logo_path          text,
  add column if not exists cover_image_path   text,
  add column if not exists team_gender        text,
  add column if not exists status             text not null default 'active',
  add column if not exists verified_badge     boolean not null default false,
  add column if not exists updated_at         timestamptz not null default now();

-- ── players ───────────────────────────────────────────────────────────────────
alter table public.players
  add column if not exists academy_id         uuid references public.academy_profiles(id) on delete set null,
  add column if not exists team_id            uuid references public.teams(id) on delete set null,
  add column if not exists sport              text not null default 'football',
  add column if not exists dob                date,
  add column if not exists secondary_position text,
  add column if not exists gender             text,
  add column if not exists nationality        text,
  add column if not exists foot               text,
  add column if not exists dominant_hand      text,
  add column if not exists height_cm          integer,
  add column if not exists weight_kg          integer,
  add column if not exists jersey_number      integer,
  add column if not exists primary_photo_path text,
  add column if not exists current_club       text,
  add column if not exists previous_clubs     text[] not null default '{}',
  add column if not exists achievements       text,
  add column if not exists linkedin           text,
  add column if not exists is_public          boolean not null default false,
  add column if not exists status             text not null default 'active',
  add column if not exists updated_at         timestamptz not null default now(),
  add column if not exists availability       text not null default 'available_now'
    check (availability in ('available_now','available_jan_2026','available_jul_2026','under_contract')),
  add column if not exists preferred_foot     text
    check (preferred_foot in ('left','right','both')),
  add column if not exists stats              jsonb not null default '{}'::jsonb,
  add column if not exists achievements_data  jsonb not null default '[]'::jsonb,
  add column if not exists region             text,
  add column if not exists age_group          text
    check (age_group in ('U13','U15','U17','U20','U23','Senior')),
  add column if not exists views_count        integer not null default 0;

-- ── jobs ──────────────────────────────────────────────────────────────────────
alter table public.jobs
  add column if not exists academy_id         uuid references public.academy_profiles(id) on delete cascade,
  add column if not exists posted_by_user_id  uuid references public.profiles(id) on delete set null,
  add column if not exists sport              text not null default 'football',
  add column if not exists role_type          text,
  add column if not exists requirements       text,
  add column if not exists location           text,
  add column if not exists salary_min         integer,
  add column if not exists salary_max         integer,
  add column if not exists currency           text,
  add column if not exists contract_type      text,
  add column if not exists application_deadline date,
  add column if not exists status             text not null default 'open',
  add column if not exists published_at       timestamptz not null default now(),
  add column if not exists updated_at         timestamptz not null default now(),
  add column if not exists job_type           text not null default 'player_needed'
    check (job_type in ('player_needed','staff_needed')),
  add column if not exists player_position    text,
  add column if not exists staff_role         text,
  add column if not exists age_group          text,
  add column if not exists region             text,
  add column if not exists budget             integer,
  add column if not exists salary             integer,
  add column if not exists free_agent_only    boolean not null default false,
  add column if not exists license_required   boolean not null default false,
  add column if not exists facility_pictures  jsonb not null default '[]'::jsonb,
  add column if not exists club_cv_url        text,
  add column if not exists is_verified        boolean not null default false,
  add column if not exists posted_by          uuid references public.profiles(id) on delete set null;

-- ── applications ──────────────────────────────────────────────────────────────
alter table public.applications
  add column if not exists applicant_user_id  uuid references public.profiles(id) on delete cascade,
  add column if not exists coach_profile_id   uuid references public.coach_profiles(id) on delete cascade,
  add column if not exists cover_letter       text,
  add column if not exists cv_storage_path    text,
  add column if not exists applied_at         timestamptz not null default now(),
  add column if not exists updated_at         timestamptz not null default now();

-- ── indexes ───────────────────────────────────────────────────────────────────
create index if not exists players_views_idx
  on public.players (views_count desc) where is_public = true and status = 'active';
create index if not exists players_availability_idx
  on public.players (availability, is_public, status);
create index if not exists players_age_group_idx
  on public.players (age_group, is_public, status);
create index if not exists players_nationality_idx
  on public.players (nationality, is_public);
create index if not exists players_public_listing_idx
  on public.players (sport, country, position) where is_public = true and status = 'active';
create index if not exists jobs_public_listing_idx
  on public.jobs (sport, status, created_at desc);

-- ── grants (column-level for anon) ────────────────────────────────────────────
-- Players — expand anon grant to include Sprint 2 columns
revoke select on public.players from anon;
grant select (
  id, display_name, position, age, country, nationality, gender, bio, sport,
  primary_photo_path, is_public, status, region, preferred_foot, foot,
  age_group, availability, stats, achievements_data, views_count,
  current_club, created_at
) on public.players to anon;

-- Allow authenticated users to increment the view counter
grant update (views_count) on public.players to authenticated;

-- Jobs — expand anon grant to include Sprint 2 columns
revoke select on public.jobs from anon;
grant select (
  id, club_id, academy_id, posted_by_user_id, posted_by,
  title, description, job_type, player_position, staff_role,
  role_type, requirements, location, salary_min, salary_max, salary,
  currency, contract_type, application_deadline, age_group, region,
  budget, free_agent_only, license_required, facility_pictures,
  is_verified, sport, status, created_at
) on public.jobs to anon;

select 'Patch applied successfully.' as result;
