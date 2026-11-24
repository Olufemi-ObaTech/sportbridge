-- =============================================================================
-- FIX LOGIN NOW — forces all 5 key demo accounts to be loginable
-- Run this in Supabase SQL Editor
-- =============================================================================

-- Force confirm emails + reset passwords for the 5 key accounts
update auth.users set
  encrypted_password    = extensions.crypt('Demo@SportBridge1!', extensions.gen_salt('bf', 10)),
  email_confirmed_at    = now(),
  confirmation_sent_at  = now(),
  is_sso_user           = false,
  banned_until          = null,
  aud                   = 'authenticated',
  role                  = 'authenticated',
  updated_at            = now()
where email in (
  'carlos.mendes@sportbridge.demo',
  'sophie.laurent@sportbridge.demo',
  'scouting@global-talent.demo',
  'admin@elitelondonfc.demo',
  'marcus.thompson@sportbridge.demo'
);

-- Fix profiles too
update public.profiles set
  status              = 'active',
  verification_status = 'verified',
  updated_at          = now()
where email in (
  'carlos.mendes@sportbridge.demo',
  'sophie.laurent@sportbridge.demo',
  'scouting@global-talent.demo',
  'admin@elitelondonfc.demo',
  'marcus.thompson@sportbridge.demo'
);

-- Also fix ALL other demo accounts at once
update auth.users set
  encrypted_password    = extensions.crypt('Demo@SportBridge1!', extensions.gen_salt('bf', 10)),
  email_confirmed_at    = now(),
  confirmation_sent_at  = now(),
  is_sso_user           = false,
  banned_until          = null,
  aud                   = 'authenticated',
  role                  = 'authenticated',
  updated_at            = now()
where email like '%@sportbridge.demo'
   or email like '%@elitelondonfc.demo'
   or email like '%@academie-paris.demo'
   or email like '%@ghanafinstitute.demo'
   or email like '%@sportinglisboa.demo'
   or email like '%@riversunited.demo'
   or email like '%@global-talent.demo'
   or email like '%@sabridge.demo'
   or email like '%@desertsports.demo'
   or email like '%@ajaxnetwork.demo'
   or email like '%@wascouts.demo';

update public.profiles set
  status              = 'active',
  verification_status = 'verified',
  updated_at          = now()
where email like '%@sportbridge.demo'
   or email like '%@elitelondonfc.demo'
   or email like '%@academie-paris.demo'
   or email like '%@ghanafinstitute.demo'
   or email like '%@sportinglisboa.demo'
   or email like '%@riversunited.demo'
   or email like '%@global-talent.demo'
   or email like '%@sabridge.demo'
   or email like '%@desertsports.demo'
   or email like '%@ajaxnetwork.demo'
   or email like '%@wascouts.demo';

-- Verify the 5 key accounts
select
  u.email,
  p.role,
  p.status,
  u.email_confirmed_at is not null   as confirmed,
  u.banned_until is null             as not_banned,
  u.aud,
  u.role                             as auth_role,
  left(u.encrypted_password, 7)      as hash_prefix
from auth.users u
join public.profiles p on p.id = u.id
where u.email in (
  'carlos.mendes@sportbridge.demo',
  'sophie.laurent@sportbridge.demo',
  'scouting@global-talent.demo',
  'admin@elitelondonfc.demo',
  'marcus.thompson@sportbridge.demo'
)
order by u.email;
