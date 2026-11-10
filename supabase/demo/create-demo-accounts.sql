-- =============================================================================
-- SportBridge — create-demo-accounts.sql
-- Creates all 50 demo auth.users from scratch (safe to re-run)
-- Password for all: Demo@SportBridge1!
-- Admin password:   SportBridge2026!
-- =============================================================================
create extension if not exists pgcrypto;

-- ─── INSERT auth users (skips existing by both id AND email) ──────────────────
do $$
declare r record;
begin
  for r in select * from (values
    -- Academies / Clubs
    ('11000000-0000-0000-0000-000000000001'::uuid,'admin@elitelondonfc.demo',        '{"full_name":"Elite London FC","role":"academy","sport":"football"}'::jsonb,         90,'Demo@SportBridge1!'),
    ('11000000-0000-0000-0000-000000000002'::uuid,'info@academie-paris.demo',         '{"full_name":"Academie Nationale Paris","role":"academy","sport":"football"}'::jsonb, 89,'Demo@SportBridge1!'),
    ('11000000-0000-0000-0000-000000000003'::uuid,'contact@ghanafinstitute.demo',     '{"full_name":"Ghana Football Institute","role":"academy","sport":"football"}'::jsonb,  88,'Demo@SportBridge1!'),
    ('11000000-0000-0000-0000-000000000004'::uuid,'academy@sportinglisboa.demo',      '{"full_name":"Sporting Lisboa Academy","role":"academy","sport":"football"}'::jsonb,   87,'Demo@SportBridge1!'),
    ('11000000-0000-0000-0000-000000000005'::uuid,'admin@riversunited.demo',          '{"full_name":"Rivers United Academy","role":"academy","sport":"football"}'::jsonb,     86,'Demo@SportBridge1!'),
    -- Agents
    ('11000000-0000-0000-0000-000000000006'::uuid,'scouting@global-talent.demo',      '{"full_name":"Global Talent Agency","role":"agent","sport":"football"}'::jsonb,       85,'Demo@SportBridge1!'),
    ('11000000-0000-0000-0000-000000000007'::uuid,'contact@sabridge.demo',            '{"full_name":"South American Bridge","role":"agent","sport":"football"}'::jsonb,      84,'Demo@SportBridge1!'),
    ('11000000-0000-0000-0000-000000000008'::uuid,'info@desertsports.demo',           '{"full_name":"Desert Sports Management","role":"agent","sport":"football"}'::jsonb,   83,'Demo@SportBridge1!'),
    ('11000000-0000-0000-0000-000000000009'::uuid,'scout@ajaxnetwork.demo',           '{"full_name":"Ajax Talent Network","role":"agent","sport":"football"}'::jsonb,        82,'Demo@SportBridge1!'),
    ('11000000-0000-0000-0000-000000000010'::uuid,'info@wascouts.demo',               '{"full_name":"West Africa Scouts","role":"agent","sport":"football"}'::jsonb,         81,'Demo@SportBridge1!'),
    -- Coaches
    ('11000000-0000-0000-0000-000000000011'::uuid,'carlos.mendes@sportbridge.demo',   '{"full_name":"Carlos Mendes","role":"coach","sport":"football"}'::jsonb,              80,'Demo@SportBridge1!'),
    ('11000000-0000-0000-0000-000000000012'::uuid,'javier.morales@sportbridge.demo',  '{"full_name":"Javier Morales","role":"coach","sport":"football"}'::jsonb,             79,'Demo@SportBridge1!'),
    ('11000000-0000-0000-0000-000000000013'::uuid,'marco.rossi@sportbridge.demo',     '{"full_name":"Marco Rossi","role":"coach","sport":"football"}'::jsonb,                78,'Demo@SportBridge1!'),
    ('11000000-0000-0000-0000-000000000014'::uuid,'emre.demir@sportbridge.demo',      '{"full_name":"Emre Demir","role":"coach","sport":"football"}'::jsonb,                 77,'Demo@SportBridge1!'),
    ('11000000-0000-0000-0000-000000000015'::uuid,'sarah.mitchell@sportbridge.demo',  '{"full_name":"Sarah Mitchell","role":"coach","sport":"football"}'::jsonb,             76,'Demo@SportBridge1!'),
    ('11000000-0000-0000-0000-000000000016'::uuid,'nemanja.petrovic@sportbridge.demo','{"full_name":"Nemanja Petrovic","role":"coach","sport":"football"}'::jsonb,            75,'Demo@SportBridge1!'),
    -- Sports Analysts
    ('11000000-0000-0000-0000-000000000017'::uuid,'sophie.laurent@sportbridge.demo',  '{"full_name":"Sophie Laurent","role":"sports_analyst","sport":"football"}'::jsonb,    74,'Demo@SportBridge1!'),
    ('11000000-0000-0000-0000-000000000018'::uuid,'james.clarke@sportbridge.demo',    '{"full_name":"James Clarke","role":"sports_analyst","sport":"football"}'::jsonb,      73,'Demo@SportBridge1!'),
    ('11000000-0000-0000-0000-000000000019'::uuid,'hiroshi.nakamura@sportbridge.demo','{"full_name":"Hiroshi Nakamura","role":"sports_analyst","sport":"football"}'::jsonb,   72,'Demo@SportBridge1!'),
    ('11000000-0000-0000-0000-000000000020'::uuid,'alicia.washington@sportbridge.demo','{"full_name":"Alicia Washington","role":"sports_analyst","sport":"football"}'::jsonb,71,'Demo@SportBridge1!'),
    -- Players
    ('22000000-0000-0000-0000-000000000001'::uuid,'marcus.thompson@sportbridge.demo', '{"full_name":"Marcus Thompson","role":"player","sport":"football"}'::jsonb,            70,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000002'::uuid,'gabriel.santos@sportbridge.demo',  '{"full_name":"Gabriel Santos","role":"player","sport":"football"}'::jsonb,             69,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000003'::uuid,'antoine.dubois@sportbridge.demo',  '{"full_name":"Antoine Dubois","role":"player","sport":"football"}'::jsonb,             68,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000004'::uuid,'lukas.muller@sportbridge.demo',    '{"full_name":"Lukas Muller","role":"player","sport":"football"}'::jsonb,               67,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000005'::uuid,'kwame.asante@sportbridge.demo',    '{"full_name":"Kwame Asante","role":"player","sport":"football"}'::jsonb,               66,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000006'::uuid,'yassine.benali@sportbridge.demo',  '{"full_name":"Yassine Benali","role":"player","sport":"football"}'::jsonb,             65,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000007'::uuid,'alejandro.rios@sportbridge.demo',  '{"full_name":"Alejandro Rios","role":"player","sport":"football"}'::jsonb,             64,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000008'::uuid,'moussa.diallo@sportbridge.demo',   '{"full_name":"Moussa Diallo","role":"player","sport":"football"}'::jsonb,              63,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000009'::uuid,'kenji.tanaka@sportbridge.demo',    '{"full_name":"Kenji Tanaka","role":"player","sport":"football"}'::jsonb,               62,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000010'::uuid,'jiho.park@sportbridge.demo',       '{"full_name":"Ji-Ho Park","role":"player","sport":"football"}'::jsonb,                 61,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000011'::uuid,'diego.hernandez@sportbridge.demo', '{"full_name":"Diego Hernandez","role":"player","sport":"football"}'::jsonb,            60,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000012'::uuid,'tyler.jackson@sportbridge.demo',   '{"full_name":"Tyler Jackson","role":"player","sport":"football"}'::jsonb,              59,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000013'::uuid,'femi.adeyemi@sportbridge.demo',    '{"full_name":"Femi Adeyemi","role":"player","sport":"football"}'::jsonb,               58,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000014'::uuid,'ivan.petrenko@sportbridge.demo',   '{"full_name":"Ivan Petrenko","role":"player","sport":"football"}'::jsonb,              57,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000015'::uuid,'nabil.amrani@sportbridge.demo',    '{"full_name":"Nabil Amrani","role":"player","sport":"football"}'::jsonb,               56,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000016'::uuid,'edson.reyes@sportbridge.demo',     '{"full_name":"Edson Reyes","role":"player","sport":"football"}'::jsonb,                55,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000017'::uuid,'aleksander.jovic@sportbridge.demo','{"full_name":"Aleksander Jovic","role":"player","sport":"football"}'::jsonb,            54,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000018'::uuid,'omar.elshenawy@sportbridge.demo',  '{"full_name":"Omar El-Shenawy","role":"player","sport":"football"}'::jsonb,            53,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000019'::uuid,'koffi.kouassi@sportbridge.demo',   '{"full_name":"Koffi Kouassi","role":"player","sport":"football"}'::jsonb,              52,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000020'::uuid,'lars.odegaard@sportbridge.demo',   '{"full_name":"Lars Odegaard","role":"player","sport":"football"}'::jsonb,              51,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000021'::uuid,'joao.costa@sportbridge.demo',      '{"full_name":"Joao Costa","role":"player","sport":"football"}'::jsonb,                 50,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000022'::uuid,'amir.shafiei@sportbridge.demo',    '{"full_name":"Amir Shafiei","role":"player","sport":"football"}'::jsonb,               49,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000023'::uuid,'bernard.owusu@sportbridge.demo',   '{"full_name":"Bernard Owusu","role":"player","sport":"football"}'::jsonb,              48,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000024'::uuid,'roberto.nunez@sportbridge.demo',   '{"full_name":"Roberto Nunez","role":"player","sport":"football"}'::jsonb,              47,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000025'::uuid,'takehiro.sato@sportbridge.demo',   '{"full_name":"Takehiro Sato","role":"player","sport":"football"}'::jsonb,              46,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000026'::uuid,'chukwuemeka.okafor@sportbridge.demo','{"full_name":"Chukwuemeka Okafor","role":"player","sport":"football"}'::jsonb,       45,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000027'::uuid,'vladislav.koval@sportbridge.demo', '{"full_name":"Vladislav Koval","role":"player","sport":"football"}'::jsonb,            44,'Demo@SportBridge1!'),
    ('22000000-0000-0000-0000-000000000028'::uuid,'christos.papadopoulos@sportbridge.demo','{"full_name":"Christos Papadopoulos","role":"player","sport":"football"}'::jsonb, 43,'Demo@SportBridge1!')
  ) as t(uid, email, meta, days, pw)
  where not exists (select 1 from auth.users x where x.id  = t.uid)
    and not exists (select 1 from auth.users x where x.email = t.email)
  loop
    insert into auth.users (
      id, email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, created_at, updated_at,
      aud, role, confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      r.uid, r.email,
      extensions.crypt(r.pw, extensions.gen_salt('bf',10)),
      now(), r.meta,
      now() - (r.days || ' days')::interval, now(),
      'authenticated','authenticated','','','',''
    );
  end loop;
end $$;

-- ─── UPDATE existing users: reset passwords + confirm emails ──────────────────
update auth.users
set encrypted_password = extensions.crypt('Demo@SportBridge1!', extensions.gen_salt('bf',10)),
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at = now()
where email like '%@sportbridge.demo'
   or email like '%@elitelondonfc.demo'
   or email like '%@academie-paris.demo'
   or email like '%@ghanafinstitute.demo'
   or email like '%@sportinglisboa.demo'
   or email like '%@riversunited.demo'
   or email like '%@global-talent.demo'
   or email like '%@sabridge.demo'
   or email like '%@desertsports.demo'
   or email like '%@ajaxnetwork.demo'
   or email like '%@wascouts.demo';

-- ─── UPSERT profiles ──────────────────────────────────────────────────────────
insert into public.profiles (id, email, full_name, role, sport, status, verification_status, updated_at)
select u.id, v.email, v.full_name, v.role, 'football', 'active', 'verified', now()
from (values
  ('admin@elitelondonfc.demo',         'Elite London FC',          'academy'),
  ('info@academie-paris.demo',         'Academie Nationale Paris', 'academy'),
  ('contact@ghanafinstitute.demo',     'Ghana Football Institute', 'academy'),
  ('academy@sportinglisboa.demo',      'Sporting Lisboa Academy',  'academy'),
  ('admin@riversunited.demo',          'Rivers United Academy',    'academy'),
  ('scouting@global-talent.demo',      'Global Talent Agency',     'agent'),
  ('contact@sabridge.demo',            'South American Bridge',    'agent'),
  ('info@desertsports.demo',           'Desert Sports Management', 'agent'),
  ('scout@ajaxnetwork.demo',           'Ajax Talent Network',      'agent'),
  ('info@wascouts.demo',               'West Africa Scouts',       'agent'),
  ('carlos.mendes@sportbridge.demo',   'Carlos Mendes',            'coach'),
  ('javier.morales@sportbridge.demo',  'Javier Morales',           'coach'),
  ('marco.rossi@sportbridge.demo',     'Marco Rossi',              'coach'),
  ('emre.demir@sportbridge.demo',      'Emre Demir',               'coach'),
  ('sarah.mitchell@sportbridge.demo',  'Sarah Mitchell',           'coach'),
  ('nemanja.petrovic@sportbridge.demo','Nemanja Petrovic',          'coach'),
  ('sophie.laurent@sportbridge.demo',  'Sophie Laurent',           'sports_analyst'),
  ('james.clarke@sportbridge.demo',    'James Clarke',             'sports_analyst'),
  ('hiroshi.nakamura@sportbridge.demo','Hiroshi Nakamura',          'sports_analyst'),
  ('alicia.washington@sportbridge.demo','Alicia Washington',       'sports_analyst'),
  ('marcus.thompson@sportbridge.demo', 'Marcus Thompson',          'player'),
  ('gabriel.santos@sportbridge.demo',  'Gabriel Santos',           'player'),
  ('antoine.dubois@sportbridge.demo',  'Antoine Dubois',           'player'),
  ('lukas.muller@sportbridge.demo',    'Lukas Muller',             'player'),
  ('kwame.asante@sportbridge.demo',    'Kwame Asante',             'player'),
  ('yassine.benali@sportbridge.demo',  'Yassine Benali',           'player'),
  ('alejandro.rios@sportbridge.demo',  'Alejandro Rios',           'player'),
  ('moussa.diallo@sportbridge.demo',   'Moussa Diallo',            'player'),
  ('kenji.tanaka@sportbridge.demo',    'Kenji Tanaka',             'player'),
  ('jiho.park@sportbridge.demo',       'Ji-Ho Park',               'player'),
  ('diego.hernandez@sportbridge.demo', 'Diego Hernandez',          'player'),
  ('tyler.jackson@sportbridge.demo',   'Tyler Jackson',            'player'),
  ('femi.adeyemi@sportbridge.demo',    'Femi Adeyemi',             'player'),
  ('ivan.petrenko@sportbridge.demo',   'Ivan Petrenko',            'player'),
  ('nabil.amrani@sportbridge.demo',    'Nabil Amrani',             'player'),
  ('edson.reyes@sportbridge.demo',     'Edson Reyes',              'player'),
  ('aleksander.jovic@sportbridge.demo','Aleksander Jovic',          'player'),
  ('omar.elshenawy@sportbridge.demo',  'Omar El-Shenawy',          'player'),
  ('koffi.kouassi@sportbridge.demo',   'Koffi Kouassi',            'player'),
  ('lars.odegaard@sportbridge.demo',   'Lars Odegaard',            'player'),
  ('joao.costa@sportbridge.demo',      'Joao Costa',               'player'),
  ('amir.shafiei@sportbridge.demo',    'Amir Shafiei',             'player'),
  ('bernard.owusu@sportbridge.demo',   'Bernard Owusu',            'player'),
  ('roberto.nunez@sportbridge.demo',   'Roberto Nunez',            'player'),
  ('takehiro.sato@sportbridge.demo',   'Takehiro Sato',            'player'),
  ('chukwuemeka.okafor@sportbridge.demo','Chukwuemeka Okafor',      'player'),
  ('vladislav.koval@sportbridge.demo', 'Vladislav Koval',          'player'),
  ('christos.papadopoulos@sportbridge.demo','Christos Papadopoulos','player')
) as v(email, full_name, role)
join auth.users u on u.email = v.email
on conflict (id) do update
  set role = excluded.role, status = 'active', verification_status = 'verified', updated_at = now();

-- ─── Ensure player rows exist ──────────────────────────────────────────────────
insert into public.players (profile_id, display_name, position, age, country, sport, status, is_public, availability, created_at)
select u.id, v.dn, v.pos, v.age, v.cty, 'football', 'active', true, 'available_now', now()
from (values
  ('marcus.thompson@sportbridge.demo',       'Marcus Thompson',       'Striker',             21,'England'),
  ('gabriel.santos@sportbridge.demo',        'Gabriel Santos',        'Central Midfielder',  23,'Brazil'),
  ('antoine.dubois@sportbridge.demo',        'Antoine Dubois',        'Goalkeeper',          24,'France'),
  ('lukas.muller@sportbridge.demo',          'Lukas Muller',          'Centre-Back',         25,'Germany'),
  ('kwame.asante@sportbridge.demo',          'Kwame Asante',          'Right Winger',        20,'Ghana'),
  ('yassine.benali@sportbridge.demo',        'Yassine Benali',        'Defensive Midfielder',22,'Morocco'),
  ('alejandro.rios@sportbridge.demo',        'Alejandro Rios',        'Striker',             24,'Argentina'),
  ('moussa.diallo@sportbridge.demo',         'Moussa Diallo',         'Left-Back',           23,'Senegal'),
  ('kenji.tanaka@sportbridge.demo',          'Kenji Tanaka',          'Central Midfielder',  22,'Japan'),
  ('jiho.park@sportbridge.demo',             'Ji-Ho Park',            'Right Winger',        21,'South Korea'),
  ('diego.hernandez@sportbridge.demo',       'Diego Hernandez',       'Central Midfielder',  25,'Spain'),
  ('tyler.jackson@sportbridge.demo',         'Tyler Jackson',         'Striker',             23,'USA'),
  ('femi.adeyemi@sportbridge.demo',          'Femi Adeyemi',          'Attacking Midfielder',21,'Nigeria'),
  ('ivan.petrenko@sportbridge.demo',         'Ivan Petrenko',         'Centre-Back',         24,'Ukraine'),
  ('nabil.amrani@sportbridge.demo',          'Nabil Amrani',          'Left Winger',         22,'Algeria'),
  ('edson.reyes@sportbridge.demo',           'Edson Reyes',           'Defensive Midfielder',23,'Mexico'),
  ('aleksander.jovic@sportbridge.demo',      'Aleksander Jovic',      'Striker',             22,'Serbia'),
  ('omar.elshenawy@sportbridge.demo',        'Omar El-Shenawy',       'Right Winger',        21,'Egypt'),
  ('koffi.kouassi@sportbridge.demo',         'Koffi Kouassi',         'Striker',             23,'Ivory Coast'),
  ('lars.odegaard@sportbridge.demo',         'Lars Odegaard',         'Striker',             22,'Norway'),
  ('joao.costa@sportbridge.demo',            'Joao Costa',            'Left-Back',           22,'Portugal'),
  ('amir.shafiei@sportbridge.demo',          'Amir Shafiei',          'Goalkeeper',          24,'Iran'),
  ('bernard.owusu@sportbridge.demo',         'Bernard Owusu',         'Central Midfielder',  22,'Ghana'),
  ('roberto.nunez@sportbridge.demo',         'Roberto Nunez',         'Second Striker',      22,'Colombia'),
  ('takehiro.sato@sportbridge.demo',         'Takehiro Sato',         'Right-Back',          21,'Japan'),
  ('chukwuemeka.okafor@sportbridge.demo',    'Chukwuemeka Okafor',    'Striker',             21,'Nigeria'),
  ('vladislav.koval@sportbridge.demo',       'Vladislav Koval',       'Centre-Back',         23,'Ukraine'),
  ('christos.papadopoulos@sportbridge.demo', 'Christos Papadopoulos', 'Central Midfielder',  24,'Greece')
) as v(email, dn, pos, age, cty)
join auth.users u on u.email = v.email
where not exists (select 1 from public.players p where p.profile_id = u.id);

update public.players pl set status='active', is_public=true
from auth.users u where pl.profile_id=u.id and u.email like '%@sportbridge.demo';

-- ─── Verification check ───────────────────────────────────────────────────────
select u.email,
       p.role,
       p.status,
       p.verification_status,
       u.email_confirmed_at is not null as confirmed,
       left(u.encrypted_password,7)     as hash_prefix
from auth.users u
join public.profiles p on p.id = u.id
where u.email in (
  'carlos.mendes@sportbridge.demo',
  'sophie.laurent@sportbridge.demo',
  'scouting@global-talent.demo',
  'admin@elitelondonfc.demo',
  'marcus.thompson@sportbridge.demo'
)
order by u.email;
