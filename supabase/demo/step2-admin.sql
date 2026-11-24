-- =============================================================================
-- STEP 2 of 6 — Admin account
-- Password: SportBridge2026!
-- Safe to run multiple times — uses UPDATE if account already exists
-- =============================================================================

-- ── Reset password for existing admin ─────────────────────────────────────────
-- (This is the safe path — the admin was created when the Supabase project was set up)
update auth.users
set
  encrypted_password = extensions.crypt('SportBridge2026!', extensions.gen_salt('bf', 10)),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  raw_user_meta_data = jsonb_set(
    coalesce(raw_user_meta_data, '{}'::jsonb),
    '{role}', '"super_admin"'
  ),
  updated_at = now()
where email = 'sportbridge.com.ng@gmail.com';

-- ── Create profile row if it doesn't exist yet ─────────────────────────────────
insert into public.profiles (id, email, full_name, role, sport, status, verification_status, updated_at)
select
  u.id,
  'sportbridge.com.ng@gmail.com',
  'SportBridge Admin',
  'super_admin',
  'football',
  'active',
  'verified',
  now()
from auth.users u
where u.email = 'sportbridge.com.ng@gmail.com'
on conflict (id) do update
  set
    role                = 'super_admin',
    status              = 'active',
    verification_status = 'verified',
    updated_at          = now();

-- ── Confirm it worked ─────────────────────────────────────────────────────────
select
  u.email,
  p.role,
  p.status,
  p.verification_status,
  u.email_confirmed_at is not null    as email_confirmed,
  left(u.encrypted_password, 7)       as hash_prefix
from auth.users u
left join public.profiles p on p.id = u.id
where u.email = 'sportbridge.com.ng@gmail.com';

-- Expected result:
--   email_confirmed = true
--   hash_prefix     = $2a$10 or $2b$10
--   role            = super_admin
--   status          = active
