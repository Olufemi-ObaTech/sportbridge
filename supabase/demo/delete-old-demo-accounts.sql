-- =============================================================================
-- SportBridge — delete-old-demo-accounts.sql
-- Deletes the old .demo accounts and all their profile data.
-- New demo accounts use @sportbridge.online.demo emails and work correctly.
-- Run in: https://supabase.com/dashboard/project/qnueqhlxmtkvecppygrk/sql/new
-- =============================================================================

-- Step 1: Delete from auth.users (cascades to profiles via ON DELETE CASCADE)
DELETE FROM auth.users
WHERE email IN (
  'marcus.thompson@sportbridge.demo',
  'carlos.mendes@sportbridge.demo',
  'scouting@global-talent.demo',
  'admin@elitelondonfc.demo',
  'sophie.laurent@sportbridge.demo'
);

-- Step 2: Clean up any orphaned profile rows (safety net)
DELETE FROM public.profiles
WHERE email IN (
  'marcus.thompson@sportbridge.demo',
  'carlos.mendes@sportbridge.demo',
  'scouting@global-talent.demo',
  'admin@elitelondonfc.demo',
  'sophie.laurent@sportbridge.demo'
);

-- Step 3: Confirm deletion
SELECT COUNT(*) AS remaining_old_accounts
FROM auth.users
WHERE email IN (
  'marcus.thompson@sportbridge.demo',
  'carlos.mendes@sportbridge.demo',
  'scouting@global-talent.demo',
  'admin@elitelondonfc.demo',
  'sophie.laurent@sportbridge.demo'
);
-- Should return: remaining_old_accounts = 0
