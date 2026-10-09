-- =============================================================================
-- SportBridge — Disable email confirmation requirement
-- Run this in Supabase SQL Editor to allow users to log in immediately
-- without needing to click a confirmation email.
--
-- This patches all existing unconfirmed accounts AND sets the auth config.
-- =============================================================================

-- 1. Confirm ALL existing unconfirmed users immediately
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at         = now()
where email_confirmed_at is null;

-- 2. Confirm YOUR admin account specifically
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at         = now()
where email = 'sportbridge.com.ng@gmail.com';

-- 3. Promote admin account
update public.profiles
set role                = 'super_admin',
    verification_status = 'verified',
    status              = 'active',
    updated_at          = now()
where email = 'sportbridge.com.ng@gmail.com';

-- 4. Verify — should return 1 row with role = super_admin
select
  au.email,
  au.email_confirmed_at,
  p.role,
  p.status,
  p.full_name
from auth.users au
join public.profiles p on p.id = au.id
where au.email = 'sportbridge.com.ng@gmail.com';

-- =============================================================================
-- After running this SQL, go to:
-- Authentication → Sign In / Providers → "Confirm email" → toggle OFF → Save
-- This stops NEW users from needing email confirmation going forward.
-- =============================================================================
