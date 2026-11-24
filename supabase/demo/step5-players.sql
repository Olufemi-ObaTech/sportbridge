-- STEP 5 of 6 — Players (28 accounts)  Password: Demo@SportBridge1!

-- 1. Reset passwords for all player accounts that already exist
update auth.users
set encrypted_password = extensions.crypt('Demo@SportBridge1!', extensions.gen_salt('bf', 10)),
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at = now()
where email in (
  'marcus.thompson@sportbridge.demo','gabriel.santos@sportbridge.demo',
  'antoine.dubois@sportbridge.demo','lukas.muller@sportbridge.demo',
  'kwame.asante@sportbridge.demo','yassine.benali@sportbridge.demo',
  'alejandro.rios@sportbridge.demo','moussa.diallo@sportbridge.demo',
  'kenji.tanaka@sportbridge.demo','jiho.park@sportbridge.demo',
  'diego.hernandez@sportbridge.demo','tyler.jackson@sportbridge.demo',
  'femi.adeyemi@sportbridge.demo','ivan.petrenko@sportbridge.demo',
  'nabil.amrani@sportbridge.demo','edson.reyes@sportbridge.demo',
  'aleksander.jovic@sportbridge.demo','omar.elshenawy@sportbridge.demo',
  'koffi.kouassi@sportbridge.demo','lars.odegaard@sportbridge.demo',
  'joao.costa@sportbridge.demo','amir.shafiei@sportbridge.demo',
  'bernard.owusu@sportbridge.demo','roberto.nunez@sportbridge.demo',
  'takehiro.sato@sportbridge.demo','chukwuemeka.okafor@sportbridge.demo',
  'vladislav.koval@sportbridge.demo','christos.papadopoulos@sportbridge.demo'
);

-- 2. Insert missing accounts using DO block (skips if id OR email already exists)
do $$
declare r record;
begin
  for r in select * from (values
    ('22000000-0000-0000-0000-000000000001'::uuid,'marcus.thompson@sportbridge.demo',
     '{"full_name":"Marcus Thompson","role":"player","sport":"football"}'::jsonb,70),
    ('22000000-0000-0000-0000-000000000002'::uuid,'gabriel.santos@sportbridge.demo',
     '{"full_name":"Gabriel Santos","role":"player","sport":"football"}'::jsonb,69),
    ('22000000-0000-0000-0000-000000000003'::uuid,'antoine.dubois@sportbridge.demo',
     '{"full_name":"Antoine Dubois","role":"player","sport":"football"}'::jsonb,68),
    ('22000000-0000-0000-0000-000000000004'::uuid,'lukas.muller@sportbridge.demo',
     '{"full_name":"Lukas Muller","role":"player","sport":"football"}'::jsonb,67),
    ('22000000-0000-0000-0000-000000000005'::uuid,'kwame.asante@sportbridge.demo',
     '{"full_name":"Kwame Asante","role":"player","sport":"football"}'::jsonb,66),
    ('22000000-0000-0000-0000-000000000006'::uuid,'yassine.benali@sportbridge.demo',
     '{"full_name":"Yassine Benali","role":"player","sport":"football"}'::jsonb,65),
    ('22000000-0000-0000-0000-000000000007'::uuid,'alejandro.rios@sportbridge.demo',
     '{"full_name":"Alejandro Rios","role":"player","sport":"football"}'::jsonb,64),
    ('22000000-0000-0000-0000-000000000008'::uuid,'moussa.diallo@sportbridge.demo',
     '{"full_name":"Moussa Diallo","role":"player","sport":"football"}'::jsonb,63),
    ('22000000-0000-0000-0000-000000000009'::uuid,'kenji.tanaka@sportbridge.demo',
     '{"full_name":"Kenji Tanaka","role":"player","sport":"football"}'::jsonb,62),
    ('22000000-0000-0000-0000-000000000010'::uuid,'jiho.park@sportbridge.demo',
     '{"full_name":"Ji-Ho Park","role":"player","sport":"football"}'::jsonb,61),
    ('22000000-0000-0000-0000-000000000011'::uuid,'diego.hernandez@sportbridge.demo',
     '{"full_name":"Diego Hernandez","role":"player","sport":"football"}'::jsonb,60),
    ('22000000-0000-0000-0000-000000000012'::uuid,'tyler.jackson@sportbridge.demo',
     '{"full_name":"Tyler Jackson","role":"player","sport":"football"}'::jsonb,59),
    ('22000000-0000-0000-0000-000000000013'::uuid,'femi.adeyemi@sportbridge.demo',
     '{"full_name":"Femi Adeyemi","role":"player","sport":"football"}'::jsonb,58),
    ('22000000-0000-0000-0000-000000000014'::uuid,'ivan.petrenko@sportbridge.demo',
     '{"full_name":"Ivan Petrenko","role":"player","sport":"football"}'::jsonb,57),
    ('22000000-0000-0000-0000-000000000015'::uuid,'nabil.amrani@sportbridge.demo',
     '{"full_name":"Nabil Amrani","role":"player","sport":"football"}'::jsonb,56),
    ('22000000-0000-0000-0000-000000000016'::uuid,'edson.reyes@sportbridge.demo',
     '{"full_name":"Edson Reyes","role":"player","sport":"football"}'::jsonb,55),
    ('22000000-0000-0000-0000-000000000017'::uuid,'aleksander.jovic@sportbridge.demo',
     '{"full_name":"Aleksander Jovic","role":"player","sport":"football"}'::jsonb,54),
    ('22000000-0000-0000-0000-000000000018'::uuid,'omar.elshenawy@sportbridge.demo',
     '{"full_name":"Omar El-Shenawy","role":"player","sport":"football"}'::jsonb,53),
    ('22000000-0000-0000-0000-000000000019'::uuid,'koffi.kouassi@sportbridge.demo',
     '{"full_name":"Koffi Kouassi","role":"player","sport":"football"}'::jsonb,52),
    ('22000000-0000-0000-0000-000000000020'::uuid,'lars.odegaard@sportbridge.demo',
     '{"full_name":"Lars Odegaard","role":"player","sport":"football"}'::jsonb,51),
    ('22000000-0000-0000-0000-000000000021'::uuid,'joao.costa@sportbridge.demo',
     '{"full_name":"Joao Costa","role":"player","sport":"football"}'::jsonb,50),
    ('22000000-0000-0000-0000-000000000022'::uuid,'amir.shafiei@sportbridge.demo',
     '{"full_name":"Amir Shafiei","role":"player","sport":"football"}'::jsonb,49),
    ('22000000-0000-0000-0000-000000000023'::uuid,'bernard.owusu@sportbridge.demo',
     '{"full_name":"Bernard Owusu","role":"player","sport":"football"}'::jsonb,48),
    ('22000000-0000-0000-0000-000000000024'::uuid,'roberto.nunez@sportbridge.demo',
     '{"full_name":"Roberto Nunez","role":"player","sport":"football"}'::jsonb,47),
    ('22000000-0000-0000-0000-000000000025'::uuid,'takehiro.sato@sportbridge.demo',
     '{"full_name":"Takehiro Sato","role":"player","sport":"football"}'::jsonb,46),
    ('22000000-0000-0000-0000-000000000026'::uuid,'chukwuemeka.okafor@sportbridge.demo',
     '{"full_name":"Chukwuemeka Okafor","role":"player","sport":"football"}'::jsonb,45),
    ('22000000-0000-0000-0000-000000000027'::uuid,'vladislav.koval@sportbridge.demo',
     '{"full_name":"Vladislav Koval","role":"player","sport":"football"}'::jsonb,44),
    ('22000000-0000-0000-0000-000000000028'::uuid,'christos.papadopoulos@sportbridge.demo',
     '{"full_name":"Christos Papadopoulos","role":"player","sport":"football"}'::jsonb,43)
  ) as t(uid, email, meta, days)
  where not exists (select 1 from auth.users x where x.id = t.uid)
    and not exists (select 1 from auth.users x where x.email = t.email)
  loop
    insert into auth.users (
      id, email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, created_at, updated_at,
      aud, role, confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      r.uid, r.email,
      extensions.crypt('Demo@SportBridge1!', extensions.gen_salt('bf',10)),
      now(), r.meta,
      now() - (r.days || ' days')::interval, now(),
      'authenticated','authenticated','','','',''
    );
  end loop;
end $$;

-- 3. Upsert profiles
insert into public.profiles (id, email, full_name, role, sport, status, verification_status, updated_at)
select u.id, v.email, v.full_name, 'player', 'football', 'active', 'verified', now()
from (values
  ('marcus.thompson@sportbridge.demo','Marcus Thompson'),
  ('gabriel.santos@sportbridge.demo','Gabriel Santos'),
  ('antoine.dubois@sportbridge.demo','Antoine Dubois'),
  ('lukas.muller@sportbridge.demo','Lukas Muller'),
  ('kwame.asante@sportbridge.demo','Kwame Asante'),
  ('yassine.benali@sportbridge.demo','Yassine Benali'),
  ('alejandro.rios@sportbridge.demo','Alejandro Rios'),
  ('moussa.diallo@sportbridge.demo','Moussa Diallo'),
  ('kenji.tanaka@sportbridge.demo','Kenji Tanaka'),
  ('jiho.park@sportbridge.demo','Ji-Ho Park'),
  ('diego.hernandez@sportbridge.demo','Diego Hernandez'),
  ('tyler.jackson@sportbridge.demo','Tyler Jackson'),
  ('femi.adeyemi@sportbridge.demo','Femi Adeyemi'),
  ('ivan.petrenko@sportbridge.demo','Ivan Petrenko'),
  ('nabil.amrani@sportbridge.demo','Nabil Amrani'),
  ('edson.reyes@sportbridge.demo','Edson Reyes'),
  ('aleksander.jovic@sportbridge.demo','Aleksander Jovic'),
  ('omar.elshenawy@sportbridge.demo','Omar El-Shenawy'),
  ('koffi.kouassi@sportbridge.demo','Koffi Kouassi'),
  ('lars.odegaard@sportbridge.demo','Lars Odegaard'),
  ('joao.costa@sportbridge.demo','Joao Costa'),
  ('amir.shafiei@sportbridge.demo','Amir Shafiei'),
  ('bernard.owusu@sportbridge.demo','Bernard Owusu'),
  ('roberto.nunez@sportbridge.demo','Roberto Nunez'),
  ('takehiro.sato@sportbridge.demo','Takehiro Sato'),
  ('chukwuemeka.okafor@sportbridge.demo','Chukwuemeka Okafor'),
  ('vladislav.koval@sportbridge.demo','Vladislav Koval'),
  ('christos.papadopoulos@sportbridge.demo','Christos Papadopoulos')
) as v(email, full_name)
join auth.users u on u.email = v.email
on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      role = excluded.role,
      sport = excluded.sport,
      status = 'active',
      verification_status = 'verified',
      updated_at = now();

-- 4. Create missing player rows
insert into public.players (profile_id, display_name, position, age, country, sport, status, is_public, availability, created_at)
select u.id, v.dn, v.pos, v.age, v.cty, 'football', 'active', true, 'available_now', now()
from (values
  ('marcus.thompson@sportbridge.demo','Marcus Thompson','Striker',21,'England'),
  ('gabriel.santos@sportbridge.demo','Gabriel Santos','Central Midfielder',23,'Brazil'),
  ('antoine.dubois@sportbridge.demo','Antoine Dubois','Goalkeeper',24,'France'),
  ('lukas.muller@sportbridge.demo','Lukas Muller','Centre-Back',25,'Germany'),
  ('kwame.asante@sportbridge.demo','Kwame Asante','Right Winger',20,'Ghana'),
  ('yassine.benali@sportbridge.demo','Yassine Benali','Defensive Midfielder',22,'Morocco'),
  ('alejandro.rios@sportbridge.demo','Alejandro Rios','Striker',24,'Argentina'),
  ('moussa.diallo@sportbridge.demo','Moussa Diallo','Left-Back',23,'Senegal'),
  ('kenji.tanaka@sportbridge.demo','Kenji Tanaka','Central Midfielder',22,'Japan'),
  ('jiho.park@sportbridge.demo','Ji-Ho Park','Right Winger',21,'South Korea'),
  ('diego.hernandez@sportbridge.demo','Diego Hernandez','Central Midfielder',25,'Spain'),
  ('tyler.jackson@sportbridge.demo','Tyler Jackson','Striker',23,'USA'),
  ('femi.adeyemi@sportbridge.demo','Femi Adeyemi','Attacking Midfielder',21,'Nigeria'),
  ('ivan.petrenko@sportbridge.demo','Ivan Petrenko','Centre-Back',24,'Ukraine'),
  ('nabil.amrani@sportbridge.demo','Nabil Amrani','Left Winger',22,'Algeria'),
  ('edson.reyes@sportbridge.demo','Edson Reyes','Defensive Midfielder',23,'Mexico'),
  ('aleksander.jovic@sportbridge.demo','Aleksander Jovic','Striker',22,'Serbia'),
  ('omar.elshenawy@sportbridge.demo','Omar El-Shenawy','Right Winger',21,'Egypt'),
  ('koffi.kouassi@sportbridge.demo','Koffi Kouassi','Striker',23,'Ivory Coast'),
  ('lars.odegaard@sportbridge.demo','Lars Odegaard','Striker',22,'Norway'),
  ('joao.costa@sportbridge.demo','Joao Costa','Left-Back',22,'Portugal'),
  ('amir.shafiei@sportbridge.demo','Amir Shafiei','Goalkeeper',24,'Iran'),
  ('bernard.owusu@sportbridge.demo','Bernard Owusu','Central Midfielder',22,'Ghana'),
  ('roberto.nunez@sportbridge.demo','Roberto Nunez','Second Striker',22,'Colombia'),
  ('takehiro.sato@sportbridge.demo','Takehiro Sato','Right-Back',21,'Japan'),
  ('chukwuemeka.okafor@sportbridge.demo','Chukwuemeka Okafor','Striker',21,'Nigeria'),
  ('vladislav.koval@sportbridge.demo','Vladislav Koval','Centre-Back',23,'Ukraine'),
  ('christos.papadopoulos@sportbridge.demo','Christos Papadopoulos','Central Midfielder',24,'Greece')
) as v(email, dn, pos, age, cty)
join auth.users u on u.email = v.email
where not exists (select 1 from public.players p where p.profile_id = u.id);

-- Set all active + public
update public.players pl set status='active', is_public=true
from auth.users u
where pl.profile_id = u.id and u.email like '%@sportbridge.demo';

-- Confirm
select u.email, p.role, p.status, p.verification_status,
       u.email_confirmed_at is not null as confirmed,
       left(u.encrypted_password,7) as hash
from auth.users u join public.profiles p on p.id = u.id
where u.email in ('marcus.thompson@sportbridge.demo','kwame.asante@sportbridge.demo')
order by u.email;
