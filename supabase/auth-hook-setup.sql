-- =============================================================================
-- SportBridge — Auth Hook: Route all auth emails through Brevo via Netlify
--
-- Run this in Supabase SQL Editor AFTER:
--   1. Deploying the send-email Netlify function
--   2. Setting BREVO_API_KEY in Netlify env vars
--
-- This registers a "Send Email" hook that fires on:
--   - User signup (confirmation email)
--   - Password reset
--   - Magic link
--   - Email change confirmation
-- =============================================================================

-- Grant the hook the right to invoke the HTTP extension
-- (Supabase already has pg_net or supabase_functions available)

-- Register the auth hook via the supabase_functions schema
-- (This is the config-as-code approach for the Auth Hook)

-- Note: The actual hook URL is set in the Supabase Dashboard at:
--   Authentication → Auth Hooks (BETA) → Add hook → "Send Email"
--   URL: https://sportbridge-com-ng.netlify.app/.netlify/functions/send-email
--
-- If you prefer to use the SQL approach with pg_net:
select
  'Hook URL to register in dashboard:' as instruction,
  'https://sportbridge-com-ng.netlify.app/.netlify/functions/send-email' as hook_url,
  'Send Email' as hook_type,
  'POST' as method;

-- =============================================================================
-- QUICK REFERENCE — All user logins
-- =============================================================================
-- Site: https://sportbridge-com-ng.netlify.app
--
-- ADMIN:
--   sportbridge.com.ng@gmail.com  / [your password]  (after running disable-email-confirm.sql)
--
-- DEMO ACCOUNTS (run seed.sql first — all use password: Demo@1234!)
--   admin@lagosunitedfc.ng                  (Academy)
--   info@ekosportsacademy.ng                (Academy)
--   scouting@premierfootballagency.ng       (Agent/Scout)
--   chukwuemeka.okafor@sportbridge.ng       (Player — Striker)
--   adewale.ibrahim@sportbridge.ng          (Player — Goalkeeper)
--   emeka.nwosu@sportbridge.ng              (Player — Central Mid)
--   babatunde.adeleke@sportbridge.ng        (Player — Left Back)
--   david.eze@sportbridge.ng                (Player — Centre Back)
--   samuel.okonkwo@sportbridge.ng           (Player — Right Wing)
--   ibrahim.musa@sportbridge.ng             (Player — Defensive Mid)
--   chisom.agu@sportbridge.ng               (Player — Striker, Female)
--   tunde.salami@sportbridge.ng             (Player — Right Back)
--   kelechi.obiora@sportbridge.ng           (Player — Centre Forward)
-- =============================================================================
