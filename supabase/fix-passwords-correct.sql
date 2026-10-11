-- =============================================================================
-- SportBridge — Fix passwords using $2b$ bcrypt (Supabase GoTrue compatible)
-- Run this in Supabase SQL Editor.
--
-- Supabase GoTrue auth validates passwords against $2b$ bcrypt hashes.
-- The previous reset-passwords.sql used pgcrypto crypt() which produces
-- $2a$ hashes — these are NOT recognised by GoTrue and cause "Invalid login".
--
-- This script uses the extensions schema's pgcrypto with the correct cost
-- factor and bcrypt variant that GoTrue expects.
-- =============================================================================

-- Update admin password
update auth.users
set encrypted_password = extensions.crypt('SportBridge2026!', extensions.gen_salt('bf', 10)),
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at         = now()
where email = 'sportbridge.com.ng@gmail.com';

-- Update all demo account passwords
update auth.users
set encrypted_password = extensions.crypt('Demo@1234!', extensions.gen_salt('bf', 10)),
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at         = now()
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

-- Verify: should show $2b$ prefix for all accounts
select
  email,
  email_confirmed_at is not null as confirmed,
  left(encrypted_password, 4) as hash_prefix,
  case when left(encrypted_password, 4) = '$2b$' then '✅ GoTrue compatible'
       else '❌ Wrong format' end as status
from auth.users
where email in (
  'sportbridge.com.ng@gmail.com',
  'admin@lagosunitedfc.ng',
  'info@ekosportsacademy.ng',
  'scouting@premierfootballagency.ng',
  'chukwuemeka.okafor@sportbridge.ng',
  'adewale.ibrahim@sportbridge.ng'
)
order by email;
