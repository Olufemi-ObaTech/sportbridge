-- =============================================================================
-- SportBridge Demo Seed v5  --  50 accounts, 25+ countries
-- Pure SQL, no PL/pgSQL blocks, correct column names verified from schema.sql
-- Run AFTER schema.sql  |  Password: Demo@SportBridge1!
-- BEFORE running this, run fix-roles.sql to patch constraints
-- =============================================================================

-- STEP 0: Patch constraints first (in case schema was not fully applied)
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles drop constraint if exists profiles_role_allowed;
alter table public.profiles add constraint profiles_role_check
  check (role in ('player','coach','sports_analyst','agent','academy','super_admin'));

alter table public.players drop constraint if exists players_availability_check;
alter table public.players drop constraint if exists players_availability_allowed;
alter table public.players add constraint players_availability_check
  check (availability in ('available_now','available_jan_2026','available_jul_2026','under_contract'));

-- STEP 1: Insert auth users
insert into auth.users (
  id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at,
  aud, role, confirmation_token, recovery_token,
  email_change_token_new, email_change
) values
('11000000-0000-0000-0000-000000000001','admin@elitelondonfc.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Elite London FC","role":"academy","sport":"football"}'::jsonb,now()-interval'90 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000002','info@academie-paris.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Academie Nationale Paris","role":"academy","sport":"football"}'::jsonb,now()-interval'89 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000003','contact@ghanafinstitute.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Ghana Football Institute","role":"academy","sport":"football"}'::jsonb,now()-interval'88 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000004','academy@sportinglisboa.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Sporting Lisboa Academy","role":"academy","sport":"football"}'::jsonb,now()-interval'87 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000005','admin@riversunited.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Rivers United Academy","role":"academy","sport":"football"}'::jsonb,now()-interval'86 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000006','scouting@global-talent.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Global Talent Agency","role":"agent","sport":"football"}'::jsonb,now()-interval'85 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000007','contact@sabridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"South American Bridge","role":"agent","sport":"football"}'::jsonb,now()-interval'84 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000008','info@desertsports.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Desert Sports Management","role":"agent","sport":"football"}'::jsonb,now()-interval'83 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000009','scout@ajaxnetwork.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Ajax Talent Network","role":"agent","sport":"football"}'::jsonb,now()-interval'82 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000010','info@wascouts.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"West Africa Scouts","role":"agent","sport":"football"}'::jsonb,now()-interval'81 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000011','carlos.mendes@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Carlos Mendes","role":"coach","sport":"football"}'::jsonb,now()-interval'80 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000012','javier.morales@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Javier Morales","role":"coach","sport":"football"}'::jsonb,now()-interval'79 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000013','marco.rossi@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Marco Rossi","role":"coach","sport":"football"}'::jsonb,now()-interval'78 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000014','emre.demir@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Emre Demir","role":"coach","sport":"football"}'::jsonb,now()-interval'77 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000015','sarah.mitchell@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Sarah Mitchell","role":"coach","sport":"football"}'::jsonb,now()-interval'76 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000016','nemanja.petrovic@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Nemanja Petrovic","role":"coach","sport":"football"}'::jsonb,now()-interval'75 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000017','sophie.laurent@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Sophie Laurent","role":"sports_analyst","sport":"football"}'::jsonb,now()-interval'74 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000018','james.clarke@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"James Clarke","role":"sports_analyst","sport":"football"}'::jsonb,now()-interval'73 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000019','hiroshi.nakamura@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Hiroshi Nakamura","role":"sports_analyst","sport":"football"}'::jsonb,now()-interval'72 days',now(),'authenticated','authenticated','','','',''),
('11000000-0000-0000-0000-000000000020','alicia.washington@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Alicia Washington","role":"sports_analyst","sport":"football"}'::jsonb,now()-interval'71 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000001','marcus.thompson@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Marcus Thompson","role":"player","sport":"football"}'::jsonb,now()-interval'70 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000002','gabriel.santos@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Gabriel Santos","role":"player","sport":"football"}'::jsonb,now()-interval'69 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000003','antoine.dubois@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Antoine Dubois","role":"player","sport":"football"}'::jsonb,now()-interval'68 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000004','lukas.muller@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Lukas Muller","role":"player","sport":"football"}'::jsonb,now()-interval'67 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000005','kwame.asante@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Kwame Asante","role":"player","sport":"football"}'::jsonb,now()-interval'66 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000006','yassine.benali@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Yassine Benali","role":"player","sport":"football"}'::jsonb,now()-interval'65 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000007','alejandro.rios@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Alejandro Rios","role":"player","sport":"football"}'::jsonb,now()-interval'64 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000008','moussa.diallo@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Moussa Diallo","role":"player","sport":"football"}'::jsonb,now()-interval'63 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000009','kenji.tanaka@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Kenji Tanaka","role":"player","sport":"football"}'::jsonb,now()-interval'62 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000010','jiho.park@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Ji-Ho Park","role":"player","sport":"football"}'::jsonb,now()-interval'61 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000011','diego.hernandez@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Diego Hernandez","role":"player","sport":"football"}'::jsonb,now()-interval'60 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000012','tyler.jackson@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Tyler Jackson","role":"player","sport":"football"}'::jsonb,now()-interval'59 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000013','femi.adeyemi@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Femi Adeyemi","role":"player","sport":"football"}'::jsonb,now()-interval'58 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000014','ivan.petrenko@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Ivan Petrenko","role":"player","sport":"football"}'::jsonb,now()-interval'57 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000015','nabil.amrani@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Nabil Amrani","role":"player","sport":"football"}'::jsonb,now()-interval'56 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000016','edson.reyes@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Edson Reyes","role":"player","sport":"football"}'::jsonb,now()-interval'55 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000017','aleksander.jovic@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Aleksander Jovic","role":"player","sport":"football"}'::jsonb,now()-interval'54 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000018','omar.elshenawy@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Omar El-Shenawy","role":"player","sport":"football"}'::jsonb,now()-interval'53 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000019','koffi.kouassi@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Koffi Kouassi","role":"player","sport":"football"}'::jsonb,now()-interval'52 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000020','lars.odegaard@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Lars Odegaard","role":"player","sport":"football"}'::jsonb,now()-interval'51 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000021','joao.costa@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Joao Costa","role":"player","sport":"football"}'::jsonb,now()-interval'50 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000022','amir.shafiei@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Amir Shafiei","role":"player","sport":"football"}'::jsonb,now()-interval'49 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000023','bernard.owusu@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Bernard Owusu","role":"player","sport":"football"}'::jsonb,now()-interval'48 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000024','roberto.nunez@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Roberto Nunez","role":"player","sport":"football"}'::jsonb,now()-interval'47 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000025','takehiro.sato@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Takehiro Sato","role":"player","sport":"football"}'::jsonb,now()-interval'46 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000026','chukwuemeka.okafor@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Chukwuemeka Okafor","role":"player","sport":"football"}'::jsonb,now()-interval'45 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000027','vladislav.koval@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Vladislav Koval","role":"player","sport":"football"}'::jsonb,now()-interval'44 days',now(),'authenticated','authenticated','','','',''),
('22000000-0000-0000-0000-000000000028','christos.papadopoulos@sportbridge.demo',extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),now(),'{"full_name":"Christos Papadopoulos","role":"player","sport":"football"}'::jsonb,now()-interval'43 days',now(),'authenticated','authenticated','','','','')
on conflict (id) do update
  set encrypted_password=extensions.crypt('Demo@SportBridge1!',extensions.gen_salt('bf',10)),
      email_confirmed_at=coalesce(auth.users.email_confirmed_at,now()),
      raw_user_meta_data=excluded.raw_user_meta_data,
      updated_at=now();

-- STEP 2: Verify profiles
update public.profiles set verification_status='verified',status='active',sport='football'
where id in ('11000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000002','11000000-0000-0000-0000-000000000003','11000000-0000-0000-0000-000000000004','11000000-0000-0000-0000-000000000005','11000000-0000-0000-0000-000000000006','11000000-0000-0000-0000-000000000007','11000000-0000-0000-0000-000000000008','11000000-0000-0000-0000-000000000009','11000000-0000-0000-0000-000000000010','11000000-0000-0000-0000-000000000011','11000000-0000-0000-0000-000000000012','11000000-0000-0000-0000-000000000013','11000000-0000-0000-0000-000000000014','11000000-0000-0000-0000-000000000015','11000000-0000-0000-0000-000000000016','11000000-0000-0000-0000-000000000017','11000000-0000-0000-0000-000000000018','11000000-0000-0000-0000-000000000019','11000000-0000-0000-0000-000000000020','22000000-0000-0000-0000-000000000001','22000000-0000-0000-0000-000000000002','22000000-0000-0000-0000-000000000003','22000000-0000-0000-0000-000000000004','22000000-0000-0000-0000-000000000005','22000000-0000-0000-0000-000000000006','22000000-0000-0000-0000-000000000007','22000000-0000-0000-0000-000000000008','22000000-0000-0000-0000-000000000009','22000000-0000-0000-0000-000000000010','22000000-0000-0000-0000-000000000011','22000000-0000-0000-0000-000000000012','22000000-0000-0000-0000-000000000013','22000000-0000-0000-0000-000000000014','22000000-0000-0000-0000-000000000015','22000000-0000-0000-0000-000000000016','22000000-0000-0000-0000-000000000017','22000000-0000-0000-0000-000000000018','22000000-0000-0000-0000-000000000019','22000000-0000-0000-0000-000000000020','22000000-0000-0000-0000-000000000021','22000000-0000-0000-0000-000000000022','22000000-0000-0000-0000-000000000023','22000000-0000-0000-0000-000000000024','22000000-0000-0000-0000-000000000025','22000000-0000-0000-0000-000000000026','22000000-0000-0000-0000-000000000027','22000000-0000-0000-0000-000000000028');

-- STEP 3: Agent profiles
insert into public.agent_profiles (user_id,agency_name,sport,nationality,experience_years,regions,about,achievements,is_public,verified_badge,updated_at) values
('11000000-0000-0000-0000-000000000006','Global Talent Agency','football','Germany',12,array['Europe','West Africa','Middle East','South America'],'Munich-based global scouting agency. Bundesliga, Premier League and Ligue 1 specialist.','28 European transfers in 3 years.',true,true,now()),
('11000000-0000-0000-0000-000000000007','South American Bridge','football','Argentina',8,array['South America','Spain','Portugal','Italy'],'Buenos Aires agency bridging South American talent to Europe.','14 transfers from Argentine Primera Division to La Liga and Serie A.',true,true,now()),
('11000000-0000-0000-0000-000000000008','Desert Sports Management','football','UAE',6,array['Middle East','North Africa','Europe','Asia'],'Dubai-based agency. Gulf-to-Europe and Africa-to-Gulf specialist.','Placed 19 players in Saudi Pro League and UAE Pro League 2020-2024.',true,true,now()),
('11000000-0000-0000-0000-000000000009','Ajax Talent Network','football','Netherlands',15,array['Europe','South America','West Africa'],'Amsterdam scouting network with Ajax youth philosophy roots.','35 players placed in Eredivisie and Bundesliga over 15 years.',true,true,now()),
('11000000-0000-0000-0000-000000000010','West Africa Scouts','football','Ivory Coast',10,array['West Africa','Europe','North Africa'],'Widest scouting network in West Africa. Ivory Coast, Senegal, Mali, Ghana, Guinea, Cameroon.','22 West African players sent to European academies since 2018.',true,true,now())
on conflict (user_id) do update
  set agency_name=excluded.agency_name,nationality=excluded.nationality,
      experience_years=excluded.experience_years,regions=excluded.regions,
      about=excluded.about,achievements=excluded.achievements,
      is_public=excluded.is_public,verified_badge=excluded.verified_badge,updated_at=now();

-- STEP 4: Coach / Manager / Analyst profiles
insert into public.coach_profiles (user_id,full_name,sport,preferred_role,experience_years,current_club,nationality,gender,about,achievements,badges,open_to_work,linkedin,is_public,updated_at) values
('11000000-0000-0000-0000-000000000011','Carlos Mendes','football','Head Coach',15,'Academie Nationale Paris','Brazil','male','Head coach 15 years in Brazil, Portugal and France. Attacking football and youth-to-senior specialist.','Brazilian Serie B winner 2019. UEFA A Licence. Two players to full international level.',array['UEFA A Licence','CBF Pro Licence'],false,'https://linkedin.com/in/carlosmendes',true,now()),
('11000000-0000-0000-0000-000000000012','Javier Morales','football','Sporting Director',18,'Sporting Lisboa Academy','Spain','male','Sporting Director 18 years in La Liga and Portuguese football.','Sporting Director two La Liga clubs. Oversaw 40+ first-team signings.',array['UEFA Pro Licence','Executive MBA La Liga'],true,'https://linkedin.com/in/javiermorales',true,now()),
('11000000-0000-0000-0000-000000000013','Marco Rossi','football','Assistant Head Coach',12,'Elite London FC','Italy','male','Italian assistant coach 12 years in Serie A academies and English Championship.','Two Championship promotion campaigns. UEFA A Licence.',array['UEFA A Licence','Italian FA Diploma'],true,'https://linkedin.com/in/marcorossi',true,now()),
('11000000-0000-0000-0000-000000000014','Emre Demir','football','First Team Manager',10,'Rivers United Academy','Turkey','male','Turkish manager experienced in Super Lig and African football.','Managed two Super Lig clubs. Improved Rivers United league position by 8 places.',array['UEFA A Licence','Turkish FA Pro Licence'],true,'https://linkedin.com/in/emredemir',true,now()),
('11000000-0000-0000-0000-000000000015','Sarah Mitchell','football','Strength & Conditioning Coach',8,'Elite London FC','Australia','female','High-performance conditioning coach 8 years in A-League and English EFL.','Reduced soft-tissue injuries by 40% at two EFL clubs. NSCA-CSCS certified.',array['NSCA-CSCS','UEFA Fitness Certificate'],true,'https://linkedin.com/in/sarahmitchell',true,now()),
('11000000-0000-0000-0000-000000000016','Nemanja Petrovic','football','Head Coach',14,'Ghana Football Institute','Serbia','male','Serbian head coach 14 years in Eastern Europe and Africa. 4-3-3 attacking system.','Three league titles in Serbia and North Macedonia.',array['UEFA Pro Licence','Serbian FA Pro Licence'],false,'https://linkedin.com/in/nemanjapertovic',true,now()),
('11000000-0000-0000-0000-000000000017','Sophie Laurent','football','Performance Analyst',7,'Academie Nationale Paris','France','female','Performance analyst 7 years in elite football. xG modelling and video analysis.','UEFA Research Grant 2022. France U23 women qualifying 2023.',array['UEFA Analysis Certificate','Wyscout Certified','StatsBomb IQ'],true,'https://linkedin.com/in/sophielaurent',true,now()),
('11000000-0000-0000-0000-000000000018','James Clarke','football','Video Analyst',5,'Elite London FC','England','male','Video analyst specialising in opponent preparation. Previously at two Championship clubs.','80+ opponent reports. Built tagging system cutting prep time 35%.',array['Hudl Sportscode Certified','Wyscout Certified'],true,'https://linkedin.com/in/jamesclarke',true,now()),
('11000000-0000-0000-0000-000000000019','Hiroshi Nakamura','football','Data Analyst',6,'Kashima Antlers','Japan','male','Data analyst J-League. xG models, press intensity and player valuation in Python and R.','Built in-house xG model at Kashima Antlers. AFC Analytics Summit 2023.',array['StatsBomb IQ','Python & R Analytics'],true,'https://linkedin.com/in/hiroshinakamura',true,now()),
('11000000-0000-0000-0000-000000000020','Alicia Washington','football','Recruitment Analyst',9,'Desert Sports Management','USA','female','Recruitment analyst 9 years across MLS, Saudi Pro League and Europe.','Reports for 200+ players leading to 18 confirmed signings.',array['Wyscout Certified','StatsBomb IQ'],true,'https://linkedin.com/in/aliciawashington',true,now())
on conflict (user_id) do update
  set full_name=excluded.full_name,preferred_role=excluded.preferred_role,
      experience_years=excluded.experience_years,current_club=excluded.current_club,
      nationality=excluded.nationality,about=excluded.about,achievements=excluded.achievements,
      badges=excluded.badges,open_to_work=excluded.open_to_work,
      is_public=excluded.is_public,updated_at=now();

-- STEP 5: Clubs
update public.clubs set name='Elite London FC',country='England',about='Category 2 academy South London. Alumni at Championship and League One clubs.',website='https://elitelondonfc.demo',verified_badge=true,status='active',updated_at=now() where owner_id='11000000-0000-0000-0000-000000000001';
update public.clubs set name='Academie Nationale Paris',country='France',about='Professional academy partnered with Ligue 1 clubs. Direct pathways for prospects aged 14-21.',website='https://academie-paris.demo',verified_badge=true,status='active',updated_at=now() where owner_id='11000000-0000-0000-0000-000000000002';
update public.clubs set name='Ghana Football Institute',country='Ghana',about='West Africa most respected programme producing players for Ghana PL and African leagues since 2005.',website='https://ghanafinstitute.demo',verified_badge=true,status='active',updated_at=now() where owner_id='11000000-0000-0000-0000-000000000003';
update public.clubs set name='Sporting Lisboa Academy',country='Portugal',about='Prestigious Lisbon academy with world-class technical development since 1988.',website='https://sportinglisboa.demo',verified_badge=true,status='active',updated_at=now() where owner_id='11000000-0000-0000-0000-000000000004';
update public.clubs set name='Rivers United Academy',country='Nigeria',about='Port Harcourt-based NPFL academy with 25 years of player development.',website='https://riversunited.demo',verified_badge=true,status='active',updated_at=now() where owner_id='11000000-0000-0000-0000-000000000005';

-- STEP 6: Academy profiles
update public.academy_profiles set sports=array['football'],country='England',state='London',address='Crystal Palace Training Ground SE25',phone='+442034567890',year_founded=2003,updated_at=now() where user_id='11000000-0000-0000-0000-000000000001';
update public.academy_profiles set sports=array['football'],country='France',state='Ile-de-France',address='12 Rue du Stade, Issy-les-Moulineaux',phone='+33142345678',year_founded=1998,updated_at=now() where user_id='11000000-0000-0000-0000-000000000002';
update public.academy_profiles set sports=array['football'],country='Ghana',state='Greater Accra',address='El Wak Sports Stadium, Accra',phone='+233302123456',year_founded=2005,updated_at=now() where user_id='11000000-0000-0000-0000-000000000003';
update public.academy_profiles set sports=array['football'],country='Portugal',state='Lisbon',address='Academia de Alcochete, Setubal',phone='+351217902001',year_founded=1988,updated_at=now() where user_id='11000000-0000-0000-0000-000000000004';
update public.academy_profiles set sports=array['football'],country='Nigeria',state='Rivers',address='Adokiye Amiesimaka Stadium, Port Harcourt',phone='+2348033456789',year_founded=1999,updated_at=now() where user_id='11000000-0000-0000-0000-000000000005';

-- STEP 7: Players (28 players, correct column names, no PL/pgSQL)
update public.players set
  display_name='Marcus Thompson',position='Striker',secondary_position='Centre Forward',
  age=21,nationality='English',country='England',region='London',
  gender='male',preferred_foot='right',foot='right',
  height_cm=183,weight_kg=79,current_club='Elite London FC',
  is_public=true,sport='football',status='active',
  age_group='U23',availability='available_now',
  bio='Clinical striker with pace and eye for goal. England U19 cap holder.',achievements='England U19 (14 caps, 9 goals). Elite London FC top scorer 2022-23 (21 goals).',
  stats='{"total_appearances":78,"total_goals":41,"total_assists":14,"minutes_played":6210}'::jsonb,
  academy_id=(select id from public.academy_profiles where user_id='11000000-0000-0000-0000-000000000001' limit 1)
where profile_id='22000000-0000-0000-0000-000000000001';

update public.players set
  display_name='Gabriel Santos',position='Central Midfielder',secondary_position='Attacking Midfielder',
  age=23,nationality='Brazilian',country='Brazil',region='Sao Paulo',
  gender='male',preferred_foot='right',foot='right',
  height_cm=178,weight_kg=73,current_club='Academie Nationale Paris',
  is_public=true,sport='football',status='active',
  age_group='Senior',availability='available_now',
  bio='Dynamic central midfielder with exceptional vision. Trained at Corinthians.',achievements='Corinthians youth graduate. Brazil U20 squad 2022. Academie Paris Player of the Year 2023.',
  stats='{"total_appearances":92,"total_goals":18,"total_assists":33,"minutes_played":7680}'::jsonb,
  academy_id=(select id from public.academy_profiles where user_id='11000000-0000-0000-0000-000000000002' limit 1)
where profile_id='22000000-0000-0000-0000-000000000002';

update public.players set
  display_name='Antoine Dubois',position='Goalkeeper',secondary_position=null,
  age=24,nationality='French',country='France',region='Paris',
  gender='male',preferred_foot='right',foot='right',
  height_cm=192,weight_kg=86,current_club='Academie Nationale Paris',
  is_public=true,sport='football',status='active',
  age_group='Senior',availability='available_now',
  bio='Commanding goalkeeper with exceptional shot-stopping and distribution.',achievements='France U21 (8 caps, 5 clean sheets). Ligue 2 Golden Glove nominee 2023.',
  stats='{"total_appearances":88,"total_goals":0,"total_assists":0,"minutes_played":7920,"clean_sheets":29}'::jsonb,
  academy_id=(select id from public.academy_profiles where user_id='11000000-0000-0000-0000-000000000002' limit 1)
where profile_id='22000000-0000-0000-0000-000000000003';

update public.players set
  display_name='Lukas Muller',position='Centre-Back',secondary_position='Right-Back',
  age=25,nationality='German',country='Germany',region='Bayern',
  gender='male',preferred_foot='right',foot='right',
  height_cm=189,weight_kg=84,current_club='FC Bayern Munich B',
  is_public=true,sport='football',status='active',
  age_group='Senior',availability='available_now',
  bio='Composed Bundesliga-trained ball-playing centre-back.',achievements='Germany U21 (11 caps). Bundesliga U23 Team of the Season 2022.',
  stats='{"total_appearances":103,"total_goals":5,"total_assists":8,"minutes_played":8820}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000004';

update public.players set
  display_name='Kwame Asante',position='Right Winger',secondary_position='Left Winger',
  age=20,nationality='Ghanaian',country='Ghana',region='Accra',
  gender='male',preferred_foot='left',foot='left',
  height_cm=174,weight_kg=69,current_club='Ghana Football Institute',
  is_public=true,sport='football',status='active',
  age_group='U23',availability='available_now',
  bio='Explosive creative winger. Ghana Black Satellites squad member.',achievements='Ghana U20 Black Satellites (12 caps, 5 goals). Top dribbler Ghana PL U20 2023.',
  stats='{"total_appearances":59,"total_goals":22,"total_assists":27,"minutes_played":4860}'::jsonb,
  academy_id=(select id from public.academy_profiles where user_id='11000000-0000-0000-0000-000000000003' limit 1)
where profile_id='22000000-0000-0000-0000-000000000005';

update public.players set
  display_name='Yassine Benali',position='Defensive Midfielder',secondary_position='Central Midfielder',
  age=22,nationality='Moroccan',country='Morocco',region='Casablanca',
  gender='male',preferred_foot='right',foot='right',
  height_cm=181,weight_kg=77,current_club='Raja Casablanca Youth',
  is_public=true,sport='football',status='active',
  age_group='U23',availability='available_now',
  bio='Tenacious defensive midfielder. Morocco 2022 World Cup inspiration.',achievements='Morocco U23 (6 caps). Botola Pro U21 Team of the Season 2023.',
  stats='{"total_appearances":71,"total_goals":7,"total_assists":15,"minutes_played":5940}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000006';

update public.players set
  display_name='Alejandro Rios',position='Striker',secondary_position='Second Striker',
  age=24,nationality='Argentine',country='Argentina',region='Buenos Aires',
  gender='male',preferred_foot='left',foot='left',
  height_cm=180,weight_kg=77,current_club='River Plate Reserve',
  is_public=true,sport='football',status='active',
  age_group='Senior',availability='available_now',
  bio='Argentine striker from River Plate youth system. Natural goal scorer.',achievements='River Plate Reserve top scorer 2022-23 (16 goals). Argentina Future Stars 2023.',
  stats='{"total_appearances":84,"total_goals":47,"total_assists":18,"minutes_played":7020}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000007';

update public.players set
  display_name='Moussa Diallo',position='Left-Back',secondary_position='Centre-Back',
  age=23,nationality='Senegalese',country='Senegal',region='Dakar',
  gender='male',preferred_foot='left',foot='left',
  height_cm=183,weight_kg=80,current_club='ASC Jaraaf Dakar',
  is_public=true,sport='football',status='active',
  age_group='Senior',availability='available_now',
  bio='Athletic Senegalese left-back with AFCON experience.',achievements='Senegal senior squad (2 caps). CAF Champions League group stage 2023.',
  stats='{"total_appearances":96,"total_goals":9,"total_assists":21,"minutes_played":8280}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000008';

update public.players set
  display_name='Kenji Tanaka',position='Central Midfielder',secondary_position='Attacking Midfielder',
  age=22,nationality='Japanese',country='Japan',region='Tokyo',
  gender='male',preferred_foot='right',foot='right',
  height_cm=175,weight_kg=70,current_club='Kashima Antlers Youth',
  is_public=true,sport='football',status='active',
  age_group='U23',availability='available_now',
  bio='Technically excellent Japanese midfielder. Exceptional work rate.',achievements='Japan U22 (9 caps). AFC U-23 Asian Cup squad 2024.',
  stats='{"total_appearances":74,"total_goals":13,"total_assists":25,"minutes_played":6120}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000009';

update public.players set
  display_name='Ji-Ho Park',position='Right Winger',secondary_position='Attacking Midfielder',
  age=21,nationality='South Korean',country='South Korea',region='Seoul',
  gender='male',preferred_foot='left',foot='left',
  height_cm=171,weight_kg=67,current_club='FC Seoul Academy',
  is_public=true,sport='football',status='active',
  age_group='U23',availability='available_now',
  bio='Quick Korean winger with lightning pace. Targeting European move.',achievements='South Korea U20 (7 caps). K-League 2 debut at 18.',
  stats='{"total_appearances":62,"total_goals":17,"total_assists":22,"minutes_played":4950}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000010';

update public.players set
  display_name='Diego Hernandez',position='Central Midfielder',secondary_position='Defensive Midfielder',
  age=25,nationality='Spanish',country='Spain',region='Catalonia',
  gender='male',preferred_foot='right',foot='right',
  height_cm=179,weight_kg=74,current_club='FC Barcelona B',
  is_public=true,sport='football',status='active',
  age_group='Senior',availability='available_now',
  bio='La Masia-trained midfielder seeking first-team opportunity.',achievements='La Masia graduate. Spain U21 (5 caps). Segunda Division regular 2023-24.',
  stats='{"total_appearances":107,"total_goals":11,"total_assists":38,"minutes_played":9120}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000011';

update public.players set
  display_name='Tyler Jackson',position='Striker',secondary_position='Left Winger',
  age=23,nationality='American',country='USA',region='California',
  gender='male',preferred_foot='right',foot='right',
  height_cm=185,weight_kg=81,current_club='LA Galaxy Academy',
  is_public=true,sport='football',status='active',
  age_group='Senior',availability='available_now',
  bio='American striker with European ambitions. MLS Next Pro proven.',achievements='USA U23 (8 caps, 4 goals). MLS Next Pro Golden Boot nominee 2023.',
  stats='{"total_appearances":85,"total_goals":38,"total_assists":16,"minutes_played":7050}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000012';

update public.players set
  display_name='Femi Adeyemi',position='Attacking Midfielder',secondary_position='Right Winger',
  age=21,nationality='Nigerian',country='Nigeria',region='Lagos',
  gender='male',preferred_foot='right',foot='right',
  height_cm=176,weight_kg=71,current_club='Rivers United Academy',
  is_public=true,sport='football',status='active',
  age_group='U23',availability='available_now',
  bio='Creative Nigerian attacking midfielder. NPFL standout seeking European move.',achievements='Nigeria U20 Flying Eagles (8 caps, 3 goals). NPFL Young Player Award 2023.',
  stats='{"total_appearances":63,"total_goals":19,"total_assists":24,"minutes_played":5130}'::jsonb,
  academy_id=(select id from public.academy_profiles where user_id='11000000-0000-0000-0000-000000000005' limit 1)
where profile_id='22000000-0000-0000-0000-000000000013';

update public.players set
  display_name='Ivan Petrenko',position='Centre-Back',secondary_position='Defensive Midfielder',
  age=24,nationality='Ukrainian',country='Ukraine',region='Kyiv',
  gender='male',preferred_foot='right',foot='right',
  height_cm=190,weight_kg=85,current_club='Shakhtar Donetsk B',
  is_public=true,sport='football',status='active',
  age_group='Senior',availability='available_now',
  bio='Dominant Ukrainian centre-back from Shakhtar academy.',achievements='Ukraine U23 (7 caps). UPL debut at 20.',
  stats='{"total_appearances":89,"total_goals":6,"total_assists":4,"minutes_played":7650}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000014';

update public.players set
  display_name='Nabil Amrani',position='Left Winger',secondary_position='Attacking Midfielder',
  age=22,nationality='Algerian',country='Algeria',region='Algiers',
  gender='male',preferred_foot='right',foot='right',
  height_cm=173,weight_kg=69,current_club='USM Alger',
  is_public=true,sport='football',status='active',
  age_group='U23',availability='available_now',
  bio='Tricky Algerian winger. Electric pace and direct play.',achievements='Algeria U23 (5 caps). Ligue Pro 1 top dribbler 2023.',
  stats='{"total_appearances":66,"total_goals":14,"total_assists":20,"minutes_played":5400}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000015';

update public.players set
  display_name='Edson Reyes',position='Defensive Midfielder',secondary_position='Central Midfielder',
  age=23,nationality='Mexican',country='Mexico',region='Mexico City',
  gender='male',preferred_foot='right',foot='right',
  height_cm=180,weight_kg=76,current_club='Club America B',
  is_public=true,sport='football',status='active',
  age_group='Senior',availability='available_now',
  bio='Box-to-box Mexican midfielder from Club America academy.',achievements='Mexico U22 (6 caps). Liga MX debut 2022.',
  stats='{"total_appearances":77,"total_goals":5,"total_assists":18,"minutes_played":6480}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000016';

update public.players set
  display_name='Aleksander Jovic',position='Striker',secondary_position='Second Striker',
  age=22,nationality='Serbian',country='Serbia',region='Belgrade',
  gender='male',preferred_foot='right',foot='right',
  height_cm=184,weight_kg=80,current_club='FK Partizan B',
  is_public=true,sport='football',status='active',
  age_group='U23',availability='available_now',
  bio='Physical Serbian striker from Partizan Belgrade youth.',achievements='Serbia U21 (6 caps, 4 goals). Partizan U23 top scorer 2022-23.',
  stats='{"total_appearances":72,"total_goals":35,"total_assists":11,"minutes_played":5940}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000017';

update public.players set
  display_name='Omar El-Shenawy',position='Right Winger',secondary_position='Left Winger',
  age=21,nationality='Egyptian',country='Egypt',region='Cairo',
  gender='male',preferred_foot='left',foot='left',
  height_cm=172,weight_kg=68,current_club='Zamalek SC Youth',
  is_public=true,sport='football',status='active',
  age_group='U23',availability='available_now',
  bio='Exciting Egyptian winger with blistering pace.',achievements='Egypt U20 (9 caps, 4 goals). Egyptian Premier League debut at 19.',
  stats='{"total_appearances":58,"total_goals":18,"total_assists":19,"minutes_played":4680}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000018';

update public.players set
  display_name='Koffi Kouassi',position='Striker',secondary_position='Right Winger',
  age=23,nationality='Ivorian',country='Ivory Coast',region='Abidjan',
  gender='male',preferred_foot='right',foot='right',
  height_cm=186,weight_kg=81,current_club='ASEC Mimosas',
  is_public=true,sport='football',status='active',
  age_group='Senior',availability='available_now',
  bio='Powerful Ivorian striker from ASEC Mimosas. Sought by Ligue 1 clubs.',achievements='Ivory Coast U23 (7 caps, 5 goals). ASEC Mimosas top scorer 2022-23.',
  stats='{"total_appearances":80,"total_goals":39,"total_assists":13,"minutes_played":6600}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000019';

update public.players set
  display_name='Lars Odegaard',position='Striker',secondary_position='Second Striker',
  age=22,nationality='Norwegian',country='Norway',region='Oslo',
  gender='male',preferred_foot='right',foot='right',
  height_cm=188,weight_kg=83,current_club='Rosenborg BK B',
  is_public=true,sport='football',status='active',
  age_group='U23',availability='available_now',
  bio='Tall physical Norwegian striker from Rosenborg academy.',achievements='Norway U21 (5 caps, 3 goals). Rosenborg U23 Player of the Year 2023.',
  stats='{"total_appearances":61,"total_goals":28,"total_assists":10,"minutes_played":5040}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000020';

update public.players set
  display_name='Joao Costa',position='Left-Back',secondary_position='Left Winger',
  age=22,nationality='Portuguese',country='Portugal',region='Lisbon',
  gender='male',preferred_foot='left',foot='left',
  height_cm=179,weight_kg=74,current_club='Sporting Lisboa Academy',
  is_public=true,sport='football',status='active',
  age_group='U23',availability='available_now',
  bio='Technically gifted Portuguese left-back from Sporting Lisbon.',achievements='Portugal U21 (4 caps). Sporting Lisboa Young Player of the Year 2023.',
  stats='{"total_appearances":71,"total_goals":4,"total_assists":17,"minutes_played":5940}'::jsonb,
  academy_id=(select id from public.academy_profiles where user_id='11000000-0000-0000-0000-000000000004' limit 1)
where profile_id='22000000-0000-0000-0000-000000000021';

update public.players set
  display_name='Amir Shafiei',position='Goalkeeper',secondary_position=null,
  age=24,nationality='Iranian',country='Iran',region='Tehran',
  gender='male',preferred_foot='right',foot='right',
  height_cm=191,weight_kg=84,current_club='Persepolis FC B',
  is_public=true,sport='football',status='active',
  age_group='Senior',availability='available_now',
  bio='Shot-stopper from Persepolis FC, one of Asia most supported clubs.',achievements='Iran U23 (6 caps, 4 clean sheets). Iranian Pro League debut at 21.',
  stats='{"total_appearances":74,"total_goals":0,"total_assists":0,"minutes_played":6660,"clean_sheets":24}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000022';

update public.players set
  display_name='Bernard Owusu',position='Central Midfielder',secondary_position='Defensive Midfielder',
  age=22,nationality='Ghanaian',country='Ghana',region='Kumasi',
  gender='male',preferred_foot='right',foot='right',
  height_cm=178,weight_kg=74,current_club='Asante Kotoko SC',
  is_public=true,sport='football',status='active',
  age_group='U23',availability='available_now',
  bio='Technically excellent Ghanaian midfielder targeting European move.',achievements='Ghana U23 Black Meteors (8 caps). Ghana PL Player of the Month Oct 2023.',
  stats='{"total_appearances":69,"total_goals":12,"total_assists":22,"minutes_played":5580}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000023';

update public.players set
  display_name='Roberto Nunez',position='Second Striker',secondary_position='Attacking Midfielder',
  age=22,nationality='Colombian',country='Colombia',region='Medellin',
  gender='male',preferred_foot='right',foot='right',
  height_cm=177,weight_kg=72,current_club='Atletico Nacional B',
  is_public=true,sport='football',status='active',
  age_group='U23',availability='available_now',
  bio='Tricky Colombian striker from Atletico Nacional youth.',achievements='Colombia U20 (6 caps, 3 goals). Atletico Nacional B top scorer 2023.',
  stats='{"total_appearances":67,"total_goals":24,"total_assists":19,"minutes_played":5490}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000024';

update public.players set
  display_name='Takehiro Sato',position='Right-Back',secondary_position='Right Winger',
  age=21,nationality='Japanese',country='Japan',region='Osaka',
  gender='male',preferred_foot='right',foot='right',
  height_cm=174,weight_kg=70,current_club='Gamba Osaka Youth',
  is_public=true,sport='football',status='active',
  age_group='U23',availability='available_now',
  bio='Technically polished Japanese right-back with pace and attacking instinct.',achievements='Japan U21 (5 caps). AFC Champions League squad player 2023.',
  stats='{"total_appearances":58,"total_goals":3,"total_assists":14,"minutes_played":4770}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000025';

update public.players set
  display_name='Chukwuemeka Okafor',position='Striker',secondary_position='Centre Forward',
  age=22,nationality='Nigerian',country='Nigeria',region='Lagos',
  gender='male',preferred_foot='right',foot='right',
  height_cm=181,weight_kg=76,current_club='Rivers United Academy',
  is_public=true,sport='football',status='active',
  age_group='U23',availability='available_now',
  bio='Explosive Nigerian striker with exceptional finishing.',achievements='NPFL U20 top scorer 2023 (18 goals). Nigeria U20 Flying Eagles squad.',
  stats='{"total_appearances":67,"total_goals":34,"total_assists":12,"minutes_played":5490}'::jsonb,
  academy_id=(select id from public.academy_profiles where user_id='11000000-0000-0000-0000-000000000005' limit 1)
where profile_id='22000000-0000-0000-0000-000000000026';

update public.players set
  display_name='Vladislav Koval',position='Centre-Back',secondary_position='Left-Back',
  age=23,nationality='Polish',country='Poland',region='Warsaw',
  gender='male',preferred_foot='left',foot='left',
  height_cm=187,weight_kg=82,current_club='Legia Warsaw B',
  is_public=true,sport='football',status='active',
  age_group='Senior',availability='available_now',
  bio='Left-footed Polish centre-back from Legia Warsaw academy.',achievements='Poland U21 (5 caps). Ekstraklasa debut at 21.',
  stats='{"total_appearances":82,"total_goals":4,"total_assists":7,"minutes_played":6840}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000027';

update public.players set
  display_name='Christos Papadopoulos',position='Defensive Midfielder',secondary_position='Centre-Back',
  age=24,nationality='Greek',country='Greece',region='Athens',
  gender='male',preferred_foot='right',foot='right',
  height_cm=183,weight_kg=79,current_club='Olympiacos FC B',
  is_public=true,sport='football',status='active',
  age_group='Senior',availability='available_now',
  bio='Disciplined Greek defensive midfielder. Olympiacos academy product.',achievements='Greece U21 (7 caps). Olympiacos Academy Player of the Year 2022-23.',
  stats='{"total_appearances":88,"total_goals":5,"total_assists":12,"minutes_played":7260}'::jsonb
where profile_id='22000000-0000-0000-0000-000000000028';

-- STEP 8: Jobs (using correct column names: player_position, staff_role, salary_min, salary_max, application_deadline)
insert into public.jobs (title,description,sport,job_type,player_position,staff_role,age_group,region,salary_min,salary_max,currency,application_deadline,status,posted_by,created_at,updated_at) values
('Seeking Right Winger - England U23','Elite London FC seeking experienced right winger for first team squad.','football','player_needed','Right Winger',null,'U23','England',800,1200,'GBP',(now()+interval'60 days')::date,'open','11000000-0000-0000-0000-000000000001',now()-interval'3 days',now()),
('Head Coach Vacancy - Paris Academy','Academie Paris seeking Head Coach with UEFA A minimum. U17-U23 experience. Accommodation provided.','football','staff_needed',null,'Head Coach','U23','France',4000,6000,'EUR',(now()+interval'45 days')::date,'open','11000000-0000-0000-0000-000000000002',now()-interval'7 days',now()),
('Centre-Back Wanted - Ghana','Ghana Football Institute recruiting centre-back. West African players preferred. European loan pathway available.','football','player_needed','Centre-Back',null,'Senior','West Africa',null,null,null,(now()+interval'30 days')::date,'open','11000000-0000-0000-0000-000000000003',now()-interval'5 days',now()),
('Performance Analyst - European Club','Global Talent Agency placing analyst with top European club. Wyscout or StatsBomb required.','football','staff_needed',null,'Performance Analyst','Senior','Europe',3500,5000,'EUR',(now()+interval'21 days')::date,'open','11000000-0000-0000-0000-000000000006',now()-interval'4 days',now()),
('Sporting Director - Lisbon Academy','Sporting Lisboa Academy seeking experienced Sporting Director.','football','staff_needed',null,'Sporting Director','Senior','Portugal',5000,7500,'EUR',(now()+interval'35 days')::date,'open','11000000-0000-0000-0000-000000000004',now()-interval'3 days',now()),
('Fitness Coach - Port Harcourt','Rivers United Academy seeking full-time Fitness Coach. NSCA-CSCS or equivalent required.','football','staff_needed',null,'Strength & Conditioning Coach','Senior','Nigeria',null,null,null,(now()+interval'25 days')::date,'open','11000000-0000-0000-0000-000000000005',now()-interval'8 days',now()),
('Team Manager - Gulf Region','Desert Sports Management placing Team Manager for Gulf region club.','football','staff_needed',null,'First Team Manager','Senior','Middle East',null,null,null,(now()+interval'40 days')::date,'open','11000000-0000-0000-0000-000000000008',now()-interval'1 days',now())
on conflict do nothing;

-- STEP 9: Tryout opportunities
-- Real schema columns: id, posted_by, type, sport, title, position, age_group,
--   region, venue, tryout_date, gender, description, fee_amount, fee_breakdown,
--   flyer_pictures, venue_pictures, status, is_fee_flagged, created_at, updated_at
-- NO: positions_needed, date_from, date_to, is_free (those do not exist)
insert into public.opportunities (
  title, description, sport, type, position, age_group, region,
  tryout_date, fee_amount, status, is_fee_flagged,
  posted_by, created_at, updated_at
) values
(
  'Open International Trials - Elite London FC',
  'Trials for players aged 16-22 from any country. All positions available. Scouts from 3 European clubs attending. FREE entry. Contact via SportBridge inbox only.',
  'football', 'tryout', 'All positions', 'U23', 'London, England',
  (now()+interval'21 days')::date,
  0, 'open', false,
  '11000000-0000-0000-0000-000000000001', now()-interval'3 days', now()
),
(
  'Academie Nationale Paris - Winter Development Camp',
  'Three-day high performance camp for U19-U23 players. Coached by UEFA A staff. Footage and data analysis report provided to every attendee. No fee.',
  'football', 'tryout', 'All positions', 'U23', 'Paris, France',
  (now()+interval'35 days')::date,
  0, 'open', false,
  '11000000-0000-0000-0000-000000000002', now()-interval'2 days', now()
),
(
  'Ghana Football Institute - Annual Open Trials',
  'Open trials for U16-U21 players. All positions. European partner club scouts attending. Performance report provided for all participants. FREE.',
  'football', 'tryout', 'All positions', 'U23', 'Accra, Ghana',
  (now()+interval'28 days')::date,
  0, 'open', false,
  '11000000-0000-0000-0000-000000000003', now()-interval'1 day', now()
),
(
  'Sporting Lisboa Academy - Spring Trials',
  'Open trials for U17-U21 players. Technical assessment for all positions. Results shared with European partner clubs. Free.',
  'football', 'tryout', 'All positions', 'U23', 'Lisbon, Portugal',
  (now()+interval'42 days')::date,
  0, 'open', false,
  '11000000-0000-0000-0000-000000000004', now()-interval'1 day', now()
)
on conflict do nothing;
-- STEP 10: Feed posts
-- Real schema columns: author_id, sport, content, media_urls, visibility, status, created_at, updated_at
-- NO: user_id, caption, is_public, post_type (those do not exist in feed_posts)
-- visibility must be 'public' or 'private'
-- status must be 'draft', 'published', or 'removed'
insert into public.feed_posts (author_id, sport, content, media_urls, visibility, status, created_at, updated_at) values
('22000000-0000-0000-0000-000000000001','football','Marcus Thompson - striker, London. 41 goals this season. England U19 cap holder. Available now. Contact via SportBridge only.','[]'::jsonb,'public','published',now()-interval'15 days',now()-interval'15 days'),
('22000000-0000-0000-0000-000000000002','football','Gabriel Santos - central midfielder, Brazil. 33 assists. Looking for first European move. Contact via SportBridge only.','[]'::jsonb,'public','published',now()-interval'14 days',now()-interval'14 days'),
('22000000-0000-0000-0000-000000000005','football','Kwame Asante - right winger, Accra, Ghana. Fast, direct, effective. Ghana Black Satellites squad. Profile live on SportBridge!','[]'::jsonb,'public','published',now()-interval'13 days',now()-interval'13 days'),
('22000000-0000-0000-0000-000000000007','football','Alejandro Rios - left-footed striker, River Plate. 47 goals. Ready for Europe. All contact via SportBridge.','[]'::jsonb,'public','published',now()-interval'12 days',now()-interval'12 days'),
('11000000-0000-0000-0000-000000000006','football','Global Talent Agency - verified on SportBridge. Seeking players for 3 Bundesliga and 2 Premier League club partners. All contact via SportBridge only.','[]'::jsonb,'public','published',now()-interval'11 days',now()-interval'11 days'),
('11000000-0000-0000-0000-000000000011','football','Carlos Mendes - UEFA A Head Coach. 15 years in Brazil, Portugal and France. Open to Head Coach roles from summer 2025.','[]'::jsonb,'public','published',now()-interval'10 days',now()-interval'10 days'),
('11000000-0000-0000-0000-000000000012','football','Javier Morales - Sporting Director, 18 years La Liga and Portuguese football. Available for new project. Connect via SportBridge.','[]'::jsonb,'public','published',now()-interval'9 days',now()-interval'9 days'),
('11000000-0000-0000-0000-000000000017','football','Sophie Laurent - Performance Analyst. Wyscout, StatsBomb IQ, published UEFA research. Available for analysis projects.','[]'::jsonb,'public','published',now()-interval'8 days',now()-interval'8 days'),
('22000000-0000-0000-0000-000000000013','football','Femi Adeyemi - attacking midfielder, Lagos, Nigeria. NPFL Young Player Award 2023. Seeking first European move.','[]'::jsonb,'public','published',now()-interval'7 days',now()-interval'7 days'),
('22000000-0000-0000-0000-000000000006','football','Yassine Benali - defensive midfielder, Morocco. 6 U23 caps. Inspired by the 2022 World Cup. Contact via SportBridge.','[]'::jsonb,'public','published',now()-interval'6 days',now()-interval'6 days'),
('22000000-0000-0000-0000-000000000019','football','Koffi Kouassi - striker, ASEC Mimosas, Ivory Coast. 39 goals. CAF Champions League experience.','[]'::jsonb,'public','published',now()-interval'5 days',now()-interval'5 days'),
('11000000-0000-0000-0000-000000000015','football','Sarah Mitchell - Strength and Conditioning Coach. NSCA-CSCS, 8 years professional football. Reduced injuries by 40%.','[]'::jsonb,'public','published',now()-interval'4 days',now()-interval'4 days'),
('22000000-0000-0000-0000-000000000014','football','Ivan Petrenko - centre-back, Ukraine. 190cm, 7 U23 caps. Available now. Profile verified on SportBridge.','[]'::jsonb,'public','published',now()-interval'3 days',now()-interval'3 days'),
('11000000-0000-0000-0000-000000000016','football','Nemanja Petrovic - Head Coach, UEFA Pro Licence, 3 league titles. Available June 2025 for Head Coach or Technical Director roles.','[]'::jsonb,'public','published',now()-interval'2 days',now()-interval'2 days'),
('22000000-0000-0000-0000-000000000021','football','Joao Costa - left-back, Sporting Lisboa, Portugal. Portugal U21. Available now for loan or permanent.','[]'::jsonb,'public','published',now()-interval'1 day',now()-interval'1 day'),
('22000000-0000-0000-0000-000000000026','football','Chukwuemeka Okafor - striker, Lagos, Nigeria. 34 goals. NPFL U20 top scorer. Nigeria U20 squad.','[]'::jsonb,'public','published',now()-interval'12 hours',now()-interval'12 hours'),
('22000000-0000-0000-0000-000000000011','football','Diego Hernandez - La Masia graduate, FC Barcelona B. Spain U21. Seeking first team move.','[]'::jsonb,'public','published',now()-interval'8 hours',now()-interval'8 hours'),
('11000000-0000-0000-0000-000000000009','football','Ajax Talent Network - verified on SportBridge. Looking for technically gifted players aged 14-22 for top European clubs.','[]'::jsonb,'public','published',now()-interval'4 hours',now()-interval'4 hours'),
('22000000-0000-0000-0000-000000000023','football','Bernard Owusu - central midfielder, Asante Kotoko, Ghana. Ghana PL Player of the Month. Targeting European move.','[]'::jsonb,'public','published',now()-interval'2 hours',now()-interval'2 hours')
on conflict do nothing;

-- =============================================================================
-- DONE: 50 accounts, 25+ countries. Password: Demo@SportBridge1!
-- Roles: Players(28) Coaches/Managers(6) Analysts(4) Agents(5) Academies(5)
-- Countries: England, Brazil, France, Germany, Ghana, Morocco, Argentina, Senegal,
--            Japan, South Korea, Spain, USA, Nigeria, Ukraine, Algeria, Mexico,
--            Serbia, Egypt, Ivory Coast, Norway, Portugal, Iran, Colombia, Poland, Greece
-- =============================================================================
