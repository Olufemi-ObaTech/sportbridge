-- =============================================================================
-- SportBridge Demo Seed Data
-- Run in Supabase SQL Editor AFTER schema.sql has been applied.
-- Creates: 2 academies, 1 agent, 10 verified players, 3 jobs, 1 tryout,
--          player history rows, media placeholders.
-- Safe to re-run (uses ON CONFLICT DO NOTHING / DO UPDATE).
-- =============================================================================

-- ── 1. Auth users (Supabase auth.users) ──────────────────────────────────────
-- We insert directly into auth.users so the handle_new_user trigger fires
-- and automatically creates matching profiles + role sub-profiles.

insert into auth.users (
  id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at,
  aud, role, confirmation_token, recovery_token,
  email_change_token_new, email_change
) values

-- Academy 1: Lagos United FC
(
  '11000000-0000-0000-0000-000000000001',
  'admin@lagosunitedfc.ng',
  crypt('Demo@1234!', gen_salt('bf')),
  now(),
  '{"full_name":"Lagos United FC","role":"academy","sport":"football"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated', '', '', '', ''
),

-- Academy 2: Eko Sports Academy
(
  '11000000-0000-0000-0000-000000000002',
  'info@ekosportsacademy.ng',
  crypt('Demo@1234!', gen_salt('bf')),
  now(),
  '{"full_name":"Eko Sports Academy","role":"academy","sport":"football"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated', '', '', '', ''
),

-- Agent: Premier Football Agency
(
  '11000000-0000-0000-0000-000000000003',
  'scouting@premierfootballagency.ng',
  crypt('Demo@1234!', gen_salt('bf')),
  now(),
  '{"full_name":"Premier Football Agency","role":"agent","sport":"football"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated', '', '', '', ''
),

-- Players 1-10
(
  '22000000-0000-0000-0000-000000000001',
  'chukwuemeka.okafor@sportbridge.ng',
  crypt('Demo@1234!', gen_salt('bf')),
  now(),
  '{"full_name":"Chukwuemeka Okafor","role":"player","sport":"football"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated', '', '', '', ''
),
(
  '22000000-0000-0000-0000-000000000002',
  'adewale.ibrahim@sportbridge.ng',
  crypt('Demo@1234!', gen_salt('bf')),
  now(),
  '{"full_name":"Adewale Ibrahim","role":"player","sport":"football"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated', '', '', '', ''
),
(
  '22000000-0000-0000-0000-000000000003',
  'emeka.nwosu@sportbridge.ng',
  crypt('Demo@1234!', gen_salt('bf')),
  now(),
  '{"full_name":"Emeka Nwosu","role":"player","sport":"football"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated', '', '', '', ''
),
(
  '22000000-0000-0000-0000-000000000004',
  'babatunde.adeleke@sportbridge.ng',
  crypt('Demo@1234!', gen_salt('bf')),
  now(),
  '{"full_name":"Babatunde Adeleke","role":"player","sport":"football"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated', '', '', '', ''
),
(
  '22000000-0000-0000-0000-000000000005',
  'david.eze@sportbridge.ng',
  crypt('Demo@1234!', gen_salt('bf')),
  now(),
  '{"full_name":"David Eze","role":"player","sport":"football"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated', '', '', '', ''
),
(
  '22000000-0000-0000-0000-000000000006',
  'samuel.okonkwo@sportbridge.ng',
  crypt('Demo@1234!', gen_salt('bf')),
  now(),
  '{"full_name":"Samuel Okonkwo","role":"player","sport":"football"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated', '', '', '', ''
),
(
  '22000000-0000-0000-0000-000000000007',
  'ibrahim.musa@sportbridge.ng',
  crypt('Demo@1234!', gen_salt('bf')),
  now(),
  '{"full_name":"Ibrahim Musa","role":"player","sport":"football"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated', '', '', '', ''
),
(
  '22000000-0000-0000-0000-000000000008',
  'chisom.agu@sportbridge.ng',
  crypt('Demo@1234!', gen_salt('bf')),
  now(),
  '{"full_name":"Chisom Agu","role":"player","sport":"football"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated', '', '', '', ''
),
(
  '22000000-0000-0000-0000-000000000009',
  'tunde.salami@sportbridge.ng',
  crypt('Demo@1234!', gen_salt('bf')),
  now(),
  '{"full_name":"Tunde Salami","role":"player","sport":"football"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated', '', '', '', ''
),
(
  '22000000-0000-0000-0000-000000000010',
  'kelechi.obiora@sportbridge.ng',
  crypt('Demo@1234!', gen_salt('bf')),
  now(),
  '{"full_name":"Kelechi Obiora","role":"player","sport":"football"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated', '', '', '', ''
)
on conflict (id) do nothing;

-- ── 2. Set verification_status = verified for all demo accounts ───────────────
update public.profiles
set verification_status = 'verified',
    status = 'active',
    sport  = 'football'
where id in (
  '11000000-0000-0000-0000-000000000001',
  '11000000-0000-0000-0000-000000000002',
  '11000000-0000-0000-0000-000000000003',
  '22000000-0000-0000-0000-000000000001',
  '22000000-0000-0000-0000-000000000002',
  '22000000-0000-0000-0000-000000000003',
  '22000000-0000-0000-0000-000000000004',
  '22000000-0000-0000-0000-000000000005',
  '22000000-0000-0000-0000-000000000006',
  '22000000-0000-0000-0000-000000000007',
  '22000000-0000-0000-0000-000000000008',
  '22000000-0000-0000-0000-000000000009',
  '22000000-0000-0000-0000-000000000010'
);

-- ── 3. Agent profile ──────────────────────────────────────────────────────────
update public.agent_profiles
set agency_name      = 'Premier Football Agency',
    sport            = 'football',
    nationality      = 'Nigerian',
    experience_years = 9,
    regions          = array['Lagos','Abuja','Port Harcourt','West Africa'],
    about            = 'One of Nigeria''s most active football agencies, representing over 40 players across the NPFL and European leagues since 2015.',
    achievements     = 'Placed 12 players in European academies (2022-2024). Managed transfers to clubs in Portugal, Turkey and Saudi Arabia.',
    is_public        = true
where user_id = '11000000-0000-0000-0000-000000000003';

-- ── 4. Clubs for academies ────────────────────────────────────────────────────
-- The handle_new_user trigger already created clubs. We now update them.
update public.clubs
set name          = 'Lagos United FC',
    country       = 'Nigeria',
    state         = 'Lagos',
    address       = 'Teslim Balogun Stadium, Surulere, Lagos',
    about         = 'Lagos United FC is one of Nigeria''s most respected football academies, developing talent since 1998. Home to over 120 registered players across U13–Senior categories.',
    website       = 'https://lagosunitedfc.ng',
    verified_badge = true,
    status        = 'active'
where owner_id = '11000000-0000-0000-0000-000000000001';

update public.clubs
set name           = 'Eko Sports Academy',
    country        = 'Nigeria',
    state          = 'Lagos',
    address        = 'National Stadium, Surulere, Lagos',
    about          = 'Eko Sports Academy specialises in youth development, running elite programmes for U13–U20 age groups with UEFA-licenced coaching staff.',
    website        = 'https://ekosports.ng',
    verified_badge = true,
    status         = 'active'
where owner_id = '11000000-0000-0000-0000-000000000002';

-- ── 5. Academy profiles ───────────────────────────────────────────────────────
update public.academy_profiles
set sports       = array['football'],
    country      = 'Nigeria',
    state        = 'Lagos',
    address      = 'Teslim Balogun Stadium, Surulere, Lagos',
    phone        = '+2348012345678',
    year_founded = 1998,
    leagues      = array['NPFL','Lagos FA Cup','Aiteo Cup']
where user_id = '11000000-0000-0000-0000-000000000001';

update public.academy_profiles
set sports       = array['football'],
    country      = 'Nigeria',
    state        = 'Lagos',
    address      = 'National Stadium, Surulere, Lagos',
    phone        = '+2348087654321',
    year_founded = 2008,
    leagues      = array['Lagos FA Cup','NWFL Premiership']
where user_id = '11000000-0000-0000-0000-000000000002';

-- ── 6. Player profiles (full details) ────────────────────────────────────────
-- Get academy IDs we need for foreign keys
do $$
declare
  acad1_id uuid;
  acad2_id uuid;
begin
  select id into acad1_id from public.academy_profiles where user_id = '11000000-0000-0000-0000-000000000001';
  select id into acad2_id from public.academy_profiles where user_id = '11000000-0000-0000-0000-000000000002';

  -- Player 1: Chukwuemeka Okafor — Striker
  update public.players set
    display_name       = 'Chukwuemeka Okafor',
    position           = 'Striker',
    secondary_position = 'Centre Forward',
    age                = 22,
    nationality        = 'Nigerian',
    country            = 'Nigeria',
    region             = 'Lagos',
    gender             = 'male',
    preferred_foot     = 'right',
    foot               = 'right',
    height_cm          = 181,
    weight_kg          = 76,
    current_club       = 'Lagos United FC',
    bio                = 'Explosive striker with exceptional finishing ability. Comfortable on both feet, strong in the air and lethal in one-on-one situations. Represented Nigeria U20.',
    achievements       = 'Top scorer NPFL U20 League 2023 (18 goals). Nigeria U20 squad member. Lagos FA Cup winner 2022.',
    is_public          = true,
    sport              = 'football',
    status             = 'active',
    age_group          = 'U23',
    availability       = 'available_now',
    stats              = '{"total_appearances":67,"total_goals":34,"total_assists":12,"minutes_played":5490}'::jsonb,
    achievements_data  = '[{"title":"NPFL U20 Top Scorer","year":"2023"},{"title":"Lagos FA Cup Winner","year":"2022"},{"title":"Nigeria U20 Squad","year":"2023"}]'::jsonb,
    academy_id         = acad1_id
  where profile_id = '22000000-0000-0000-0000-000000000001';

  -- Player 2: Adewale Ibrahim — Goalkeeper
  update public.players set
    display_name       = 'Adewale Ibrahim',
    position           = 'Goalkeeper',
    age                = 20,
    nationality        = 'Nigerian',
    country            = 'Nigeria',
    region             = 'Abuja',
    gender             = 'male',
    preferred_foot     = 'right',
    foot               = 'right',
    height_cm          = 190,
    weight_kg          = 85,
    current_club       = 'Eko Sports Academy',
    bio                = 'Commanding goalkeeper with outstanding shot-stopping and excellent communication. Strong with crosses and confident in one-v-ones. Has trained with the Super Eagles pool.',
    achievements       = 'Abuja FA League Best GK 2023. Clean sheet record: 14 in 22 games.',
    is_public          = true,
    sport              = 'football',
    status             = 'active',
    age_group          = 'U20',
    availability       = 'available_now',
    stats              = '{"total_appearances":41,"total_clean_sheets":14,"minutes_played":3690}'::jsonb,
    achievements_data  = '[{"title":"Abuja FA Best Goalkeeper","year":"2023"},{"title":"14 Clean Sheets in 22 games","year":"2023"}]'::jsonb,
    academy_id         = acad2_id
  where profile_id = '22000000-0000-0000-0000-000000000002';

  -- Player 3: Emeka Nwosu — Central Mid
  update public.players set
    display_name       = 'Emeka Nwosu',
    position           = 'Central Mid',
    secondary_position = 'Attacking Mid',
    age                = 24,
    nationality        = 'Nigerian',
    country            = 'Nigeria',
    region             = 'Port Harcourt',
    gender             = 'male',
    preferred_foot     = 'left',
    foot               = 'left',
    height_cm          = 176,
    weight_kg          = 72,
    current_club       = 'Rivers United',
    bio                = 'Creative midfielder with exceptional vision and passing range. Can play as an 8 or 10. Technical ability and work rate make him a complete central midfielder.',
    achievements       = 'NPFL Player of the Month — March 2024. Rivers State Best Young Player 2022.',
    is_public          = true,
    sport              = 'football',
    status             = 'active',
    age_group          = 'Senior',
    availability       = 'available_jan_2026',
    stats              = '{"total_appearances":89,"total_goals":11,"total_assists":28,"minutes_played":7200}'::jsonb,
    achievements_data  = '[{"title":"NPFL Player of the Month","year":"2024"},{"title":"Rivers State Best Young Player","year":"2022"}]'::jsonb
  where profile_id = '22000000-0000-0000-0000-000000000003';

  -- Player 4: Babatunde Adeleke — Left Back
  update public.players set
    display_name       = 'Babatunde Adeleke',
    position           = 'Left Back',
    secondary_position = 'Defensive Mid',
    age                = 21,
    nationality        = 'Nigerian',
    country            = 'Nigeria',
    region             = 'Lagos',
    gender             = 'male',
    preferred_foot     = 'left',
    foot               = 'left',
    height_cm          = 177,
    weight_kg          = 73,
    current_club       = 'Shooting Stars SC',
    bio                = 'Attack-minded left back with pace and a powerful left foot. Comfortable pushing forward, delivering crosses and contributing to goals from deep positions.',
    achievements       = 'Ibadan FA Cup winner 2023. 6 assists in 30 NPFL appearances.',
    is_public          = true,
    sport              = 'football',
    status             = 'active',
    age_group          = 'U23',
    availability       = 'available_now',
    stats              = '{"total_appearances":53,"total_goals":3,"total_assists":11,"minutes_played":4590}'::jsonb,
    achievements_data  = '[{"title":"Ibadan FA Cup Winner","year":"2023"}]'::jsonb
  where profile_id = '22000000-0000-0000-0000-000000000004';

  -- Player 5: David Eze — Centre Back
  update public.players set
    display_name       = 'David Eze',
    position           = 'Centre Back',
    secondary_position = 'Defensive Mid',
    age                = 25,
    nationality        = 'Nigerian',
    country            = 'Nigeria',
    region             = 'Enugu',
    gender             = 'male',
    preferred_foot     = 'right',
    foot               = 'right',
    height_cm          = 188,
    weight_kg          = 83,
    current_club       = 'Enugu Rangers',
    bio                = 'Dominant centre back, excellent in the air and composed under pressure. Natural leader and organiser at the back. Won multiple defensive awards in the NPFL.',
    achievements       = 'NPFL Best Defender 2023. Enugu Rangers Player of the Year 2022.',
    is_public          = true,
    sport              = 'football',
    status             = 'active',
    age_group          = 'Senior',
    availability       = 'available_jul_2026',
    stats              = '{"total_appearances":112,"total_goals":8,"total_assists":4,"total_clean_sheets":32,"minutes_played":9540}'::jsonb,
    achievements_data  = '[{"title":"NPFL Best Defender","year":"2023"},{"title":"Enugu Rangers Player of the Year","year":"2022"}]'::jsonb
  where profile_id = '22000000-0000-0000-0000-000000000005';

  -- Player 6: Samuel Okonkwo — Right Wing
  update public.players set
    display_name       = 'Samuel Okonkwo',
    position           = 'Right Wing',
    secondary_position = 'Attacking Mid',
    age                = 19,
    nationality        = 'Nigerian',
    country            = 'Nigeria',
    region             = 'Lagos',
    gender             = 'male',
    preferred_foot     = 'left',
    foot               = 'left',
    height_cm          = 172,
    weight_kg          = 68,
    current_club       = 'Lagos United FC',
    bio                = 'Electrifying winger with dribbling ability and explosive pace. Predominantly right-footed cutting inside from the left but equally effective on the right. Nigeria U17 international.',
    achievements       = 'Nigeria U17 World Cup squad 2023. Lagos FA Youth Player of the Year 2023.',
    is_public          = true,
    sport              = 'football',
    status             = 'active',
    age_group          = 'U20',
    availability       = 'available_now',
    stats              = '{"total_appearances":34,"total_goals":9,"total_assists":14,"minutes_played":2890}'::jsonb,
    achievements_data  = '[{"title":"Nigeria U17 World Cup Squad","year":"2023"},{"title":"Lagos FA Youth Player of the Year","year":"2023"}]'::jsonb,
    academy_id         = acad1_id
  where profile_id = '22000000-0000-0000-0000-000000000006';

  -- Player 7: Ibrahim Musa — Defensive Mid
  update public.players set
    display_name       = 'Ibrahim Musa',
    position           = 'Defensive Mid',
    secondary_position = 'Centre Back',
    age                = 23,
    nationality        = 'Nigerian',
    country            = 'Nigeria',
    region             = 'Kano',
    gender             = 'male',
    preferred_foot     = 'right',
    foot               = 'right',
    height_cm          = 182,
    weight_kg          = 79,
    current_club       = 'Kano Pillars',
    bio                = 'Tenacious defensive midfielder who wins the ball and distributes simply. Known for his reading of the game and positioning. A key player for Kano Pillars in the NPFL.',
    achievements       = 'Kano Pillars Player of the Year 2023. NPFL Northern Conference Top Tackler.',
    is_public          = true,
    sport              = 'football',
    status             = 'active',
    age_group          = 'U23',
    availability       = 'available_now',
    stats              = '{"total_appearances":78,"total_goals":4,"total_assists":9,"minutes_played":6580}'::jsonb,
    achievements_data  = '[{"title":"Kano Pillars Player of the Year","year":"2023"}]'::jsonb
  where profile_id = '22000000-0000-0000-0000-000000000007';

  -- Player 8: Chisom Agu — Striker
  update public.players set
    display_name       = 'Chisom Agu',
    position           = 'Striker',
    secondary_position = 'Left Wing',
    age                = 18,
    nationality        = 'Nigerian',
    country            = 'Nigeria',
    region             = 'Owerri',
    gender             = 'female',
    preferred_foot     = 'right',
    foot               = 'right',
    height_cm          = 169,
    weight_kg          = 62,
    current_club       = 'Owerri FC Ladies',
    bio                = 'Highly-rated female striker with outstanding technical ability and goal-scoring instinct. One of the most exciting young talents in women''s football in South East Nigeria.',
    achievements       = 'Imo State Women''s League Top Scorer 2023. Nigeria Falconets shortlist 2024.',
    is_public          = true,
    sport              = 'football',
    status             = 'active',
    age_group          = 'U20',
    availability       = 'available_now',
    stats              = '{"total_appearances":29,"total_goals":21,"total_assists":7,"minutes_played":2450}'::jsonb,
    achievements_data  = '[{"title":"Imo Women''s League Top Scorer","year":"2023"},{"title":"Nigeria Falconets Shortlist","year":"2024"}]'::jsonb
  where profile_id = '22000000-0000-0000-0000-000000000008';

  -- Player 9: Tunde Salami — Right Back
  update public.players set
    display_name       = 'Tunde Salami',
    position           = 'Right Back',
    secondary_position = 'Right Wing',
    age                = 26,
    nationality        = 'Nigerian',
    country            = 'Nigeria',
    region             = 'Ibadan',
    gender             = 'male',
    preferred_foot     = 'right',
    foot               = 'right',
    height_cm          = 175,
    weight_kg          = 71,
    current_club       = 'FC Ibadan',
    bio                = 'Experienced right back with European trial experience. Technical, comfortable on the ball, overlaps frequently and contributes to the attack. Had trials in Portugal (2022).',
    achievements       = 'Portugal trial — Sporting B (2022). Oyo State Best Defender 2021.',
    is_public          = true,
    sport              = 'football',
    status             = 'active',
    age_group          = 'Senior',
    availability       = 'available_jan_2026',
    stats              = '{"total_appearances":134,"total_goals":5,"total_assists":19,"minutes_played":11200}'::jsonb,
    achievements_data  = '[{"title":"Portugal Trial — Sporting B","year":"2022"},{"title":"Oyo State Best Defender","year":"2021"}]'::jsonb
  where profile_id = '22000000-0000-0000-0000-000000000009';

  -- Player 10: Kelechi Obiora — Centre Forward
  update public.players set
    display_name       = 'Kelechi Obiora',
    position           = 'Centre Forward',
    secondary_position = 'Striker',
    age                = 20,
    nationality        = 'Nigerian',
    country            = 'Nigeria',
    region             = 'Abuja',
    gender             = 'male',
    preferred_foot     = 'both',
    foot               = 'both',
    height_cm          = 183,
    weight_kg          = 78,
    current_club       = 'Abuja FC',
    bio                = 'Powerful centre forward with pace, strength and clinical finishing. Equally dangerous with both feet. Represented Nigeria U20 and is attracting interest from clubs in Turkey and Morocco.',
    achievements       = 'Nigeria U20 AFCON squad 2024. NPFL Top 10 scorers 2024.',
    is_public          = true,
    sport              = 'football',
    status             = 'active',
    age_group          = 'U20',
    availability       = 'available_now',
    stats              = '{"total_appearances":48,"total_goals":27,"total_assists":8,"minutes_played":4050}'::jsonb,
    achievements_data  = '[{"title":"Nigeria U20 AFCON Squad","year":"2024"},{"title":"NPFL Top 10 Scorer","year":"2024"}]'::jsonb
  where profile_id = '22000000-0000-0000-0000-000000000010';

end $$;

-- ── 7. Player history (club career) ──────────────────────────────────────────
insert into public.player_history (player_id, club_name, season_from, season_to, appearances, goals, assists, clean_sheets, sort_order)
select p.id, h.club_name, h.season_from, h.season_to, h.appearances, h.goals, h.assists, h.clean_sheets, h.sort_order
from public.players p
cross join (values
  -- Okafor
  ('Lagos United FC', '2023', 'Present', 42, 22, 8, 0, 1),
  ('Sunshine Stars Youth', '2021', '2023', 25, 12, 4, 0, 2)
) as h(club_name, season_from, season_to, appearances, goals, assists, clean_sheets, sort_order)
where p.profile_id = '22000000-0000-0000-0000-000000000001'
on conflict do nothing;

insert into public.player_history (player_id, club_name, season_from, season_to, appearances, goals, assists, clean_sheets, sort_order)
select p.id, h.club_name, h.season_from, h.season_to, h.appearances, h.goals, h.assists, h.clean_sheets, h.sort_order
from public.players p
cross join (values
  ('Eko Sports Academy', '2023', 'Present', 22, 0, 0, 14, 1),
  ('Abuja FC Youth', '2021', '2023', 19, 0, 0, 8, 2)
) as h(club_name, season_from, season_to, appearances, goals, assists, clean_sheets, sort_order)
where p.profile_id = '22000000-0000-0000-0000-000000000002'
on conflict do nothing;

insert into public.player_history (player_id, club_name, season_from, season_to, appearances, goals, assists, clean_sheets, sort_order)
select p.id, h.club_name, h.season_from, h.season_to, h.appearances, h.goals, h.assists, h.clean_sheets, h.sort_order
from public.players p
cross join (values
  ('Rivers United', '2022', 'Present', 54, 7, 18, 0, 1),
  ('Enugu Rangers', '2020', '2022', 35, 4, 10, 0, 2)
) as h(club_name, season_from, season_to, appearances, goals, assists, clean_sheets, sort_order)
where p.profile_id = '22000000-0000-0000-0000-000000000003'
on conflict do nothing;

-- ── 8. Jobs (3 job posts) ─────────────────────────────────────────────────────
insert into public.jobs (
  id, club_id, posted_by_user_id, posted_by, title, description,
  sport, job_type, player_position, age_group, region, budget,
  free_agent_only, is_verified, status, facility_pictures,
  published_at, created_at, updated_at
)
select
  gen_random_uuid(),
  c.id,
  '11000000-0000-0000-0000-000000000001',
  '11000000-0000-0000-0000-000000000001',
  j.title, j.description, 'football',
  j.job_type::text, j.player_position, j.age_group, j.region,
  j.budget, j.free_agent_only, true, 'open', '[]'::jsonb,
  now(), now(), now()
from public.clubs c
cross join (values
  (
    'Striker Needed — Senior Squad',
    'Lagos United FC is recruiting a clinical striker for our senior squad ahead of the 2025/26 NPFL season. We offer competitive wages, modern facilities and a pathway to the Super Eagles. Free agents only.',
    'player_needed', 'Striker', 'Senior', 'Lagos', 150000, true
  ),
  (
    'Left Back Wanted — U20 Academy',
    'Seeking an attack-minded left back for our U20 development squad. Must be available immediately. Full training facilities, nutritionist and UEFA-licenced coaches on staff.',
    'player_needed', 'Left Back', 'U20', 'Lagos', 80000, true
  ),
  (
    'Goalkeeper Required — First Team',
    'Experienced goalkeeper needed for first team duties. Minimum 2 years NPFL experience required. Competitive salary, accommodation provided.',
    'player_needed', 'Goalkeeper', 'Senior', 'Lagos', 200000, false
  )
) as j(title, description, job_type, player_position, age_group, region, budget, free_agent_only)
where c.owner_id = '11000000-0000-0000-0000-000000000001'
  and not exists (
    select 1 from public.jobs where posted_by = '11000000-0000-0000-0000-000000000001'
  );

-- ── 9. Tryout (1 open opportunity) ───────────────────────────────────────────
insert into public.opportunities (
  id, posted_by, type, sport, title, position, age_group, region,
  venue, tryout_date, gender, description,
  fee_amount, fee_breakdown, flyer_pictures, venue_pictures,
  status, is_fee_flagged, created_at, updated_at
)
values (
  gen_random_uuid(),
  '11000000-0000-0000-0000-000000000003',
  'tryout', 'football',
  'Open Tryout — Strikers & Wingers (All Ages)',
  'Striker',
  'Senior',
  'Lagos',
  'Teslim Balogun Stadium, Surulere, Lagos',
  current_date + interval '14 days',
  'male',
  'Premier Football Agency is conducting open trials for talented strikers and wingers ahead of placing players with NPFL and European academy clubs. Bring your boots, a water bottle and your A-game. Selection is based purely on performance — no fees, no guarantees, no shortcuts.',
  0,
  null,
  '[]'::jsonb,
  '[]'::jsonb,
  'open',
  false,
  now(), now()
)
on conflict do nothing;

-- ── 10. Verification requests (already submitted, so admin can see queue) ─────
insert into public.verification_requests (user_id, role, nin_number, status, submitted_at)
values
  ('22000000-0000-0000-0000-000000000001', 'player', '12345678901', 'approved', now() - interval '5 days'),
  ('22000000-0000-0000-0000-000000000002', 'player', '23456789012', 'approved', now() - interval '4 days'),
  ('22000000-0000-0000-0000-000000000003', 'player', '34567890123', 'approved', now() - interval '3 days'),
  ('11000000-0000-0000-0000-000000000001', 'academy', null, 'approved', now() - interval '7 days'),
  ('11000000-0000-0000-0000-000000000002', 'academy', null, 'approved', now() - interval '6 days'),
  ('11000000-0000-0000-0000-000000000003', 'agent',   '99988877766', 'pending', now() - interval '1 day')
on conflict do nothing;

-- ── Done ──────────────────────────────────────────────────────────────────────
-- Final check — confirm row counts
select
  (select count(*) from public.profiles     where id::text like '1100%' or id::text like '2200%') as demo_profiles,
  (select count(*) from public.players      where is_public = true)       as public_players,
  (select count(*) from public.jobs         where status = 'open')        as open_jobs,
  (select count(*) from public.opportunities where status = 'open')       as open_tryouts;
