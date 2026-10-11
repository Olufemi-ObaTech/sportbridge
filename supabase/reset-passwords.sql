-- =============================================================================
-- SportBridge — Reset all demo + admin passwords
-- Run this in Supabase SQL Editor.
--
-- Uses extensions.crypt() (pgcrypto via the extensions schema) which
-- produces bcrypt hashes compatible with Supabase GoTrue authentication.
-- =============================================================================

-- Reset YOUR admin password
update auth.users
set
  encrypted_password = extensions.crypt('SportBridge2026!', extensions.gen_salt('bf', 10)),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  updated_at         = now()
where email = 'sportbridge.com.ng@gmail.com';

-- Reset all demo account passwords
update auth.users
set
  encrypted_password = extensions.crypt('Demo@1234!', extensions.gen_salt('bf', 10)),
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

-- Verify all accounts are confirmed and have passwords set
select
  email,
  email_confirmed_at is not null as confirmed,
  encrypted_password is not null as has_password,
  left(encrypted_password, 7) as password_hash_prefix
from auth.users
where email in (
  'sportbridge.com.ng@gmail.com',
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
)
order by email;
