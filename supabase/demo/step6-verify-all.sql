-- =============================================================================
-- STEP 6 of 6 — Final verification
-- Run after all previous steps. The configured list currently defines 49 accounts:
-- 1 admin, 10 coaches/analysts, 10 agents/academies, and 28 players.
-- Every row must show account_ok = true and all_checks_passed = true.
-- =============================================================================

with expected_accounts(email, expected_role) as (
  values
    ('sportbridge.com.ng@gmail.com', 'super_admin'),
    ('carlos.mendes@sportbridge.demo', 'coach'),
    ('javier.morales@sportbridge.demo', 'coach'),
    ('marco.rossi@sportbridge.demo', 'coach'),
    ('emre.demir@sportbridge.demo', 'coach'),
    ('sarah.mitchell@sportbridge.demo', 'coach'),
    ('nemanja.petrovic@sportbridge.demo', 'coach'),
    ('sophie.laurent@sportbridge.demo', 'sports_analyst'),
    ('james.clarke@sportbridge.demo', 'sports_analyst'),
    ('hiroshi.nakamura@sportbridge.demo', 'sports_analyst'),
    ('alicia.washington@sportbridge.demo', 'sports_analyst'),
    ('scouting@global-talent.demo', 'agent'),
    ('contact@sabridge.demo', 'agent'),
    ('info@desertsports.demo', 'agent'),
    ('scout@ajaxnetwork.demo', 'agent'),
    ('info@wascouts.demo', 'agent'),
    ('admin@elitelondonfc.demo', 'academy'),
    ('info@academie-paris.demo', 'academy'),
    ('contact@ghanafinstitute.demo', 'academy'),
    ('academy@sportinglisboa.demo', 'academy'),
    ('admin@riversunited.demo', 'academy'),
    ('marcus.thompson@sportbridge.demo', 'player'),
    ('gabriel.santos@sportbridge.demo', 'player'),
    ('antoine.dubois@sportbridge.demo', 'player'),
    ('lukas.muller@sportbridge.demo', 'player'),
    ('kwame.asante@sportbridge.demo', 'player'),
    ('yassine.benali@sportbridge.demo', 'player'),
    ('alejandro.rios@sportbridge.demo', 'player'),
    ('moussa.diallo@sportbridge.demo', 'player'),
    ('kenji.tanaka@sportbridge.demo', 'player'),
    ('jiho.park@sportbridge.demo', 'player'),
    ('diego.hernandez@sportbridge.demo', 'player'),
    ('tyler.jackson@sportbridge.demo', 'player'),
    ('femi.adeyemi@sportbridge.demo', 'player'),
    ('ivan.petrenko@sportbridge.demo', 'player'),
    ('nabil.amrani@sportbridge.demo', 'player'),
    ('edson.reyes@sportbridge.demo', 'player'),
    ('aleksander.jovic@sportbridge.demo', 'player'),
    ('omar.elshenawy@sportbridge.demo', 'player'),
    ('koffi.kouassi@sportbridge.demo', 'player'),
    ('lars.odegaard@sportbridge.demo', 'player'),
    ('joao.costa@sportbridge.demo', 'player'),
    ('amir.shafiei@sportbridge.demo', 'player'),
    ('bernard.owusu@sportbridge.demo', 'player'),
    ('roberto.nunez@sportbridge.demo', 'player'),
    ('takehiro.sato@sportbridge.demo', 'player'),
    ('chukwuemeka.okafor@sportbridge.demo', 'player'),
    ('vladislav.koval@sportbridge.demo', 'player'),
    ('christos.papadopoulos@sportbridge.demo', 'player')
)
select
  expected.email,
  expected.expected_role,
  p.role,
  p.status as account_status,
  p.verification_status,
  u.email_confirmed_at is not null as email_confirmed,
  u.encrypted_password is not null as has_password,
  left(u.encrypted_password, 7) as hash_prefix,
  coalesce((
    u.id is not null
    and p.id is not null
    and p.role = expected.expected_role
    and p.status = 'active'
    and p.verification_status = 'verified'
    and u.email_confirmed_at is not null
    and left(u.encrypted_password, 7) in ('$2a$10$', '$2b$10$')
  ), false) as account_ok,
  count(*) over () as expected_account_count,
  bool_and(
    coalesce((
    u.id is not null
    and p.id is not null
    and p.role = expected.expected_role
    and p.status = 'active'
    and p.verification_status = 'verified'
    and u.email_confirmed_at is not null
    and left(u.encrypted_password, 7) in ('$2a$10$', '$2b$10$')
    ), false)
  ) over () as all_checks_passed
from expected_accounts expected
left join auth.users u on u.email = expected.email
left join public.profiles p on p.id = u.id
order by expected.expected_role, expected.email;
