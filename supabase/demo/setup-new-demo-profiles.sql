-- =============================================================================
-- SportBridge — setup-new-demo-profiles.sql
-- Creates rich profile data for the 6 new demo accounts.
-- Accounts were registered manually on sportbridge.online
-- Run in: https://supabase.com/dashboard/project/qnueqhlxmtkvecppygrk/sql/new
--
-- VERIFIED (4):   marcus, carlos, scoutingglobal-talent, sophie
-- UNVERIFIED (2): scouting@sportbridge.online.demo, admin-elitelondonfc
-- =============================================================================

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1: Update profile full names and roles correctly
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE public.profiles SET
  full_name = 'Marcus Thompson',
  role      = 'player',
  sport     = 'football',
  status    = 'active',
  updated_at = now()
WHERE email = 'marcus.thompson@sportbridge.online.demo';

UPDATE public.profiles SET
  full_name = 'Carlos Mendes',
  role      = 'coach',
  sport     = 'football',
  status    = 'active',
  updated_at = now()
WHERE email = 'carlos.mendes@sportbridge.online.demo';

UPDATE public.profiles SET
  full_name = 'James Okonkwo',
  role      = 'agent',
  sport     = 'football',
  status    = 'active',
  updated_at = now()
WHERE email = 'scouting@sportbridge.online.demo';

UPDATE public.profiles SET
  full_name = 'Global Talent Agency',
  role      = 'agent',
  sport     = 'football',
  status    = 'active',
  updated_at = now()
WHERE email = 'scoutingglobal-talent@sportbridge.online.demo';

UPDATE public.profiles SET
  full_name = 'Elite London FC',
  role      = 'academy',
  sport     = 'football',
  status    = 'active',
  updated_at = now()
WHERE email = 'admin-elitelondonfcsportbridge.online.demo';

UPDATE public.profiles SET
  full_name = 'Sophie Laurent',
  role      = 'sports_analyst',
  sport     = 'football',
  status    = 'active',
  updated_at = now()
WHERE email = 'sophie.laurent@sportbridge.online.demo';

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: Set verification status
-- Verified: marcus, carlos, scoutingglobal-talent, sophie
-- Unverified: scouting@, admin-elitelondonfc (for testing)
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.profiles DISABLE TRIGGER protect_profile_verification_fields;

UPDATE public.profiles SET
  verification_status = 'verified',
  updated_at = now()
WHERE email IN (
  'marcus.thompson@sportbridge.online.demo',
  'carlos.mendes@sportbridge.online.demo',
  'scoutingglobal-talent@sportbridge.online.demo',
  'sophie.laurent@sportbridge.online.demo'
);

-- Keep these unverified (intentional — good for testing the gate)
UPDATE public.profiles SET
  verification_status = 'unverified',
  updated_at = now()
WHERE email IN (
  'scouting@sportbridge.online.demo',
  'admin-elitelondonfcsportbridge.online.demo'
);

ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_verification_fields;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: Player profile — Marcus Thompson
-- ═══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM public.profiles WHERE email = 'marcus.thompson@sportbridge.online.demo';
  IF v_uid IS NULL THEN RAISE NOTICE 'Marcus not found'; RETURN; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.players WHERE profile_id = v_uid) THEN
    INSERT INTO public.players (
      profile_id, display_name, position, secondary_position,
      age, country, nationality, gender, foot, preferred_foot,
      height_cm, weight_kg, current_club, bio, achievements,
      is_public, sport, region, availability, age_group, stats, updated_at
    ) VALUES (
      v_uid, 'Marcus Thompson', 'Centre Back', 'Right Back',
      25, 'England', 'English', 'male', 'right', 'right',
      185, 80, 'FC Academy London',
      'Composed, ball-playing centre-back with Bundesliga experience. Strong in aerial duels and comfortable on the ball. Reads the game well and is comfortable distributing from the back.',
      'Germany U21 (11 caps). Bundesliga U23 Team of the Season 2022. Won regional league title 2021. FA Youth Cup finalist.',
      true, 'football', 'Europe', 'available_now', 'Senior',
      '{"total_appearances":103,"total_goals":5,"total_assists":8,"total_clean_sheets":42,"pass_accuracy":87,"aerial_duels_won":74}'::jsonb,
      now()
    );
  ELSE
    UPDATE public.players SET
      display_name='Marcus Thompson', position='Centre Back',
      secondary_position='Right Back', age=25,
      country='England', nationality='English', gender='male',
      foot='right', preferred_foot='right', height_cm=185, weight_kg=80,
      current_club='FC Academy London',
      bio='Composed, ball-playing centre-back with Bundesliga experience. Strong in aerial duels and comfortable on the ball.',
      achievements='Germany U21 (11 caps). Bundesliga U23 Team of the Season 2022. Won regional league title 2021.',
      is_public=true, sport='football', region='Europe',
      availability='available_now', age_group='Senior',
      stats='{"total_appearances":103,"total_goals":5,"total_assists":8,"total_clean_sheets":42,"pass_accuracy":87}'::jsonb,
      updated_at=now()
    WHERE profile_id = v_uid;
  END IF;
END $$;

-- Career history for Marcus
DO $$
DECLARE v_uid uuid; v_pid uuid;
BEGIN
  SELECT id INTO v_uid FROM public.profiles WHERE email = 'marcus.thompson@sportbridge.online.demo';
  SELECT id INTO v_pid FROM public.players WHERE profile_id = v_uid;
  IF v_pid IS NULL THEN RAISE NOTICE 'Player row not found'; RETURN; END IF;
  DELETE FROM public.player_history WHERE player_id = v_pid;
  INSERT INTO public.player_history (player_id,club_name,season_from,season_to,appearances,goals,assists,clean_sheets,notes,sort_order) VALUES
    (v_pid,'Blackpool FC Academy', '2017','2019',42,2,3,15,'Developed through youth system, broke into first-team squad',1),
    (v_pid,'FC Bayern Munich B',   '2019','2022',48,3,5,18,'Won Regionalliga Bayern title 2021. Named in Bundesliga U23 Team of the Season 2022',2),
    (v_pid,'Borussia Dortmund II', '2022','2023',32,1,2,12,'BVB loan — developed under Terzic methodology. Played 32 competitive games',3),
    (v_pid,'FC Academy London',    '2023',NULL,  23,1,1,12,'Current club — first-team regular, club captain 2024',4);
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 4: Coach profile — Carlos Mendes
-- ═══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM public.profiles WHERE email = 'carlos.mendes@sportbridge.online.demo';
  IF v_uid IS NULL THEN RAISE NOTICE 'Carlos not found'; RETURN; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.coach_profiles WHERE user_id = v_uid) THEN
    INSERT INTO public.coach_profiles (
      user_id, full_name, sport, preferred_role,
      experience_years, current_club, nationality, gender,
      about, achievements, badges, open_to_work, is_public, updated_at
    ) VALUES (
      v_uid, 'Carlos Mendes', 'football', 'Sporting Director',
      18, 'Sporting Lisboa B', 'Spanish', 'male',
      'Sporting Director with 18 years in La Liga and Portuguese football. Specialist in player recruitment, squad planning and academy development. Has a strong network across Europe and Latin America.',
      'Sporting Director for two La Liga clubs. Oversaw 40+ first-team signings. Built academy pipeline feeding senior squads. Helped one club gain promotion to La Liga in 2019.',
      ARRAY['UEFA Pro Licence','Executive MBA La Liga','FIFA Coaching Certificate','FA Level 4'],
      true, true, now()
    );
  ELSE
    UPDATE public.coach_profiles SET
      full_name='Carlos Mendes', preferred_role='Sporting Director',
      experience_years=18, current_club='Sporting Lisboa B',
      nationality='Spanish', gender='male',
      about='Sporting Director with 18 years in La Liga and Portuguese football.',
      achievements='Sporting Director for two La Liga clubs. Oversaw 40+ first-team signings.',
      badges=ARRAY['UEFA Pro Licence','Executive MBA La Liga','FIFA Coaching Certificate'],
      open_to_work=true, is_public=true, updated_at=now()
    WHERE user_id = v_uid;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 5: Agent profile — scouting@sportbridge.online.demo (Unverified — James Okonkwo)
-- ═══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM public.profiles WHERE email = 'scouting@sportbridge.online.demo';
  IF v_uid IS NULL THEN RAISE NOTICE 'James not found'; RETURN; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.agent_profiles WHERE user_id = v_uid) THEN
    INSERT INTO public.agent_profiles (
      user_id, agency_name, sport, nationality,
      experience_years, regions, about, achievements,
      is_public, verified_badge, updated_at
    ) VALUES (
      v_uid, 'Okonkwo Sports Group', 'football', 'Nigerian',
      5,
      ARRAY['West Africa','UK','France'],
      'Up-and-coming Nigerian sports agent focused on West African talent identification. Based in Lagos with connections in England and France.',
      'Represented 12 players in professional leagues. Facilitated 8 international transfers including 3 to English lower leagues.',
      true, false, now()
    );
  ELSE
    UPDATE public.agent_profiles SET
      agency_name='Okonkwo Sports Group', experience_years=5,
      regions=ARRAY['West Africa','UK','France'],
      about='Up-and-coming Nigerian sports agent focused on West African talent identification.',
      is_public=true, updated_at=now()
    WHERE user_id = v_uid;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 6: Agent profile — Global Talent Agency (scoutingglobal-talent) VERIFIED
-- ═══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM public.profiles WHERE email = 'scoutingglobal-talent@sportbridge.online.demo';
  IF v_uid IS NULL THEN RAISE NOTICE 'Global Talent not found'; RETURN; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.agent_profiles WHERE user_id = v_uid) THEN
    INSERT INTO public.agent_profiles (
      user_id, agency_name, sport, nationality,
      experience_years, regions, about, achievements,
      is_public, verified_badge, updated_at
    ) VALUES (
      v_uid, 'Global Talent Agency', 'football', 'Nigerian',
      12,
      ARRAY['West Africa','Europe','Middle East','UK','USA'],
      'Licensed FIFA agent specialising in African and European player recruitment. Offices in Lagos, London and Dubai. Expert in cross-regional transfers and player development deals.',
      'Facilitated 85+ international transfers. Clients in Premier League, Serie A, Bundesliga and Saudi Pro League. FIFA Agent Licence holder since 2012. Agent of the Year nominee — WAF Awards 2023.',
      true, true, now()
    );
  ELSE
    UPDATE public.agent_profiles SET
      agency_name='Global Talent Agency',
      experience_years=12,
      regions=ARRAY['West Africa','Europe','Middle East','UK','USA'],
      about='Licensed FIFA agent specialising in African and European player recruitment. Offices in Lagos, London and Dubai.',
      achievements='Facilitated 85+ international transfers. Clients in Premier League, Serie A and Saudi Pro League. FIFA Agent Licence holder since 2012.',
      is_public=true, verified_badge=true, updated_at=now()
    WHERE user_id = v_uid;
  END IF;

  -- Update agent_profiles verified_badge and profile verification
  UPDATE public.agent_profiles SET verified_badge = true WHERE user_id = v_uid;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 7: Academy / Club — Elite London FC (admin-elitelondonfc) UNVERIFIED
-- ═══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE v_uid uuid; v_club_id uuid;
BEGIN
  SELECT id INTO v_uid FROM public.profiles WHERE email = 'admin-elitelondonfcsportbridge.online.demo';
  IF v_uid IS NULL THEN RAISE NOTICE 'Elite London FC not found'; RETURN; END IF;

  -- Create club
  IF NOT EXISTS (SELECT 1 FROM public.clubs WHERE owner_id = v_uid) THEN
    INSERT INTO public.clubs (owner_id, name, country, about, sports, status, verified_badge, updated_at)
    VALUES (
      v_uid, 'Elite London FC', 'England',
      'Premier youth development academy based in East London. Producing top talent for the English football pyramid since 2005. Known for developing technically gifted players with strong tactical awareness.',
      ARRAY['football'], 'active', false, now()
    ) RETURNING id INTO v_club_id;
  ELSE
    SELECT id INTO v_club_id FROM public.clubs WHERE owner_id = v_uid LIMIT 1;
    UPDATE public.clubs SET
      name='Elite London FC', country='England',
      about='Premier youth development academy based in East London. Producing top talent for the English football pyramid since 2005.',
      sports=ARRAY['football'], status='active', updated_at=now()
    WHERE id = v_club_id;
  END IF;

  -- Create academy profile
  IF NOT EXISTS (SELECT 1 FROM public.academy_profiles WHERE user_id = v_uid) THEN
    INSERT INTO public.academy_profiles (
      user_id, club_id, sports, country, state,
      year_founded, leagues, languages, updated_at
    ) VALUES (
      v_uid, v_club_id, ARRAY['football'], 'England', 'London',
      2005,
      ARRAY['English Premier League U18','FA Youth Cup','London Youth League','EFL Youth Alliance'],
      ARRAY['English','French'],
      now()
    );
  ELSE
    UPDATE public.academy_profiles SET
      club_id=v_club_id, year_founded=2005,
      leagues=ARRAY['English Premier League U18','FA Youth Cup','London Youth League'],
      languages=ARRAY['English','French'], updated_at=now()
    WHERE user_id = v_uid;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 8: Analyst profile — Sophie Laurent VERIFIED
-- ═══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM public.profiles WHERE email = 'sophie.laurent@sportbridge.online.demo';
  IF v_uid IS NULL THEN RAISE NOTICE 'Sophie not found'; RETURN; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.coach_profiles WHERE user_id = v_uid) THEN
    INSERT INTO public.coach_profiles (
      user_id, full_name, sport, preferred_role,
      experience_years, current_club, nationality, gender,
      about, achievements, badges, open_to_work, is_public, updated_at
    ) VALUES (
      v_uid, 'Sophie Laurent', 'football', 'Recruitment Analyst',
      9, 'Desert Sports Management', 'French', 'female',
      'Recruitment and performance analyst with 9 years across MLS, Saudi Pro League and European football. Expert in data-driven player identification, GPS performance tracking and video analysis. Fluent in English, French and Spanish.',
      'Produced scouting reports for 200+ players leading to 18 confirmed signings across 5 leagues. Developed proprietary recruitment database covering 50+ leagues globally. Speaker at MIT Sloan Sports Analytics Conference 2023.',
      ARRAY['Wyscout Certified Analyst','StatsBomb IQ Advanced','Opta Analytics Pro','Sports Science MSc (Paris)','UEFA Analytics Diploma'],
      true, true, now()
    );
  ELSE
    UPDATE public.coach_profiles SET
      full_name='Sophie Laurent', preferred_role='Recruitment Analyst',
      experience_years=9, current_club='Desert Sports Management',
      nationality='French', gender='female',
      about='Recruitment and performance analyst with 9 years across MLS, Saudi Pro League and European football.',
      achievements='Scouting reports for 200+ players leading to 18 confirmed signings. Speaker at MIT Sloan Sports Analytics Conference 2023.',
      badges=ARRAY['Wyscout Certified','StatsBomb IQ','Opta Analytics Pro','Sports Science MSc'],
      open_to_work=true, is_public=true, updated_at=now()
    WHERE user_id = v_uid;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 9: Verify — show all demo account profiles
-- ═══════════════════════════════════════════════════════════════════════════════
SELECT
  p.email,
  p.full_name,
  p.role,
  p.status,
  p.verification_status,
  CASE
    WHEN p.role = 'player'         THEN (SELECT pl.display_name FROM public.players pl WHERE pl.profile_id = p.id LIMIT 1)
    WHEN p.role IN ('coach','sports_analyst') THEN (SELECT cp.full_name FROM public.coach_profiles cp WHERE cp.user_id = p.id LIMIT 1)
    WHEN p.role = 'agent'          THEN (SELECT ap.agency_name FROM public.agent_profiles ap WHERE ap.user_id = p.id LIMIT 1)
    WHEN p.role = 'academy'        THEN (SELECT c.name FROM public.clubs c WHERE c.owner_id = p.id LIMIT 1)
  END AS profile_name
FROM public.profiles p
WHERE p.email IN (
  'marcus.thompson@sportbridge.online.demo',
  'carlos.mendes@sportbridge.online.demo',
  'scouting@sportbridge.online.demo',
  'scoutingglobal-talent@sportbridge.online.demo',
  'admin-elitelondonfcsportbridge.online.demo',
  'sophie.laurent@sportbridge.online.demo'
)
ORDER BY p.role;
