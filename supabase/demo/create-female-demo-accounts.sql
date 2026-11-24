-- =============================================================================
-- SportBridge — Female Demo Accounts (5 roles)
-- Password for all: Demo@SportBridge1!
-- Run in: https://supabase.com/dashboard/project/qnueqhlxmtkvecppygrk/sql/new
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- STEP 1: Create auth users
-- ============================================================
DO $$
BEGIN
  -- Female Player: Amara Diallo
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'amara.diallo@sportbridge.demo') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at,updated_at,is_sso_user,is_anonymous)
    VALUES ('44000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'amara.diallo@sportbridge.demo',crypt('Demo@SportBridge1!',gen_salt('bf')),now(),
      '{"full_name":"Amara Diallo","role":"player","sport":"football"}'::jsonb,now(),now(),false,false);
  END IF;

  -- Female Coach: Sarah Mitchell
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sarah.mitchell@sportbridge.demo') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at,updated_at,is_sso_user,is_anonymous)
    VALUES ('44000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'sarah.mitchell@sportbridge.demo',crypt('Demo@SportBridge1!',gen_salt('bf')),now(),
      '{"full_name":"Sarah Mitchell","role":"coach","sport":"football"}'::jsonb,now(),now(),false,false);
  END IF;

  -- Female Agent: Fatima Al-Hassan
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'fatima@starscout.demo') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at,updated_at,is_sso_user,is_anonymous)
    VALUES ('44000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'fatima@starscout.demo',crypt('Demo@SportBridge1!',gen_salt('bf')),now(),
      '{"full_name":"Fatima Al-Hassan","role":"agent","sport":"football"}'::jsonb,now(),now(),false,false);
  END IF;

  -- Female Academy: Queens FC Lagos
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@queensfclagos.demo') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at,updated_at,is_sso_user,is_anonymous)
    VALUES ('44000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'admin@queensfclagos.demo',crypt('Demo@SportBridge1!',gen_salt('bf')),now(),
      '{"full_name":"Queens FC Lagos","role":"academy","sport":"football"}'::jsonb,now(),now(),false,false);
  END IF;

  -- Female Analyst: Alicia Washington
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'alicia.washington@sportbridge.demo') THEN
    INSERT INTO auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at,updated_at,is_sso_user,is_anonymous)
    VALUES ('44000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'alicia.washington@sportbridge.demo',crypt('Demo@SportBridge1!',gen_salt('bf')),now(),
      '{"full_name":"Alicia Washington","role":"sports_analyst","sport":"football"}'::jsonb,now(),now(),false,false);
  END IF;
END $$;

-- ============================================================
-- STEP 2: Confirm emails
-- ============================================================
UPDATE auth.users
SET email_confirmed_at = coalesce(email_confirmed_at, now()), updated_at = now()
WHERE email IN (
  'amara.diallo@sportbridge.demo',
  'sarah.mitchell@sportbridge.demo',
  'fatima@starscout.demo',
  'admin@queensfclagos.demo',
  'alicia.washington@sportbridge.demo'
);

-- ============================================================
-- STEP 3: Ensure profiles
-- ============================================================
DO $$
DECLARE
  v_ids   uuid[] := ARRAY['44000000-0000-0000-0000-000000000001','44000000-0000-0000-0000-000000000002','44000000-0000-0000-0000-000000000003','44000000-0000-0000-0000-000000000004','44000000-0000-0000-0000-000000000005']::uuid[];
  v_emails text[] := ARRAY['amara.diallo@sportbridge.demo','sarah.mitchell@sportbridge.demo','fatima@starscout.demo','admin@queensfclagos.demo','alicia.washington@sportbridge.demo'];
  v_names text[] := ARRAY['Amara Diallo','Sarah Mitchell','Fatima Al-Hassan','Queens FC Lagos','Alicia Washington'];
  v_roles text[] := ARRAY['player','coach','agent','academy','sports_analyst'];
  i int;
BEGIN
  FOR i IN 1..5 LOOP
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_ids[i]) THEN
      INSERT INTO public.profiles (id,email,full_name,role,sport,status,updated_at)
      VALUES (v_ids[i],v_emails[i],v_names[i],v_roles[i],'football','active',now());
    ELSE
      UPDATE public.profiles SET full_name=v_names[i],role=v_roles[i],status='active',updated_at=now() WHERE id=v_ids[i];
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- STEP 4: Set verified (disable trigger)
-- ============================================================
ALTER TABLE public.profiles DISABLE TRIGGER protect_profile_verification_fields;
UPDATE public.profiles SET verification_status = 'verified'
WHERE id IN (
  '44000000-0000-0000-0000-000000000001',
  '44000000-0000-0000-0000-000000000002',
  '44000000-0000-0000-0000-000000000003',
  '44000000-0000-0000-0000-000000000004',
  '44000000-0000-0000-0000-000000000005'
);
ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_verification_fields;

-- ============================================================
-- STEP 5: Female Player — Amara Diallo (Striker, Senegal)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.players WHERE profile_id = '44000000-0000-0000-0000-000000000001') THEN
    INSERT INTO public.players (profile_id,display_name,position,secondary_position,age,country,nationality,gender,foot,preferred_foot,height_cm,weight_kg,current_club,bio,achievements,is_public,sport,region,availability,age_group,stats,updated_at)
    VALUES ('44000000-0000-0000-0000-000000000001','Amara Diallo','Striker','Left Wing',22,'Senegal','Senegalese','female','left','left',168,60,'Dakar Ladies FC','Pacy, clinical striker with exceptional dribbling. Known for her speed and eye for goal in West African leagues.','WAFU Women''s Championship top scorer 2023. Senegal Women''s National Team (8 caps). Golden Boot — Nigerian Women Premier League 2022.',true,'football','West Africa','available_now','Senior','{"total_appearances":67,"total_goals":48,"total_assists":12}'::jsonb,now());
  ELSE
    UPDATE public.players SET display_name='Amara Diallo',is_public=true,updated_at=now() WHERE profile_id='44000000-0000-0000-0000-000000000001';
  END IF;
END $$;

-- ============================================================
-- STEP 6: Female Coach — Sarah Mitchell (Head Coach, England)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.coach_profiles WHERE user_id = '44000000-0000-0000-0000-000000000002') THEN
    INSERT INTO public.coach_profiles (user_id,full_name,sport,preferred_role,experience_years,current_club,nationality,gender,about,achievements,badges,open_to_work,is_public,updated_at)
    VALUES ('44000000-0000-0000-0000-000000000002','Sarah Mitchell','football','Head Coach',14,'Arsenal Women B','British','female','Head Coach with 14 years developing women''s football at academy and senior level across England and the USA. Pioneer in female talent development.','Led Arsenal Women B to FA Women''s Championship runners-up 2023. Former England Women U20 Assistant Coach. Developed 12 players who progressed to WSL.',ARRAY['UEFA A Licence','FA Women''s Coaching Diploma','Advanced Coaching Certificate'],true,true,now());
  ELSE
    UPDATE public.coach_profiles SET full_name='Sarah Mitchell',is_public=true,updated_at=now() WHERE user_id='44000000-0000-0000-0000-000000000002';
  END IF;
END $$;

-- ============================================================
-- STEP 7: Female Agent — Fatima Al-Hassan (Star Scout Agency)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.agent_profiles WHERE user_id = '44000000-0000-0000-0000-000000000003') THEN
    INSERT INTO public.agent_profiles (user_id,agency_name,sport,nationality,experience_years,regions,about,achievements,is_public,verified_badge,updated_at)
    VALUES ('44000000-0000-0000-0000-000000000003','Star Scout Agency','football','Moroccan',8,ARRAY['North Africa','Middle East','Europe','West Africa'],'FIFA licensed female agent specialising in women''s football and cross-regional transfers. Based in Dubai with offices in Casablanca and London.','Facilitated 40+ transfers across NWSL, WSL, and Arab Gulf leagues. FIFA Women''s Football Agent of the Year nominee 2023.',true,true,now());
  ELSE
    UPDATE public.agent_profiles SET agency_name='Star Scout Agency',is_public=true,updated_at=now() WHERE user_id='44000000-0000-0000-0000-000000000003';
  END IF;
END $$;

-- ============================================================
-- STEP 8: Female Academy — Queens FC Lagos
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.clubs WHERE id = '55000000-0000-0000-0000-000000000001') THEN
    INSERT INTO public.clubs (id,owner_id,name,country,about,sports,status,verified_badge,updated_at)
    VALUES ('55000000-0000-0000-0000-000000000001','44000000-0000-0000-0000-000000000004','Queens FC Lagos','Nigeria','Nigeria''s premier women''s football academy. Developing the next generation of Super Falcons since 2010.',ARRAY['football'],'active',true,now());
  ELSE
    UPDATE public.clubs SET name='Queens FC Lagos',updated_at=now() WHERE id='55000000-0000-0000-0000-000000000001';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.academy_profiles WHERE user_id = '44000000-0000-0000-0000-000000000004') THEN
    INSERT INTO public.academy_profiles (user_id,club_id,sports,country,state,year_founded,leagues,languages,updated_at)
    VALUES ('44000000-0000-0000-0000-000000000004','55000000-0000-0000-0000-000000000001',ARRAY['football'],'Nigeria','Lagos',2010,ARRAY['NWFL Premiership','CAF Women''s Champions League','Lagos Women''s League'],ARRAY['English','Yoruba','French'],now());
  ELSE
    UPDATE public.academy_profiles SET club_id='55000000-0000-0000-0000-000000000001',updated_at=now() WHERE user_id='44000000-0000-0000-0000-000000000004';
  END IF;
END $$;

-- ============================================================
-- STEP 9: Female Analyst — Alicia Washington (USA)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.coach_profiles WHERE user_id = '44000000-0000-0000-0000-000000000005') THEN
    INSERT INTO public.coach_profiles (user_id,full_name,sport,preferred_role,experience_years,current_club,nationality,gender,about,achievements,badges,open_to_work,is_public,updated_at)
    VALUES ('44000000-0000-0000-0000-000000000005','Alicia Washington','football','Performance Analyst',9,'NWSL Analytics Division','American','female','Performance and recruitment analyst with 9 years across NWSL, Saudi Pro League and European women''s football. Expert in GPS tracking and video analysis.','Developed performance models for 3 NWSL clubs. Contributed to 2 championship-winning seasons. Speaker at MIT Sloan Sports Analytics Conference 2023.',ARRAY['Wyscout Certified','StatsBomb IQ','Opta Analytics Pro','Sports Science MSc'],true,true,now());
  ELSE
    UPDATE public.coach_profiles SET full_name='Alicia Washington',is_public=true,updated_at=now() WHERE user_id='44000000-0000-0000-0000-000000000005';
  END IF;
END $$;

-- ============================================================
-- STEP 10: Career history for Amara Diallo
-- ============================================================
DO $$
DECLARE v_pid uuid;
BEGIN
  SELECT id INTO v_pid FROM public.players WHERE profile_id = '44000000-0000-0000-0000-000000000001' LIMIT 1;
  IF v_pid IS NULL THEN RAISE NOTICE 'Player not found'; RETURN; END IF;
  DELETE FROM public.player_history WHERE player_id = v_pid;
  INSERT INTO public.player_history (player_id,club_name,season_from,season_to,appearances,goals,assists,clean_sheets,notes,sort_order)
  VALUES
    (v_pid,'Generation Foot Dakar', '2020','2022',28,19,6,NULL,'Top scorer in Senegal Women''s League 2021',1),
    (v_pid,'River Angels Nigeria',  '2022','2023',25,18,4,NULL,'NWFL Premiership golden boot winner',2),
    (v_pid,'Dakar Ladies FC',       '2023',NULL,  14,11,2,NULL,'Current club — WAFU tournament squad',3);
END $$;

-- ============================================================
-- STEP 11: Verify — should return 5 rows
-- ============================================================
SELECT
  p.email, p.full_name, p.role, p.status, p.verification_status
FROM public.profiles p
WHERE p.id IN (
  '44000000-0000-0000-0000-000000000001',
  '44000000-0000-0000-0000-000000000002',
  '44000000-0000-0000-0000-000000000003',
  '44000000-0000-0000-0000-000000000004',
  '44000000-0000-0000-0000-000000000005'
)
ORDER BY p.role;
