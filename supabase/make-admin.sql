-- =============================================================================
-- SportBridge — Make your account Super Admin
-- Run this in Supabase SQL Editor AFTER you have registered on the live site.
-- =============================================================================

-- Step 1: Confirm email + set super_admin
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at         = now()
where email = 'sportbridge.com.ng@gmail.com';

update public.profiles
set role                = 'super_admin',
    verification_status = 'verified',
    status              = 'active',
    full_name           = 'SportBridge Admin',
    updated_at          = now()
where email = 'sportbridge.com.ng@gmail.com';

-- Step 2: Confirm it worked
select id, email, full_name, role, status, verification_status
from public.profiles
where email = 'sportbridge.com.ng@gmail.com';

-- =============================================================================
-- DEMO ACCOUNTS (run seed.sql first — all use password: Demo@1234!)
-- =============================================================================
-- Academy:  admin@lagosunitedfc.ng
-- Academy:  info@ekosportsacademy.ng
-- Agent:    scouting@premierfootballagency.ng
-- Players:  chukwuemeka.okafor@sportbridge.ng
--           adewale.ibrahim@sportbridge.ng
--           emeka.nwosu@sportbridge.ng
--           babatunde.adeleke@sportbridge.ng
--           david.eze@sportbridge.ng
--           samuel.okonkwo@sportbridge.ng
--           ibrahim.musa@sportbridge.ng
--           chisom.agu@sportbridge.ng
--           tunde.salami@sportbridge.ng
--           kelechi.obiora@sportbridge.ng
