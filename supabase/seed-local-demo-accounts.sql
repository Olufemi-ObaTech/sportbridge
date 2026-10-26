-- Local/test fixtures only. Do not run against a production Supabase project.
-- Adds 24 fictional, visibly labeled demo profiles across EN/FR/PT/AR/ES
-- locales. They are active for UI testing but explicitly remain unverified.
-- Random password hashes are generated so these seeded accounts cannot log in.
begin;

create temporary table sportbridge_demo_account_seed (
  id uuid primary key,
  email text not null unique,
  full_name text not null,
  account_role text not null check (account_role in ('player','coach','agent','academy')),
  country text not null,
  region text not null,
  nationality text not null,
  language_code text not null check (language_code in ('en','fr','pt','ar','es')),
  specialty text,
  age integer,
  player_position text
) on commit drop;

insert into sportbridge_demo_account_seed values
  ('33000000-0000-0000-0000-000000000001', 'demo-academy-ng@sportbridge.test', '[DEMO] Coastal Talent Academy', 'academy', 'Nigeria', 'Lagos', 'Nigerian', 'en', null, null, null),
  ('33000000-0000-0000-0000-000000000002', 'demo-academy-gh@sportbridge.test', '[DEMO] Accra Bridge Academy', 'academy', 'Ghana', 'Accra', 'Ghanaian', 'en', null, null, null),
  ('33000000-0000-0000-0000-000000000003', 'demo-academy-sn@sportbridge.test', '[DEMO] Dakar Horizon Academy', 'academy', 'Senegal', 'Dakar', 'Senegalese', 'fr', null, null, null),
  ('33000000-0000-0000-0000-000000000004', 'demo-academy-ma@sportbridge.test', '[DEMO] Atlas Youth Academy', 'academy', 'Morocco', 'Casablanca', 'Moroccan', 'ar', null, null, null),
  ('33000000-0000-0000-0000-000000000005', 'demo-agent-ke@sportbridge.test', '[DEMO] East Africa Scout Network', 'agent', 'Kenya', 'Nairobi', 'Kenyan', 'en', 'Scout', null, null),
  ('33000000-0000-0000-0000-000000000006', 'demo-agent-ci@sportbridge.test', '[DEMO] Abidjan Player Pathways', 'agent', 'Cote d''Ivoire', 'Abidjan', 'Ivorian', 'fr', 'Agent / Scout', null, null),
  ('33000000-0000-0000-0000-000000000007', 'demo-agent-eg@sportbridge.test', '[DEMO] Nile Football Scouting', 'agent', 'Egypt', 'Cairo', 'Egyptian', 'ar', 'Scout', null, null),
  ('33000000-0000-0000-0000-000000000008', 'demo-agent-ao@sportbridge.test', '[DEMO] Luanda Talent Desk', 'agent', 'Angola', 'Luanda', 'Angolan', 'pt', 'Agent', null, null),
  ('33000000-0000-0000-0000-000000000009', 'demo-agent-gq@sportbridge.test', '[DEMO] Equatorial Talent Scout', 'agent', 'Equatorial Guinea', 'Malabo', 'Equatoguinean', 'es', 'Scout', null, null),
  ('33000000-0000-0000-0000-000000000010', 'demo-coach-za@sportbridge.test', '[DEMO] South Coast Football Coach', 'coach', 'South Africa', 'Cape Town', 'South African', 'en', 'Head Coach', null, null),
  ('33000000-0000-0000-0000-000000000011', 'demo-coach-cm@sportbridge.test', '[DEMO] Douala Goalkeeping Coach', 'coach', 'Cameroon', 'Douala', 'Cameroonian', 'fr', 'Goalkeeper Coach', null, null),
  ('33000000-0000-0000-0000-000000000012', 'demo-coach-mz@sportbridge.test', '[DEMO] Maputo Fitness Coach', 'coach', 'Mozambique', 'Maputo', 'Mozambican', 'pt', 'Fitness Coach', null, null),
  ('33000000-0000-0000-0000-000000000013', 'demo-coach-tn@sportbridge.test', '[DEMO] Tunis Team Manager', 'coach', 'Tunisia', 'Tunis', 'Tunisian', 'ar', 'Team Manager', null, null),
  ('33000000-0000-0000-0000-000000000014', 'demo-coach-es@sportbridge.test', '[DEMO] Madrid Sporting Director', 'coach', 'Spain', 'Madrid', 'Spanish', 'es', 'Sporting Director', null, null),
  ('33000000-0000-0000-0000-000000000015', 'demo-coach-uk@sportbridge.test', '[DEMO] London Development Coach', 'coach', 'United Kingdom', 'London', 'British', 'en', 'Youth Coach', null, null),
  ('33000000-0000-0000-0000-000000000016', 'demo-coach-dz@sportbridge.test', '[DEMO] Algiers Performance Coach', 'coach', 'Algeria', 'Algiers', 'Algerian', 'ar', 'Performance Coach', null, null),
  ('33000000-0000-0000-0000-000000000017', 'demo-coach-gh@sportbridge.test', '[DEMO] Kumasi Team Manager', 'coach', 'Ghana', 'Kumasi', 'Ghanaian', 'en', 'Team Manager', null, null),
  ('33000000-0000-0000-0000-000000000018', 'demo-coach-pt@sportbridge.test', '[DEMO] Lisbon Assistant Coach', 'coach', 'Portugal', 'Lisbon', 'Portuguese', 'pt', 'Assistant Coach', null, null),
  ('33000000-0000-0000-0000-000000000019', 'demo-coach-ci@sportbridge.test', '[DEMO] Yamoussoukro Goalkeeping Coach', 'coach', 'Cote d''Ivoire', 'Yamoussoukro', 'Ivorian', 'fr', 'Goalkeeper Coach', null, null),
  ('33000000-0000-0000-0000-000000000020', 'demo-player-ng@sportbridge.test', '[DEMO] Lagos Striker', 'player', 'Nigeria', 'Lagos', 'Nigerian', 'en', null, 21, 'Striker'),
  ('33000000-0000-0000-0000-000000000021', 'demo-player-gh@sportbridge.test', '[DEMO] Accra Midfielder', 'player', 'Ghana', 'Accra', 'Ghanaian', 'en', null, 22, 'Central Midfielder'),
  ('33000000-0000-0000-0000-000000000022', 'demo-player-sn@sportbridge.test', '[DEMO] Dakar Defender', 'player', 'Senegal', 'Dakar', 'Senegalese', 'fr', null, 23, 'Centre Back'),
  ('33000000-0000-0000-0000-000000000023', 'demo-player-mz@sportbridge.test', '[DEMO] Maputo Goalkeeper', 'player', 'Mozambique', 'Maputo', 'Mozambican', 'pt', null, 20, 'Goalkeeper'),
  ('33000000-0000-0000-0000-000000000024', 'demo-player-gq@sportbridge.test', '[DEMO] Malabo Winger', 'player', 'Equatorial Guinea', 'Malabo', 'Equatoguinean', 'es', null, 19, 'Winger');

insert into auth.users (
  id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at,
  aud, role, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
select
  demo.id,
  demo.email,
  extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf', 10)),
  now(),
  jsonb_build_object(
    'full_name', demo.full_name,
    'role', demo.account_role,
    'sport', 'football',
    'demo', true,
    'language', demo.language_code
  ),
  now(), now(), 'authenticated', 'authenticated', '', '', '', ''
from sportbridge_demo_account_seed as demo
on conflict do nothing;

update public.profiles as profile
set country = demo.country,
    region = demo.region,
    nationality = demo.nationality,
    verification_status = 'unverified',
    verification_badge = null
from sportbridge_demo_account_seed as demo
where profile.id = demo.id;

update public.clubs as club
set name = demo.full_name,
    country = demo.country,
    state = demo.region,
    about = 'Fictional demo account for local testing. Not a real club and not verified.',
    status = 'active',
    verified_badge = false
from sportbridge_demo_account_seed as demo
where club.owner_id = demo.id and demo.account_role = 'academy';

update public.academy_profiles as academy
set country = demo.country,
    state = demo.region,
    languages = array[demo.language_code]
from sportbridge_demo_account_seed as demo
where academy.user_id = demo.id and demo.account_role = 'academy';

update public.agent_profiles as agent
set agency_name = demo.full_name,
    nationality = demo.nationality,
    regions = array[demo.country, demo.region],
    about = 'Fictional demo account for local testing. Not a real agent and not verified.',
    is_public = true,
    verified_badge = false
from sportbridge_demo_account_seed as demo
where agent.user_id = demo.id and demo.account_role = 'agent';

update public.coach_profiles as coach
set full_name = demo.full_name,
    preferred_role = demo.specialty,
    nationality = demo.nationality,
    about = 'Fictional demo account for local testing. Not a real professional and not verified.',
    open_to_work = true,
    is_public = true
from sportbridge_demo_account_seed as demo
where coach.user_id = demo.id and demo.account_role = 'coach';

update public.players as player
set display_name = demo.full_name,
    position = demo.player_position,
    age = demo.age,
    country = demo.country,
    nationality = demo.nationality,
    region = demo.region,
    bio = 'Fictional demo account for local testing. Not a real player and not verified.',
    is_public = true,
    status = 'active'
from sportbridge_demo_account_seed as demo
where player.profile_id = demo.id and demo.account_role = 'player';

select count(*) as demo_accounts_added
from public.profiles as profile
join sportbridge_demo_account_seed as demo on demo.id = profile.id;

commit;
