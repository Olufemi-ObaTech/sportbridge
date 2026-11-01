-- =============================================================================
-- SportBridge -- Reset all demo account passwords
-- Run this in Supabase SQL Editor whenever needed.
-- Uses extensions.crypt() (pgcrypto) for Supabase-compatible bcrypt hashes.
-- =============================================================================

-- 1. Reset admin password
update auth.users
set
  encrypted_password = extensions.crypt('SportBridge2026!', extensions.gen_salt('bf', 10)),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  updated_at         = now()
where email = 'sportbridge.com.ng@gmail.com';

-- 2. Reset ALL v3 international demo account passwords (50 accounts)
update auth.users
set
  encrypted_password = extensions.crypt('Demo@SportBridge1!', extensions.gen_salt('bf', 10)),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  updated_at         = now()
where email in (
  -- Academies
  'admin@elitelondonfc.demo',
  'info@academie-paris.demo',
  'contact@ghanafinstitute.demo',
  'academy@sportinglisboa.demo',
  'admin@riversunited.demo',
  -- Agents
  'scouting@global-talent.demo',
  'contact@sabridge.demo',
  'info@desertsports.demo',
  'scout@ajaxnetwork.demo',
  'info@wascouts.demo',
  -- Coaches / Managers / Directors
  'carlos.mendes@sportbridge.demo',
  'javier.morales@sportbridge.demo',
  'marco.rossi@sportbridge.demo',
  'emre.demir@sportbridge.demo',
  'sarah.mitchell@sportbridge.demo',
  'nemanja.petrovic@sportbridge.demo',
  -- Sports Analysts
  'sophie.laurent@sportbridge.demo',
  'james.clarke@sportbridge.demo',
  'hiroshi.nakamura@sportbridge.demo',
  'alicia.washington@sportbridge.demo',
  -- Players (28)
  'marcus.thompson@sportbridge.demo',
  'gabriel.santos@sportbridge.demo',
  'antoine.dubois@sportbridge.demo',
  'lukas.muller@sportbridge.demo',
  'kwame.asante@sportbridge.demo',
  'yassine.benali@sportbridge.demo',
  'alejandro.rios@sportbridge.demo',
  'moussa.diallo@sportbridge.demo',
  'kenji.tanaka@sportbridge.demo',
  'jiho.park@sportbridge.demo',
  'diego.hernandez@sportbridge.demo',
  'tyler.jackson@sportbridge.demo',
  'femi.adeyemi@sportbridge.demo',
  'ivan.petrenko@sportbridge.demo',
  'nabil.amrani@sportbridge.demo',
  'edson.reyes@sportbridge.demo',
  'aleksander.jovic@sportbridge.demo',
  'omar.elshenawy@sportbridge.demo',
  'koffi.kouassi@sportbridge.demo',
  'lars.odegaard@sportbridge.demo',
  'joao.costa@sportbridge.demo',
  'amir.shafiei@sportbridge.demo',
  'bernard.owusu@sportbridge.demo',
  'roberto.nunez@sportbridge.demo',
  'takehiro.sato@sportbridge.demo',
  'chukwuemeka.okafor@sportbridge.demo',
  'vladislav.koval@sportbridge.demo',
  'christos.papadopoulos@sportbridge.demo'
);

-- 3. Verify all accounts are confirmed and active
select
  p.email,
  p.role,
  p.verification_status,
  p.status,
  u.email_confirmed_at is not null as confirmed,
  u.encrypted_password is not null as has_password,
  left(u.encrypted_password, 7) as hash_prefix
from auth.users u
join public.profiles p on p.id = u.id
where u.email like '%@sportbridge.demo'
   or u.email like '%@elitelondonfc.demo'
   or u.email like '%@academie-paris.demo'
   or u.email like '%@ghanafinstitute.demo'
   or u.email like '%@sportinglisboa.demo'
   or u.email like '%@riversunited.demo'
   or u.email like '%@global-talent.demo'
   or u.email like '%@sabridge.demo'
   or u.email like '%@desertsports.demo'
   or u.email like '%@ajaxnetwork.demo'
   or u.email like '%@wascouts.demo'
   or u.email = 'sportbridge.com.ng@gmail.com'
order by p.role, p.email;
