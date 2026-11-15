-- ============================================================
-- SportBridge — 5 Demo Accounts (NO CONFLICT VERSION)
-- Run in Supabase SQL Editor
-- Password for all: Demo@SportBridge1!
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- STEP 1: Create auth users (skip if already exists)
-- ============================================================
DO $$
BEGIN
  -- Player: Marcus Thompson
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'marcus.thompson@sportbridge.demo') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at,updated_at,is_sso_user,is_anonymous)
    VALUES ('33000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','marcus.thompson@sportbridge.demo',crypt('Demo@SportBridge1!',gen_salt('bf')),now(),'{"full_name":"Marcus Thompson","role":"player","sport":"football"}'::jsonb,now(),now(),false,false);
  END IF;

  -- Coach: Carlos Mendes
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'carlos.mendes@sportbridge.demo') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at,updated_at,is_sso_user,is_anonymous)
    VALUES ('33000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','carlos.mendes@sportbridge.demo',crypt('Demo@SportBridge1!',gen_salt('bf')),now(),'{"full_name":"Carlos Mendes","role":"coach","sport":"football"}'::jsonb,now(),now(),false,false);
  END IF;

  -- Agent: Global Talent Agency
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'scouting@global-talent.demo') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at,updated_at,is_sso_user,is_anonymous)
    VALUES ('33000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','scouting@global-talent.demo',crypt('Demo@SportBridge1!',gen_salt('bf')),now(),'{"full_name":"Global Talent Agency","role":"agent","sport":"football"}'::jsonb,now(),now(),false,false);
  END IF;

  -- Academy: Elite London FC
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@elitelondonfc.demo') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at,updated_at,is_sso_user,is_anonymous)
    VALUES ('33000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','admin@elitelondonfc.demo',crypt('Demo@SportBridge1!',gen_salt('bf')),now(),'{"full_name":"Elite London FC","role":"academy","sport":"football"}'::jsonb,now(),now(),false,false);
  END IF;

  -- Analyst: Sophie Laurent
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sophie.laurent@sportbridge.demo') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at,updated_at,is_sso_user,is_anonymous)
    VALUES ('33000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','sophie.laurent@sportbridge.demo',crypt('Demo@SportBridge1!',gen_salt('bf')),now(),'{"full_name":"Sophie Laurent","role":"sports_analyst","sport":"football"}'::jsonb,now(),now(),false,false);
  END IF;
END $$;

-- ============================================================
-- STEP 2: Confirm all emails
-- ============================================================
UPDATE auth.users
SET email_confirmed_at = coalesce(email_confirmed_at, now()), updated_at = now()
WHERE email IN (
  'marcus.thompson@sportbridge.demo',
  'carlos.mendes@sportbridge.demo',
  'scouting@global-talent.demo',
  'admin@elitelondonfc.demo',
  'sophie.laurent@sportbridge.demo'
);

-- ============================================================
-- STEP 3: Ensure profiles exist (upsert by id)
-- ============================================================
DO $$
DECLARE
  v_ids uuid[] := ARRAY[
    '33000000-0000-0000-0000-000000000001',
    '33000000-0000-0000-0000-000000000002',
    '33000000-0000-0000-0000-000000000003',
    '33000000-0000-0000-0000-000000000004',
    '33000000-0000-0000-0000-000000000005'
  ]::uuid[];
  v_emails text[] := ARRAY[
    'marcus.thompson@sportbridge.demo',
    'carlos.mendes@sportbridge.demo',
    'scouting@global-talent.demo',
    'admin@elitelondonfc.demo',
    'sophie.laurent@sportbridge.demo'
  ];
  v_names text[] := ARRAY['Marcus Thompson','Carlos Mendes','Global Talent Agency','Elite London FC','Sophie Laurent'];
  v_roles text[] := ARRAY['player','coach','agent','academy','sports_analyst'];
  i int;
BEGIN
  FOR i IN 1..5 LOOP
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_ids[i]) THEN
      INSERT INTO public.profiles (id,email,full_name,role,sport,status,updated_at)
      VALUES (v_ids[i],v_emails[i],v_names[i],v_roles[i],'football','active',now());
    ELSE
      UPDATE public.profiles SET full_name=v_names[i],role=v_roles[i],sport='football',status='active',updated_at=now()
      WHERE id = v_ids[i];
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- STEP 4: Set all 5 as verified (disable trigger first)
-- ============================================================
ALTER TABLE public.profiles DISABLE TRIGGER protect_profile_verification_fields;

UPDATE public.profiles
SET verification_status = 'verified'
WHERE id IN (
  '33000000-0000-0000-0000-000000000001',
  '33000000-0000-0000-0000-000000000002',
  '33000000-0000-0000-0000-000000000003',
  '33000000-0000-0000-0000-000000000004',
  '33000000-0000-0000-0000-000000000005'
);

ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_verification_fields;

-- ============================================================
-- STEP 5: Player profile — Marcus Thompson
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.players WHERE profile_id = '33000000-0000-0000-0000-000000000001') THEN
    INSERT INTO public.players (profile_id,display_name,position,secondary_position,age,country,nationality,gender,foot,preferred_foot,height_cm,weight_kg,current_club,bio,achievements,is_public,sport,region,availability,age_group,stats,updated_at)
    VALUES ('33000000-0000-0000-0000-000000000001','Marcus Thompson','Centre Back','Right Back',25,'England','English','male','right','right',185,80,'FC Academy London','Composed, ball-playing centre-back with Bundesliga experience. Strong in aerial duels and comfortable on the ball.','Germany U21 (11 caps). Bundesliga U23 Team of the Season 2022.',true,'football','Europe','available_now','Senior','{"total_appearances":103,"total_goals":5,"total_assists":8,"total_clean_sheets":42,"pass_accuracy":87}'::jsonb,now());
  ELSE
    UPDATE public.players SET display_name='Marcus Thompson',position='Centre Back',is_public=true,updated_at=now()
    WHERE profile_id='33000000-0000-0000-0000-000000000001';
  END IF;
END $$;

-- ============================================================
-- STEP 6: Coach profile — Carlos Mendes
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.coach_profiles WHERE user_id = '33000000-0000-0000-0000-000000000002') THEN
    INSERT INTO public.coach_profiles (user_id,full_name,sport,preferred_role,experience_years,current_club,nationality,gender,about,achievements,badges,open_to_work,is_public,updated_at)
    VALUES ('33000000-0000-0000-0000-000000000002','Carlos Mendes','football','Sporting Director',18,'Sporting Lisboa B','Spanish','male','Sporting Director with 18 years in La Liga and Portuguese football. Specialist in player recruitment and academy development.','Sporting Director for two La Liga clubs. Oversaw 40+ first-team signings.',ARRAY['UEFA Pro Licence','Executive MBA La Liga','FIFA Coaching Certificate'],true,true,now());
  ELSE
    UPDATE public.coach_profiles SET full_name='Carlos Mendes',is_public=true,updated_at=now()
    WHERE user_id='33000000-0000-0000-0000-000000000002';
  END IF;
END $$;

-- ============================================================
-- STEP 7: Agent profile — Global Talent Agency
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.agent_profiles WHERE user_id = '33000000-0000-0000-0000-000000000003') THEN
    INSERT INTO public.agent_profiles (user_id,agency_name,sport,nationality,experience_years,regions,about,achievements,is_public,verified_badge,updated_at)
    VALUES ('33000000-0000-0000-0000-000000000003','Global Talent Agency','football','Nigerian',12,ARRAY['West Africa','Europe','Middle East','UK'],'Licensed FIFA agent specialising in African and European player recruitment. Offices in Lagos, London and Dubai.','Facilitated 85+ international transfers. Clients in Premier League, Serie A and Saudi Pro League.',true,true,now());
  ELSE
    UPDATE public.agent_profiles SET agency_name='Global Talent Agency',is_public=true,updated_at=now()
    WHERE user_id='33000000-0000-0000-0000-000000000003';
  END IF;
END $$;

-- ============================================================
-- STEP 8: Club + Academy profile — Elite London FC
-- ============================================================
DO $$
BEGIN
  -- Create club
  IF NOT EXISTS (SELECT 1 FROM public.clubs WHERE id = '44000000-0000-0000-0000-000000000001') THEN
    INSERT INTO public.clubs (id,owner_id,name,country,about,sports,status,verified_badge,updated_at)
    VALUES ('44000000-0000-0000-0000-000000000001','33000000-0000-0000-0000-000000000004','Elite London FC','England','Premier youth development academy based in London. Producing top talent for the English football pyramid since 2005.',ARRAY['football'],'active',true,now());
  ELSE
    UPDATE public.clubs SET name='Elite London FC',owner_id='33000000-0000-0000-0000-000000000004',updated_at=now()
    WHERE id='44000000-0000-0000-0000-000000000001';
  END IF;

  -- Create academy profile
  IF NOT EXISTS (SELECT 1 FROM public.academy_profiles WHERE user_id = '33000000-0000-0000-0000-000000000004') THEN
    INSERT INTO public.academy_profiles (user_id,club_id,sports,country,state,year_founded,leagues,languages,updated_at)
    VALUES ('33000000-0000-0000-0000-000000000004','44000000-0000-0000-0000-000000000001',ARRAY['football'],'England','London',2005,ARRAY['English Premier League U18','FA Youth Cup','London Youth League'],ARRAY['English','French','Spanish'],now());
  ELSE
    UPDATE public.academy_profiles SET club_id='44000000-0000-0000-0000-000000000001',updated_at=now()
    WHERE user_id='33000000-0000-0000-0000-000000000004';
  END IF;
END $$;

-- ============================================================
-- STEP 9: Analyst profile — Sophie Laurent
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.coach_profiles WHERE user_id = '33000000-0000-0000-0000-000000000005') THEN
    INSERT INTO public.coach_profiles (user_id,full_name,sport,preferred_role,experience_years,current_club,nationality,gender,about,achievements,badges,open_to_work,is_public,updated_at)
    VALUES ('33000000-0000-0000-0000-000000000005','Sophie Laurent','football','Recruitment Analyst',9,'Desert Sports Management','French','female','Recruitment analyst with 9 years across MLS, Saudi Pro League and Europe. Expert in data-driven player identification.','Reports for 200+ players leading to 18 confirmed signings. Developed proprietary scouting database covering 50+ leagues.',ARRAY['Wyscout Certified','StatsBomb IQ','UEFA Analytics Diploma'],true,true,now());
  ELSE
    UPDATE public.coach_profiles SET full_name='Sophie Laurent',is_public=true,updated_at=now()
    WHERE user_id='33000000-0000-0000-0000-000000000005';
  END IF;
END $$;

-- ============================================================
-- STEP 10: Career history for Marcus Thompson
-- ============================================================
DO $$
DECLARE v_pid uuid;
BEGIN
  SELECT id INTO v_pid FROM public.players
  WHERE profile_id = '33000000-0000-0000-0000-000000000001' LIMIT 1;

  IF v_pid IS NULL THEN
    RAISE NOTICE 'Player row not found — skipping career history';
    RETURN;
  END IF;

  DELETE FROM public.player_history WHERE player_id = v_pid;

  INSERT INTO public.player_history (player_id,club_name,season_from,season_to,appearances,goals,assists,clean_sheets,notes,sort_order)
  VALUES
    (v_pid,'FC Bayern Munich B',   '2020','2022',48,3,5,18,'Won Regionalliga Bayern title 2021',1),
    (v_pid,'Borussia Dortmund II', '2022','2023',32,1,2,12,'BVB loan — developed under Terzic methodology',2),
    (v_pid,'FC Academy London',    '2023', NULL,  23,1,1,12,'Current club — first-team regular',3);
END $$;

-- ============================================================
-- STEP 11: Verify — should return 5 rows
-- ============================================================
SELECT
  p.email,
  p.full_name,
  p.role,
  p.status,
  p.verification_status
FROM public.profiles p
WHERE p.id IN (
  '33000000-0000-0000-0000-000000000001',
  '33000000-0000-0000-0000-000000000002',
  '33000000-0000-0000-0000-000000000003',
  '33000000-0000-0000-0000-000000000004',
  '33000000-0000-0000-0000-000000000005'
)
ORDER BY p.role;
