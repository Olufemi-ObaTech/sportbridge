-- =============================================================================
-- SportBridge — Delete ALL demo accounts + Fix admin login
-- Run this in Supabase SQL Editor.
--
-- This permanently deletes all demo accounts and their associated data.
-- Cascades will clean up: profiles, players, clubs, academy_profiles,
-- agent_profiles, coach_profiles, jobs, feed_posts, etc.
-- =============================================================================

-- ── Step 1: Delete demo users from auth.users (cascades to profiles + all data)
delete from auth.users
where email in (
  'admin@lagosunitedfc.ng',
  'info@ekosportsacademy.ng',
  'scouting@premierfootballagency.ng',
  'chukwuemeka.okafor@sportbridge.ng',
  'adewale.ibrahim@sportbridge.ng',
  'emeka.nwosu@sportbridge.ng',
  'babatunde.adeleke@sportbridge.ng',
  'david.eze@sportbridge.ng',
  'samuel.okonkwo@sportbridge.ng',
  'ibrahim.musa@sportbridge.ng',
  'chisom.agu@sportbridge.ng',
  'tunde.salami@sportbridge.ng',
  'kelechi.obiora@sportbridge.ng'
);

-- ── Step 2: Fix admin account — confirm email + set super_admin role
-- (Uses the password you already set via Forgot Password, or set a new one below)
update auth.users
set
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  updated_at         = now()
where email = 'sportbridge.com.ng@gmail.com';

update public.profiles
set
  role                = 'super_admin',
  verification_status = 'verified',
  status              = 'active',
  full_name           = 'SportBridge Admin',
  updated_at          = now()
where email = 'sportbridge.com.ng@gmail.com';

-- ── Step 3: Clean up any orphaned data left from demo runs ─────────────────
-- Delete any player records with no profile
delete from public.players
where profile_id is null
  and academy_id is null;

-- Delete any jobs with no valid poster
delete from public.jobs
where posted_by not in (select id from public.profiles)
  and posted_by_user_id not in (select id from public.profiles)
  and (posted_by is null or posted_by_user_id is null);

-- ── Step 4: Verify ─────────────────────────────────────────────────────────
select
  au.email,
  au.email_confirmed_at is not null  as email_confirmed,
  p.role,
  p.status,
  p.verification_status,
  p.full_name
from auth.users au
join public.profiles p on p.id = au.id
order by p.role, au.email;
