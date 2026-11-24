-- =============================================================================
-- STEP 3 of 6 — Coaches + Sports Analysts
-- Password: Demo@SportBridge1!
-- =============================================================================

-- ── 1. Reset passwords for any accounts that already exist ───────────────────
update auth.users
set encrypted_password = extensions.crypt('Demo@SportBridge1!', extensions.gen_salt('bf', 10)),
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at         = now()
where email in (
  'carlos.mendes@sportbridge.demo',   'javier.morales@sportbridge.demo',
  'marco.rossi@sportbridge.demo',     'emre.demir@sportbridge.demo',
  'sarah.mitchell@sportbridge.demo',  'nemanja.petrovic@sportbridge.demo',
  'sophie.laurent@sportbridge.demo',  'james.clarke@sportbridge.demo',
  'hiroshi.nakamura@sportbridge.demo','alicia.washington@sportbridge.demo'
);

-- ── 2. Insert accounts that don't exist yet (uuid cast fixed) ─────────────────
insert into auth.users (
  id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at,
  aud, role, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
select
  v.id::uuid,
  v.email,
  extensions.crypt('Demo@SportBridge1!', extensions.gen_salt('bf',10)),
  now(),
  v.meta::jsonb,
  now() - (v.days || ' days')::interval,
  now(),
  'authenticated','authenticated','','','',''
from (values
  ('11000000-0000-0000-0000-000000000011','carlos.mendes@sportbridge.demo',   '{"full_name":"Carlos Mendes","role":"coach","sport":"football"}',80),
  ('11000000-0000-0000-0000-000000000012','javier.morales@sportbridge.demo',  '{"full_name":"Javier Morales","role":"coach","sport":"football"}',79),
  ('11000000-0000-0000-0000-000000000013','marco.rossi@sportbridge.demo',     '{"full_name":"Marco Rossi","role":"coach","sport":"football"}',78),
  ('11000000-0000-0000-0000-000000000014','emre.demir@sportbridge.demo',      '{"full_name":"Emre Demir","role":"coach","sport":"football"}',77),
  ('11000000-0000-0000-0000-000000000015','sarah.mitchell@sportbridge.demo',  '{"full_name":"Sarah Mitchell","role":"coach","sport":"football"}',76),
  ('11000000-0000-0000-0000-000000000016','nemanja.petrovic@sportbridge.demo','{"full_name":"Nemanja Petrovic","role":"coach","sport":"football"}',75),
  ('11000000-0000-0000-0000-000000000017','sophie.laurent@sportbridge.demo',  '{"full_name":"Sophie Laurent","role":"sports_analyst","sport":"football"}',74),
  ('11000000-0000-0000-0000-000000000018','james.clarke@sportbridge.demo',    '{"full_name":"James Clarke","role":"sports_analyst","sport":"football"}',73),
  ('11000000-0000-0000-0000-000000000019','hiroshi.nakamura@sportbridge.demo','{"full_name":"Hiroshi Nakamura","role":"sports_analyst","sport":"football"}',72),
  ('11000000-0000-0000-0000-000000000020','alicia.washington@sportbridge.demo','{"full_name":"Alicia Washington","role":"sports_analyst","sport":"football"}',71)
) as v(id, email, meta, days)
where not exists (select 1 from auth.users u where u.email = v.email);

-- ── 3. Upsert profiles ────────────────────────────────────────────────────────
insert into public.profiles (id, email, full_name, role, sport, status, verification_status, updated_at)
select u.id, v.email, v.full_name, v.role, 'football', 'active', 'verified', now()
from (values
  ('carlos.mendes@sportbridge.demo',   'Carlos Mendes',    'coach'),
  ('javier.morales@sportbridge.demo',  'Javier Morales',   'coach'),
  ('marco.rossi@sportbridge.demo',     'Marco Rossi',      'coach'),
  ('emre.demir@sportbridge.demo',      'Emre Demir',       'coach'),
  ('sarah.mitchell@sportbridge.demo',  'Sarah Mitchell',   'coach'),
  ('nemanja.petrovic@sportbridge.demo','Nemanja Petrovic',  'coach'),
  ('sophie.laurent@sportbridge.demo',  'Sophie Laurent',   'sports_analyst'),
  ('james.clarke@sportbridge.demo',    'James Clarke',     'sports_analyst'),
  ('hiroshi.nakamura@sportbridge.demo','Hiroshi Nakamura',  'sports_analyst'),
  ('alicia.washington@sportbridge.demo','Alicia Washington','sports_analyst')
) as v(email, full_name, role)
join auth.users u on u.email = v.email
on conflict (id) do update
  set role = excluded.role, status = 'active', verification_status = 'verified', updated_at = now();

-- ── Confirm ───────────────────────────────────────────────────────────────────
select u.email, p.role, p.status, p.verification_status,
       u.email_confirmed_at is not null as email_confirmed,
       left(u.encrypted_password,7) as hash_prefix
from auth.users u
join public.profiles p on p.id = u.id
where u.email in (
  'carlos.mendes@sportbridge.demo',
  'sophie.laurent@sportbridge.demo'
)
order by u.email;
