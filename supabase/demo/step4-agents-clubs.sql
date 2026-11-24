-- =============================================================================
-- STEP 4 of 6 — Agents + Clubs / Academies   Password: Demo@SportBridge1!
-- =============================================================================

-- 1. Reset passwords for accounts that already exist
update auth.users
set encrypted_password = extensions.crypt('Demo@SportBridge1!', extensions.gen_salt('bf', 10)),
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at         = now()
where email in (
  'scouting@global-talent.demo','contact@sabridge.demo',
  'info@desertsports.demo','scout@ajaxnetwork.demo','info@wascouts.demo',
  'admin@elitelondonfc.demo','info@academie-paris.demo',
  'contact@ghanafinstitute.demo','academy@sportinglisboa.demo','admin@riversunited.demo'
);

-- 2. Insert missing accounts one by one (safe — skips if email OR id exists)
do $$
declare
  rows_to_insert record;
begin
  for rows_to_insert in
    select * from (values
      ('11000000-0000-0000-0000-000000000006'::uuid,'scouting@global-talent.demo',    '{"full_name":"Global Talent Agency","role":"agent","sport":"football"}'::jsonb,    85),
      ('11000000-0000-0000-0000-000000000007'::uuid,'contact@sabridge.demo',           '{"full_name":"South American Bridge","role":"agent","sport":"football"}'::jsonb,   84),
      ('11000000-0000-0000-0000-000000000008'::uuid,'info@desertsports.demo',          '{"full_name":"Desert Sports Management","role":"agent","sport":"football"}'::jsonb, 83),
      ('11000000-0000-0000-0000-000000000009'::uuid,'scout@ajaxnetwork.demo',          '{"full_name":"Ajax Talent Network","role":"agent","sport":"football"}'::jsonb,      82),
      ('11000000-0000-0000-0000-000000000010'::uuid,'info@wascouts.demo',              '{"full_name":"West Africa Scouts","role":"agent","sport":"football"}'::jsonb,       81),
      ('11000000-0000-0000-0000-000000000001'::uuid,'admin@elitelondonfc.demo',        '{"full_name":"Elite London FC","role":"academy","sport":"football"}'::jsonb,        90),
      ('11000000-0000-0000-0000-000000000002'::uuid,'info@academie-paris.demo',        '{"full_name":"Academie Nationale Paris","role":"academy","sport":"football"}'::jsonb,89),
      ('11000000-0000-0000-0000-000000000003'::uuid,'contact@ghanafinstitute.demo',    '{"full_name":"Ghana Football Institute","role":"academy","sport":"football"}'::jsonb,88),
      ('11000000-0000-0000-0000-000000000004'::uuid,'academy@sportinglisboa.demo',     '{"full_name":"Sporting Lisboa Academy","role":"academy","sport":"football"}'::jsonb, 87),
      ('11000000-0000-0000-0000-000000000005'::uuid,'admin@riversunited.demo',         '{"full_name":"Rivers United Academy","role":"academy","sport":"football"}'::jsonb,   86)
    ) as t(uid, email, meta, days)
    where not exists (select 1 from auth.users x where x.id = t.uid)
      and not exists (select 1 from auth.users x where x.email = t.email)
  loop
    insert into auth.users (
      id, email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, created_at, updated_at,
      aud, role, confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      rows_to_insert.uid,
      rows_to_insert.email,
      extensions.crypt('Demo@SportBridge1!', extensions.gen_salt('bf',10)),
      now(),
      rows_to_insert.meta,
      now() - (rows_to_insert.days || ' days')::interval,
      now(),
      'authenticated','authenticated','','','',''
    );
  end loop;
end $$;

-- 3. Upsert profiles (join by email — works with any uuid)
insert into public.profiles (id, email, full_name, role, sport, status, verification_status, updated_at)
select u.id, v.email, v.full_name, v.role, 'football', 'active', 'verified', now()
from (values
  ('scouting@global-talent.demo',    'Global Talent Agency',    'agent'),
  ('contact@sabridge.demo',           'South American Bridge',   'agent'),
  ('info@desertsports.demo',          'Desert Sports Management','agent'),
  ('scout@ajaxnetwork.demo',          'Ajax Talent Network',     'agent'),
  ('info@wascouts.demo',              'West Africa Scouts',      'agent'),
  ('admin@elitelondonfc.demo',        'Elite London FC',         'academy'),
  ('info@academie-paris.demo',        'Academie Nationale Paris','academy'),
  ('contact@ghanafinstitute.demo',    'Ghana Football Institute','academy'),
  ('academy@sportinglisboa.demo',     'Sporting Lisboa Academy', 'academy'),
  ('admin@riversunited.demo',         'Rivers United Academy',   'academy')
) as v(email, full_name, role)
join auth.users u on u.email = v.email
on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      role = excluded.role,
      sport = excluded.sport,
      status = 'active',
      verification_status = 'verified',
      updated_at = now();

-- 4. Club records
insert into public.clubs (id, name, owner_id, created_at, updated_at)
select gen_random_uuid(), v.name, u.id, now(), now()
from (values
  ('admin@elitelondonfc.demo',     'Elite London FC'),
  ('info@academie-paris.demo',     'Academie Nationale Paris'),
  ('contact@ghanafinstitute.demo', 'Ghana Football Institute'),
  ('academy@sportinglisboa.demo',  'Sporting Lisboa Academy'),
  ('admin@riversunited.demo',      'Rivers United Academy')
) as v(email, name)
join auth.users u on u.email = v.email
where not exists (select 1 from public.clubs c where c.owner_id = u.id);

-- Confirm
select u.email, p.role, p.status, p.verification_status,
       u.email_confirmed_at is not null as email_confirmed,
       left(u.encrypted_password,7) as hash_prefix
from auth.users u join public.profiles p on p.id = u.id
where u.email in ('scouting@global-talent.demo','admin@elitelondonfc.demo','contact@ghanafinstitute.demo','admin@riversunited.demo')
order by u.email;
