-- =============================================================================
-- DISABLE EMAIL CONFIRMATION FOR DEMO PROJECT
-- Run this if accounts still can't log in after fix-login-now.sql
-- This makes all new signups auto-confirmed (no email needed)
-- =============================================================================

-- Mark all existing unconfirmed demo accounts as confirmed right now
update auth.users
set
  email_confirmed_at   = coalesce(email_confirmed_at, now()),
  confirmation_token   = '',
  updated_at           = now()
where (email_confirmed_at is null)
  and (
    email like '%@sportbridge.demo'
    or email like '%@elitelondonfc.demo'
    or email like '%@academie-paris.demo'
    or email like '%@ghanafinstitute.demo'
    or email like '%@sportinglisboa.demo'
    or email like '%@riversunited.demo'
    or email like '%@global-talent.demo'
    or email like '%@sabridge.demo'
    or email like '%@desertsports.demo'
    or email like '%@ajaxnetwork.demo'
    or email like '%@wascouts.demo'
  );

-- Check results
select
  u.email,
  u.email_confirmed_at is not null  as confirmed,
  u.aud,
  u.role                            as auth_role,
  left(u.encrypted_password, 7)     as hash_prefix
from auth.users u
where u.email in (
  'carlos.mendes@sportbridge.demo',
  'sophie.laurent@sportbridge.demo',
  'scouting@global-talent.demo',
  'admin@elitelondonfc.demo',
  'marcus.thompson@sportbridge.demo'
)
order by u.email;

-- If confirmed = true and hash_prefix = $2a$10 and auth_role = authenticated
-- then the accounts WILL log in. If they still fail, go to:
-- Supabase Dashboard → Authentication → Providers → Email
-- and turn OFF "Confirm email"
