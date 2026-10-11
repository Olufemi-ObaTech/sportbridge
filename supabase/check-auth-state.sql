-- =============================================================================
-- SportBridge — Check current auth state and fix passwords
-- Run this in Supabase SQL Editor
-- =============================================================================

-- 1. Check what users exist and their current state
select
  email,
  email_confirmed_at is not null     as email_confirmed,
  encrypted_password is not null     as has_password,
  left(encrypted_password, 7)        as hash_prefix,
  raw_user_meta_data ->> 'role'      as role,
  created_at::date                   as created
from auth.users
order by created_at;
