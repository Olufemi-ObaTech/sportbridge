-- =============================================================================
-- SportBridge — fix-demo-passwords.sql
-- Resets demo account passwords using Supabase's correct bcrypt format
-- Run in: https://supabase.com/dashboard/project/qnueqhlxmtkvecppygrk/sql/new
-- Password for all demo accounts: Demo@SportBridge1!
-- =============================================================================

-- Reset passwords for all 5 demo accounts using correct Supabase format
UPDATE auth.users
SET
  encrypted_password = crypt('Demo@SportBridge1!', gen_salt('bf', 10)),
  updated_at = now(),
  email_confirmed_at = coalesce(email_confirmed_at, now())
WHERE email IN (
  'marcus.thompson@sportbridge.demo',
  'carlos.mendes@sportbridge.demo',
  'scouting@global-talent.demo',
  'admin@elitelondonfc.demo',
  'sophie.laurent@sportbridge.demo'
);

-- Confirm all sessions are cleared so fresh login works
DELETE FROM auth.sessions
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN (
    'marcus.thompson@sportbridge.demo',
    'carlos.mendes@sportbridge.demo',
    'scouting@global-talent.demo',
    'admin@elitelondonfc.demo',
    'sophie.laurent@sportbridge.demo'
  )
);

-- Verify
SELECT
  email,
  email_confirmed_at IS NOT NULL AS email_confirmed,
  updated_at
FROM auth.users
WHERE email IN (
  'marcus.thompson@sportbridge.demo',
  'carlos.mendes@sportbridge.demo',
  'scouting@global-talent.demo',
  'admin@elitelondonfc.demo',
  'sophie.laurent@sportbridge.demo'
)
ORDER BY email;
