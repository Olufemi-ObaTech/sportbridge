-- =============================================================================
-- SportBridge — patch-verification-id.sql
-- Adds computed verification_id view for display purposes.
-- The ID is generated deterministically from the user's UUID in the frontend
-- (see frontend/src/lib/verificationId.js) so no extra column is needed.
-- This patch just adds a helper view for admin queries.
-- Run in: Supabase SQL Editor
-- =============================================================================

-- Create a view that shows verification IDs for all verified members
CREATE OR REPLACE VIEW public.verified_members AS
SELECT
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.verification_status,
  p.created_at AS member_since,
  -- Verification ID: SB- + first 4 hex chars + - + next 4 hex chars (uppercase)
  'SB-' ||
  upper(substring(replace(p.id::text, '-', ''), 1, 4)) ||
  '-' ||
  upper(substring(replace(p.id::text, '-', ''), 5, 4)) AS verification_id
FROM public.profiles p
WHERE p.verification_status = 'verified'
  AND p.status = 'active'
ORDER BY p.created_at DESC;

-- Grant read access
GRANT SELECT ON public.verified_members TO authenticated;
GRANT SELECT ON public.verified_members TO anon;

-- Verify
SELECT verification_id, full_name, role, member_since
FROM public.verified_members
LIMIT 5;
