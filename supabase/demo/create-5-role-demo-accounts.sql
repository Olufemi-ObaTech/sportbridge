-- =============================================================================
-- SportBridge — create-5-role-demo-accounts.sql
-- Creates 1 demo account per role (5 total) with full profile data
-- New Supabase project: qnueqhlxmtkvecppygrk (sportbridge.online)
--
-- Password for ALL demo accounts: Demo@SportBridge1!
--
-- Demo accounts:
--   Player:   marcus.thompson@sportbridge.demo
--   Coach:    carlos.mendes@sportbridge.demo
--   Agent:    scouting@global-talent.demo
--   Academy:  admin@elitelondonfc.demo
--   Analyst:  sophie.laurent@sportbridge.demo
--
-- Run in Supabase SQL Editor → safe to re-run (uses ON CONFLICT DO NOTHING)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- STEP 1: Create auth.users
-- =============================================================================
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    (
      '33000000-0000-0000-0000-000000000001'::uuid,
      'marcus.thompson@sportbridge.demo',
      '{"full_name":"Marcus Thompson","role":"player","sport":"football"}'::jsonb,
      'Demo@SportBridge1!'
    ),
    (
      '33000000-0000-0000-0000-000000000002'::uuid,
      'carlos.mendes@sportbridge.demo',
      '{"full_name":"Carlos Mendes","role":"coach","sport":"football"}'::jsonb,
      'Demo@SportBridge1!'
    ),
    (
      '33000000-0000-0000-0000-000000000003'::uuid,
      'scouting@global-talent.demo',
      '{"full_name":"Global Talent Agency","role":"agent","sport":"football"}'::jsonb,
      'Demo@SportBridge1!'
    ),
    (
      '33000000-0000-0000-0000-000000000004'::uuid,
      'admin@elitelondonfc.demo',
      '{"full_name":"Elite London FC","role":"academy","sport":"football"}'::jsonb,
      'Demo@SportBridge1!'
    ),
    (
      '33000000-0000-0000-0000-000000000005'::uuid,
      'sophie.laurent@sportbridge.demo',
      '{"full_name":"Sophie Laurent","role":"sports_analyst","sport":"football"}'::jsonb,
      'Demo@SportBridge1!'
    )
  ) AS t(id, email, meta, pw)
  LOOP
    -- Skip if user already exists by id OR email
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = r.id OR email = r.email) THEN
      CONTINUE;
    END IF;

    INSERT INTO auth.users (
      id, instance_id, aud, role,
      email, encrypted_password,
      email_confirmed_at, confirmation_sent_at,
      raw_user_meta_data,
      created_at, updated_at,
      is_sso_user, is_anonymous
    ) VALUES (
      r.id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      r.email,
      crypt(r.pw, gen_salt('bf')),
      now(), now(),
      r.meta,
      now(), now(),
      false, false
    );
  END LOOP;
END $$;

-- =============================================================================
-- STEP 2: Confirm all emails in auth.users
-- =============================================================================
UPDATE auth.users
SET email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at = now()
WHERE email IN (
  'marcus.thompson@sportbridge.demo',
  'carlos.mendes@sportbridge.demo',
  'scouting@global-talent.demo',
  'admin@elitelondonfc.demo',
  'sophie.laurent@sportbridge.demo'
);

-- =============================================================================
-- STEP 3: Ensure profiles exist (trigger should auto-create, this is a safety net)
-- =============================================================================
INSERT INTO public.profiles (id, email, full_name, role, sport, status, verification_status, updated_at)
VALUES
  ('33000000-0000-0000-0000-000000000001', 'marcus.thompson@sportbridge.demo',  'Marcus Thompson',    'player',         'football', 'active', 'verified',   now()),
  ('33000000-0000-0000-0000-000000000002', 'carlos.mendes@sportbridge.demo',    'Carlos Mendes',      'coach',          'football', 'active', 'verified',   now()),
  ('33000000-0000-0000-0000-000000000003', 'scouting@global-talent.demo',       'Global Talent Agency','agent',         'football', 'active', 'verified',   now()),
  ('33000000-0000-0000-0000-000000000004', 'admin@elitelondonfc.demo',           'Elite London FC',    'academy',        'football', 'active', 'verified',   now()),
  ('33000000-0000-0000-0000-000000000005', 'sophie.laurent@sportbridge.demo',   'Sophie Laurent',     'sports_analyst', 'football', 'active', 'verified',   now())
ON CONFLICT (id) DO UPDATE SET
  full_name           = EXCLUDED.full_name,
  role                = EXCLUDED.role,
  sport               = EXCLUDED.sport,
  status              = EXCLUDED.status,
  updated_at          = now();

-- Fix verification_status separately (bypasses trigger since we update profiles table directly)
ALTER TABLE public.profiles DISABLE TRIGGER protect_profile_verification_fields;

UPDATE public.profiles SET verification_status = 'verified'
WHERE email IN (
  'marcus.thompson@sportbridge.demo',
  'carlos.mendes@sportbridge.demo',
  'scouting@global-talent.demo',
  'admin@elitelondonfc.demo',
  'sophie.laurent@sportbridge.demo'
);

ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_verification_fields;

-- =============================================================================
-- STEP 4: Player profile — Marcus Thompson
-- =============================================================================
INSERT INTO public.players (
  profile_id, display_name, position, secondary_position,
  age, country, nationality, gender, foot, preferred_foot,
  height_cm, weight_kg, current_club, bio, achievements,
  is_public, sport, region, availability, age_group,
  stats, updated_at
) VALUES (
  '33000000-0000-0000-0000-000000000001',
  'Marcus Thompson',
  'Centre Back', 'Right Back',
  25, 'England', 'English', 'male', 'right', 'right',
  185, 80, 'FC Academy London',
  'Composed, ball-playing centre-back with Bundesliga experience. Strong in aerial duels and comfortable on the ball.',
  'Germany U21 (11 caps). Bundesliga U23 Team of the Season 2022. Won regional league title 2021.',
  true, 'football', 'Europe', 'available_now', 'Senior',
  '{"total_appearances":103,"total_goals":5,"total_assists":8,"total_clean_sheets":42,"pass_accuracy":87,"aerial_duels_won":74}'::jsonb,
  now()
) ON CONFLICT (profile_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  position = EXCLUDED.position,
  bio = EXCLUDED.bio,
  is_public = true,
  updated_at = now();

-- =============================================================================
-- STEP 5: Coach profile — Carlos Mendes
-- =============================================================================
INSERT INTO public.coach_profiles (
  user_id, full_name, sport, preferred_role,
  experience_years, current_club, nationality, gender,
  about, achievements, badges, open_to_work, is_public, updated_at
) VALUES (
  '33000000-0000-0000-0000-000000000002',
  'Carlos Mendes',
  'football', 'Sporting Director',
  18, 'Sporting Lisboa B', 'Spanish', 'male',
  'Sporting Director with 18 years in La Liga and Portuguese football. Specialist in player recruitment and academy development.',
  'Sporting Director for two La Liga clubs. Oversaw 40+ first-team signings. Built academy pipeline feeding senior squads.',
  ARRAY['UEFA Pro Licence', 'Executive MBA La Liga', 'FIFA Coaching Certificate'],
  true, true, now()
) ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  preferred_role = EXCLUDED.preferred_role,
  about = EXCLUDED.about,
  is_public = true,
  updated_at = now();

-- =============================================================================
-- STEP 6: Agent profile — Global Talent Agency
-- =============================================================================
INSERT INTO public.agent_profiles (
  user_id, agency_name, sport, nationality,
  experience_years, regions, about, achievements,
  is_public, verified_badge, updated_at
) VALUES (
  '33000000-0000-0000-0000-000000000003',
  'Global Talent Agency',
  'football', 'Nigerian',
  12,
  ARRAY['West Africa', 'Europe', 'Middle East', 'UK'],
  'Licensed FIFA agent specialising in African and European player recruitment. Offices in Lagos, London and Dubai.',
  'Facilitated 85+ international transfers. Clients in Premier League, Serie A and Saudi Pro League. FIFA Agent Licence holder since 2012.',
  true, true, now()
) ON CONFLICT (user_id) DO UPDATE SET
  agency_name = EXCLUDED.agency_name,
  about = EXCLUDED.about,
  is_public = true,
  updated_at = now();

-- =============================================================================
-- STEP 7: Academy profile + Club — Elite London FC
-- =============================================================================
-- Create club first
INSERT INTO public.clubs (
  id, owner_id, name, country,
  about, website, sports, status, verified_badge, updated_at
) VALUES (
  '44000000-0000-0000-0000-000000000001',
  '33000000-0000-0000-0000-000000000004',
  'Elite London FC',
  'England',
  'Premier youth development academy based in London. Producing top talent for the English football pyramid since 2005.',
  'https://sportbridge.online',
  ARRAY['football'],
  'active', true, now()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  about = EXCLUDED.about,
  updated_at = now();

-- Create academy profile
INSERT INTO public.academy_profiles (
  user_id, club_id, sports, country, state,
  year_founded, leagues, languages,
  linkedin, updated_at
) VALUES (
  '33000000-0000-0000-0000-000000000004',
  '44000000-0000-0000-0000-000000000001',
  ARRAY['football'],
  'England', 'London',
  2005,
  ARRAY['English Premier League U18', 'FA Youth Cup', 'London Youth League'],
  ARRAY['English', 'French', 'Spanish'],
  'https://linkedin.com/company/elitelondonfc',
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  club_id = EXCLUDED.club_id,
  year_founded = EXCLUDED.year_founded,
  updated_at = now();

-- =============================================================================
-- STEP 8: Sports Analyst profile — Sophie Laurent
-- =============================================================================
INSERT INTO public.coach_profiles (
  user_id, full_name, sport, preferred_role,
  experience_years, current_club, nationality, gender,
  about, achievements, badges, open_to_work, is_public, updated_at
) VALUES (
  '33000000-0000-0000-0000-000000000005',
  'Sophie Laurent',
  'football', 'Recruitment Analyst',
  9, 'Desert Sports Management', 'French', 'female',
  'Recruitment analyst with 9 years across MLS, Saudi Pro League and Europe. Expert in data-driven player identification.',
  'Reports for 200+ players leading to 18 confirmed signings. Developed proprietary scouting database covering 50+ leagues.',
  ARRAY['Wyscout Certified', 'StatsBomb IQ', 'UEFA Analytics Diploma'],
  true, true, now()
) ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  preferred_role = EXCLUDED.preferred_role,
  about = EXCLUDED.about,
  is_public = true,
  updated_at = now();

-- =============================================================================
-- STEP 9: Add career history for Marcus Thompson
-- =============================================================================
INSERT INTO public.player_history (
  player_id, club_name, season_from, season_to,
  appearances, goals, assists, clean_sheets, notes, sort_order
)
SELECT
  p.id,
  h.club_name, h.season_from, h.season_to,
  h.appearances, h.goals, h.assists, h.clean_sheets, h.notes, h.sort_order
FROM public.players p,
(VALUES
  ('FC Bayern Munich B', '2020', '2022', 48, 3, 5, 18, 'Won Regionalliga Bayern title 2021', 1),
  ('Borussia Dortmund II', '2022', '2023', 32, 1, 2, 12, 'BVB loan — developed under Terzic methodology', 2),
  ('FC Academy London', '2023', NULL,     23, 1, 1, 12, 'Current club — first-team regular', 3)
) AS h(club_name, season_from, season_to, appearances, goals, assists, clean_sheets, notes, sort_order)
WHERE p.profile_id = '33000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- STEP 10: Verify everything worked
-- =============================================================================
SELECT
  p.email,
  p.full_name,
  p.role,
  p.status,
  p.verification_status,
  CASE
    WHEN p.role = 'player' THEN (SELECT display_name FROM public.players WHERE profile_id = p.id LIMIT 1)
    WHEN p.role IN ('coach','sports_analyst') THEN (SELECT full_name FROM public.coach_profiles WHERE user_id = p.id LIMIT 1)
    WHEN p.role = 'agent' THEN (SELECT agency_name FROM public.agent_profiles WHERE user_id = p.id LIMIT 1)
    WHEN p.role = 'academy' THEN (SELECT name FROM public.clubs WHERE owner_id = p.id LIMIT 1)
  END AS profile_name
FROM public.profiles p
WHERE p.email IN (
  'marcus.thompson@sportbridge.demo',
  'carlos.mendes@sportbridge.demo',
  'scouting@global-talent.demo',
  'admin@elitelondonfc.demo',
  'sophie.laurent@sportbridge.demo'
)
ORDER BY p.role;
