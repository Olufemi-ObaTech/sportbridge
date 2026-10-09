-- =============================================================================
-- SportBridge — Confirm account + promote to Super Admin
-- Run this in Supabase SQL Editor AFTER registering on the live site.
-- This bypasses the email confirmation requirement for your admin account.
-- =============================================================================

-- Step 1: Confirm the email address (bypasses email confirmation requirement)
update auth.users
set
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  confirmed_at       = coalesce(confirmed_at, now()),
  updated_at         = now()
where email = 'sportbridge.com.ng@gmail.com';

-- Step 2: Promote to super_admin
update public.profiles
set
  role                = 'super_admin',
  verification_status = 'verified',
  status              = 'active',
  updated_at          = now()
where email = 'sportbridge.com.ng@gmail.com';

-- Step 3: Verify it worked
select
  au.email,
  au.email_confirmed_at,
  p.role,
  p.status,
  p.verification_status,
  p.full_name
from auth.users au
join public.profiles p on p.id = au.id
where au.email = 'sportbridge.com.ng@gmail.com';

-- =============================================================================
-- If the account does not exist yet (never registered), create it directly:
-- =============================================================================
-- DO $$
-- DECLARE
--   new_user_id uuid := gen_random_uuid();
-- BEGIN
--   INSERT INTO auth.users (
--     id, email, encrypted_password,
--     email_confirmed_at, confirmed_at,
--     raw_user_meta_data, aud, role,
--     confirmation_token, recovery_token,
--     email_change_token_new, email_change,
--     created_at, updated_at
--   ) VALUES (
--     new_user_id,
--     'sportbridge.com.ng@gmail.com',
--     crypt('SportBridge@2026!', gen_salt('bf')),
--     now(), now(),
--     '{"full_name":"SportBridge Admin","role":"player","sport":"football"}'::jsonb,
--     'authenticated', 'authenticated',
--     '', '', '', '',
--     now(), now()
--   ) ON CONFLICT (email) DO NOTHING;
--
--   UPDATE public.profiles
--   SET role = 'super_admin', verification_status = 'verified', status = 'active'
--   WHERE email = 'sportbridge.com.ng@gmail.com';
-- END $$;
