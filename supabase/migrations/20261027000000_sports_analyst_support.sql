begin;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('player','coach','sports_analyst','agent','academy','super_admin'));

alter table public.coach_profiles
  add column if not exists certificates jsonb not null default '[]'::jsonb;

update storage.buckets
set file_size_limit = 104857600,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/quicktime','video/webm']
where id = 'public-media';

create or replace function public.current_user_can_host_training(p_duration_minutes integer)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and status = 'active'
      and verification_status = 'verified'
      and p_duration_minutes > 0
      and (
        (role = 'player' and p_duration_minutes <= 30)
        or role in ('coach','sports_analyst','academy')
      )
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_role text;
  selected_sport text;
  display_name text;
  new_club_id uuid;
begin
  selected_role := case
    when new.raw_user_meta_data ->> 'role' in ('player','coach','sports_analyst','agent','academy')
      then new.raw_user_meta_data ->> 'role'
    else 'player'
  end;
  selected_sport := case
    when new.raw_user_meta_data ->> 'sport' in ('football','basketball')
      then new.raw_user_meta_data ->> 'sport'
    else 'football'
  end;
  display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    'SportBridge member'
  );

  insert into public.profiles (id, email, full_name, role, sport, status)
  values (new.id, new.email, display_name, selected_role, selected_sport, 'active')
  on conflict (id) do update set email = excluded.email;

  if selected_role = 'player' then
    if not exists (select 1 from public.players where profile_id = new.id) then
      insert into public.players (profile_id, display_name, sport, is_public, status)
      values (new.id, display_name, selected_sport, false, 'active');
    end if;
  elsif selected_role in ('coach','sports_analyst') then
    insert into public.coach_profiles (user_id, sport, full_name)
    values (new.id, selected_sport, display_name)
    on conflict (user_id) do nothing;
  elsif selected_role = 'agent' then
    insert into public.agent_profiles (user_id, sport)
    values (new.id, selected_sport)
    on conflict (user_id) do nothing;
  elsif selected_role = 'academy' then
    select id into new_club_id
    from public.clubs where owner_id = new.id
    order by created_at limit 1;
    if new_club_id is null then
      insert into public.clubs (name, owner_id, sports, status)
      values (display_name, new.id, array[selected_sport], 'active')
      returning id into new_club_id;
    end if;
    insert into public.academy_profiles (user_id, club_id, sports)
    values (new.id, new_club_id, array[selected_sport])
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

insert into public.coach_profiles (user_id, sport, full_name)
select profile.id, coalesce(profile.sport, 'football'), profile.full_name
from public.profiles as profile
where profile.role = 'sports_analyst'
on conflict (user_id) do nothing;

drop policy if exists "jobs owner insert" on public.jobs;
create policy "jobs owner insert" on public.jobs for insert to authenticated
  with check (
    posted_by_user_id = (select auth.uid())
    and public.current_user_is_verified()
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid())
        and (
          (role = 'academy' and job_type in ('player_needed','staff_needed'))
          or (role = 'agent' and job_type = 'player_needed')
          or (role in ('coach','sports_analyst') and job_type = 'seeking_job')
        )
    )
    and (club_id is null or exists (
      select 1 from public.clubs
      where clubs.id = club_id and owner_id = (select auth.uid())
    ))
  );

drop policy if exists "jobs owner update" on public.jobs;
create policy "jobs owner update" on public.jobs for update to authenticated
  using (
    posted_by_user_id = (select auth.uid())
    or exists (select 1 from public.clubs where clubs.id = jobs.club_id and clubs.owner_id = (select auth.uid()))
  )
  with check (
    (
      (posted_by_user_id = (select auth.uid())
        or exists (select 1 from public.clubs where clubs.id = jobs.club_id and clubs.owner_id = (select auth.uid())))
      and public.current_user_is_verified()
      and exists (
        select 1 from public.profiles
        where id = (select auth.uid())
          and (
            (role = 'academy' and job_type in ('player_needed','staff_needed'))
            or (role = 'agent' and job_type = 'player_needed')
            or (role in ('coach','sports_analyst') and job_type = 'seeking_job')
          )
      )
    )
    or public.current_user_is_admin()
  );

drop policy if exists "recommendations owner insert" on public.agent_recommendations;
create policy "recommendations owner insert" on public.agent_recommendations for insert to authenticated
  with check (
    recommender_user_id = (select auth.uid())
    and public.current_user_is_verified()
    and recommended_to_type = case
      when agent_profile_id is not null then 'agent'
      else 'academy'
    end
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role in ('coach','sports_analyst')
    )
  );

commit;
