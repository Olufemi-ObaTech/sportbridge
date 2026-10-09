-- =============================================================================
-- SportBridge — Make your account Super Admin
-- Run this in Supabase SQL Editor AFTER you have registered on the live site.
-- Replace 'your@email.com' with the email you signed up with.
-- =============================================================================

-- Step 1: Set role to super_admin
update public.profiles
set role = 'super_admin'
where email = 'sportbridge.com.ng@gmail.com';

-- Step 2: Confirm it worked
select id, email, full_name, role, verification_status
from public.profiles
where email = 'sportbridge.com.ng@gmail.com';

-- =============================================================================
-- DEMO ADMIN accounts (from seed.sql — password is Demo@1234! for all)
-- =============================================================================
-- Academy 1:  admin@lagosunitedfc.ng        / Demo@1234!
-- Academy 2:  info@ekosportsacademy.ng      / Demo@1234!
-- Agent:      scouting@premierfootballagency.ng / Demo@1234!
-- Players:    chukwuemeka.okafor@sportbridge.ng / Demo@1234!
--             adewale.ibrahim@sportbridge.ng    / Demo@1234!
--             emeka.nwosu@sportbridge.ng        / Demo@1234!
--             (and 7 more @sportbridge.ng — all password Demo@1234!)

-- To make the seed agent account a super_admin for demo purposes:
-- update public.profiles set role = 'super_admin' where email = 'scouting@premierfootballagency.ng';
