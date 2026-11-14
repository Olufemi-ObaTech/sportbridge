-- =============================================================================
-- SportBridge — Make your account Super Admin
-- Run this in Supabase SQL Editor AFTER you have registered on sportbridge.online
-- Official admin email: sportbridge.online@gmail.com
-- =============================================================================

-- Step 1: Confirm email + set super_admin
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at         = now()
where email = 'sportbridge.online@gmail.com';

update public.profiles
set role                = 'super_admin',
    verification_status = 'verified',
    status              = 'active',
    full_name           = 'SportBridge Admin',
    updated_at          = now()
where email = 'sportbridge.online@gmail.com';

-- Step 2: Confirm it worked
select id, email, full_name, role, status, verification_status
from public.profiles
where email = 'sportbridge.online@gmail.com';
