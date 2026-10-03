create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text default 'player' check (role in ('player','coach','agent','academy','super_admin')),
  created_at timestamptz default now()
);

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  display_name text,
  position text,
  age integer,
  country text,
  bio text,
  created_at timestamptz default now()
);

alter table public.players add column if not exists display_name text;

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  status text default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.clubs enable row level security;
alter table public.players enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    case
      when new.raw_user_meta_data ->> 'role' in ('player', 'coach', 'agent', 'academy')
        then new.raw_user_meta_data ->> 'role'
      else 'player'
    end
  )
  on conflict (id) do update set email = excluded.email;

  if exists (select 1 from public.profiles where id = new.id and role = 'player') then
    insert into public.players (profile_id, display_name)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'Player')
    );
  end if;

  return new;
end;
$$;

update public.players as player
set display_name = coalesce(player.display_name, profile.full_name, 'Player')
from public.profiles as profile
where player.profile_id = profile.id and player.display_name is null;

insert into public.players (profile_id, display_name)
select profile.id, coalesce(profile.full_name, 'Player')
from public.profiles as profile
where profile.role = 'player'
  and not exists (select 1 from public.players where profile_id = profile.id);

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() = old.id and new.role is distinct from old.role then
    raise exception 'Profile roles cannot be changed by the profile owner.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profile_role_escalation on public.profiles;
create trigger prevent_profile_role_escalation
  before update on public.profiles
  for each row execute procedure public.prevent_profile_role_escalation();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop policy if exists "profiles are viewable by everyone" on public.profiles;
drop policy if exists "profiles are viewable by owner" on public.profiles;
drop policy if exists "profiles can be updated by owner" on public.profiles;
drop policy if exists "profiles can be inserted by authenticated users" on public.profiles;
create policy "profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles can be updated by owner" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "clubs are viewable by everyone" on public.clubs;
drop policy if exists "clubs are editable by authenticated users" on public.clubs;
drop policy if exists "clubs can be created by owner" on public.clubs;
drop policy if exists "clubs can be updated by owner" on public.clubs;
drop policy if exists "clubs can be deleted by owner" on public.clubs;
create policy "clubs are viewable by everyone" on public.clubs
  for select using (true);
create policy "clubs can be created by owner" on public.clubs
  for insert with check (auth.uid() = owner_id);
create policy "clubs can be updated by owner" on public.clubs
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "clubs can be deleted by owner" on public.clubs
  for delete using (auth.uid() = owner_id);

drop policy if exists "players are viewable by everyone" on public.players;
drop policy if exists "players can be managed by authenticated users" on public.players;
drop policy if exists "players can be created by profile owner" on public.players;
drop policy if exists "players can be updated by profile owner" on public.players;
drop policy if exists "players can be deleted by profile owner" on public.players;
create policy "players are viewable by everyone" on public.players
  for select using (true);
create policy "players can be created by profile owner" on public.players
  for insert with check (auth.uid() = profile_id);
create policy "players can be updated by profile owner" on public.players
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "players can be deleted by profile owner" on public.players
  for delete using (auth.uid() = profile_id);

drop policy if exists "jobs are viewable by everyone" on public.jobs;
drop policy if exists "jobs can be managed by authenticated users" on public.jobs;
drop policy if exists "jobs can be created by club owner" on public.jobs;
drop policy if exists "jobs can be updated by club owner" on public.jobs;
drop policy if exists "jobs can be deleted by club owner" on public.jobs;
create policy "jobs are viewable by everyone" on public.jobs
  for select using (true);
create policy "jobs can be created by club owner" on public.jobs
  for insert with check (
    exists (select 1 from public.clubs where id = club_id and owner_id = auth.uid())
  );
create policy "jobs can be updated by club owner" on public.jobs
  for update using (
    exists (select 1 from public.clubs where id = club_id and owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.clubs where id = club_id and owner_id = auth.uid())
  );
create policy "jobs can be deleted by club owner" on public.jobs
  for delete using (
    exists (select 1 from public.clubs where id = club_id and owner_id = auth.uid())
  );

drop policy if exists "applications are viewable by authenticated users" on public.applications;
drop policy if exists "applications can be managed by authenticated users" on public.applications;
drop policy if exists "applications are viewable by applicant or club owner" on public.applications;
drop policy if exists "applications can be created by player owner" on public.applications;
drop policy if exists "applications can be updated by club owner" on public.applications;
create policy "applications are viewable by applicant or club owner" on public.applications
  for select using (
    exists (select 1 from public.players where id = player_id and profile_id = auth.uid())
    or exists (
      select 1 from public.jobs
      join public.clubs on clubs.id = jobs.club_id
      where jobs.id = job_id and clubs.owner_id = auth.uid()
    )
  );
create policy "applications can be created by player owner" on public.applications
  for insert with check (
    status = 'pending'
    and
    exists (select 1 from public.players where id = player_id and profile_id = auth.uid())
  );
create policy "applications can be updated by club owner" on public.applications
  for update using (
    exists (
      select 1 from public.jobs
      join public.clubs on clubs.id = jobs.club_id
      where jobs.id = job_id and clubs.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.jobs
      join public.clubs on clubs.id = jobs.club_id
      where jobs.id = job_id and clubs.owner_id = auth.uid()
    )
  );

grant usage on schema public to anon, authenticated;
grant select on public.clubs, public.players, public.jobs to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant insert, update, delete on public.clubs, public.players, public.jobs to authenticated;
grant select, insert, update on public.applications to authenticated;
