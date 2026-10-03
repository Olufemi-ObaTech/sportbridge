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

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'super_admin'
  );
$$;

revoke all on function public.current_user_is_admin() from public, anon;
grant execute on function public.current_user_is_admin() to authenticated;

drop trigger if exists prevent_profile_role_escalation on public.profiles;
create trigger prevent_profile_role_escalation
  before update on public.profiles
  for each row execute procedure public.prevent_profile_role_escalation();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Stale v1 policies (all superseded by the comprehensive policy block further
-- below). Drop them here so the later CREATE POLICY statements start clean,
-- whether the schema is applied to a brand-new project or re-run as an
-- idempotent migration.
drop policy if exists "profiles are viewable by everyone" on public.profiles;
drop policy if exists "profiles are viewable by owner" on public.profiles;
drop policy if exists "profiles are viewable by admins" on public.profiles;
drop policy if exists "profiles can be updated by owner" on public.profiles;
drop policy if exists "profiles can be updated by admins" on public.profiles;
drop policy if exists "profiles can be inserted by authenticated users" on public.profiles;
drop policy if exists "clubs are viewable by everyone" on public.clubs;
drop policy if exists "clubs are editable by authenticated users" on public.clubs;
drop policy if exists "clubs can be created by owner" on public.clubs;
drop policy if exists "clubs can be updated by owner" on public.clubs;
drop policy if exists "clubs can be deleted by owner" on public.clubs;
drop policy if exists "players are viewable by everyone" on public.players;
drop policy if exists "players can be managed by authenticated users" on public.players;
drop policy if exists "players can be created by profile owner" on public.players;
drop policy if exists "players can be updated by profile owner" on public.players;
drop policy if exists "players can be deleted by profile owner" on public.players;
drop policy if exists "jobs are viewable by everyone" on public.jobs;
drop policy if exists "jobs can be managed by authenticated users" on public.jobs;
drop policy if exists "jobs can be created by club owner" on public.jobs;
drop policy if exists "jobs can be updated by club owner" on public.jobs;
drop policy if exists "jobs can be deleted by club owner" on public.jobs;
drop policy if exists "applications are viewable by authenticated users" on public.applications;
drop policy if exists "applications can be managed by authenticated users" on public.applications;
drop policy if exists "applications are viewable by applicant or club owner" on public.applications;
drop policy if exists "applications can be created by player owner" on public.applications;
drop policy if exists "applications can be updated by club owner" on public.applications;

-- Minimal bootstrap grants so the ALTER TABLE / CREATE TABLE statements
-- that follow can reference existing objects. The comprehensive, column-level
-- grants that replace these are applied at the end of the file.
grant usage on schema public to anon, authenticated;

-- Account state and contact details stay on the private profile row.
alter table public.profiles
  add column if not exists username text,
  add column if not exists phone text,
  add column if not exists avatar_path text,
  add column if not exists sport text not null default 'football',
  add column if not exists status text not null default 'active',
  add column if not exists referred_by uuid references public.profiles(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists profiles_username_unique_idx on public.profiles (lower(username)) where username is not null;

alter table public.clubs
  add column if not exists slug text,
  add column if not exists sports text[] not null default array['football']::text[],
  add column if not exists country text,
  add column if not exists state text,
  add column if not exists address text,
  add column if not exists about text,
  add column if not exists website text,
  add column if not exists logo_path text,
  add column if not exists cover_image_path text,
  add column if not exists team_gender text,
  add column if not exists status text not null default 'active',
  add column if not exists verified_badge boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.academy_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  club_id uuid unique references public.clubs(id) on delete set null,
  sports text[] not null default array['football']::text[],
  country text,
  state text,
  address text,
  phone text,
  year_founded integer,
  leagues text[] not null default '{}',
  languages text[] not null default '{}',
  linkedin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  agency_name text,
  sport text not null default 'football' check (sport in ('football','basketball')),
  nationality text,
  gender text check (gender in ('male','female','other')),
  experience_years integer check (experience_years between 0 and 80),
  regions text[] not null default '{}',
  about text,
  achievements text,
  photo_path text,
  cover_image_path text,
  linkedin text,
  is_public boolean not null default false,
  verified_badge boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coach_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  sport text not null default 'football' check (sport in ('football','basketball')),
  full_name text,
  badges text[] not null default '{}',
  certificates jsonb not null default '[]'::jsonb,
  preferred_role text,
  experience_years integer check (experience_years between 0 and 80),
  current_club text,
  nationality text,
  gender text check (gender in ('male','female','other')),
  about text,
  achievements text,
  photo_path text,
  cover_image_path text,
  open_to_work boolean not null default true,
  linkedin text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academy_profiles(id) on delete cascade,
  sport text not null default 'football' check (sport in ('football','basketball')),
  name text not null,
  season text,
  age_group text,
  coach_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.players
  add column if not exists academy_id uuid references public.academy_profiles(id) on delete set null,
  add column if not exists team_id uuid references public.teams(id) on delete set null,
  add column if not exists sport text not null default 'football',
  add column if not exists dob date,
  add column if not exists secondary_position text,
  add column if not exists gender text,
  add column if not exists nationality text,
  add column if not exists foot text,
  add column if not exists dominant_hand text,
  add column if not exists height_cm integer,
  add column if not exists weight_kg integer,
  add column if not exists jersey_number integer,
  add column if not exists primary_photo_path text,
  add column if not exists current_club text,
  add column if not exists previous_clubs text[] not null default '{}',
  add column if not exists achievements text,
  add column if not exists linkedin text,
  add column if not exists is_public boolean not null default false,
  add column if not exists status text not null default 'active',
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.player_private (
  player_id uuid primary key references public.players(id) on delete cascade,
  cv_storage_path text,
  guardian_name text,
  guardian_consent_at timestamptz,
  private_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coach_private (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  cv_storage_path text,
  private_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_verifications (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null unique references public.academy_profiles(id) on delete cascade,
  license_number text,
  license_document_path text,
  fifa_connect_id text,
  has_fifa_tms_account boolean not null default false,
  fiba_map_id text,
  has_fiba_map_account boolean not null default false,
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_verifications (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null unique references public.agent_profiles(id) on delete cascade,
  license_number text,
  verification_body text,
  identity_document_path text,
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  sport text check (sport in ('football','basketball')),
  content text not null default '',
  media_urls jsonb not null default '[]'::jsonb,
  visibility text not null default 'public' check (visibility in ('public','private')),
  status text not null default 'published' check (status in ('draft','published','removed')),
  is_pinned boolean not null default false,
  is_training boolean not null default false,
  training_link text,
  training_at timestamptz,
  is_live boolean not null default false,
  live_link text,
  live_at timestamptz,
  likes_count integer not null default 0 check (likes_count >= 0),
  comments_count integer not null default 0 check (comments_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (length(content) <= 10000),
  check (not is_training or training_link is not null),
  check (not is_live or live_link is not null)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  player_id uuid references public.players(id) on delete cascade,
  feed_post_id uuid references public.feed_posts(id) on delete cascade,
  asset_type text not null check (asset_type in ('image','video','youtube','document')),
  storage_bucket text,
  storage_path text,
  external_url text,
  youtube_embed_id text,
  title text,
  thumbnail_path text,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  is_featured boolean not null default false,
  visibility text not null default 'private' check (visibility in ('public','private')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (player_id is not null or feed_post_id is not null or asset_type = 'document'),
  check (storage_path is not null or external_url is not null or youtube_embed_id is not null),
  check (storage_bucket is null or storage_bucket in ('public-media','private-media','private-documents')),
  check (storage_bucket <> 'public-media' or visibility = 'public'),
  check (storage_bucket <> 'private-media' or visibility = 'private'),
  check (asset_type <> 'document' or (visibility = 'private' and storage_bucket = 'private-documents'))
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  feed_post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  feed_post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (feed_post_id, user_id)
);

alter table public.jobs
  add column if not exists academy_id uuid references public.academy_profiles(id) on delete cascade,
  add column if not exists posted_by_user_id uuid references public.profiles(id) on delete set null,
  add column if not exists sport text not null default 'football',
  add column if not exists role_type text,
  add column if not exists requirements text,
  add column if not exists location text,
  add column if not exists salary_min integer,
  add column if not exists salary_max integer,
  add column if not exists currency text,
  add column if not exists contract_type text,
  add column if not exists application_deadline date,
  add column if not exists status text not null default 'open',
  add column if not exists published_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.applications
  add column if not exists applicant_user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists coach_profile_id uuid references public.coach_profiles(id) on delete cascade,
  add column if not exists cover_letter text,
  add column if not exists cv_storage_path text,
  add column if not exists applied_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  agent_profile_id uuid references public.agent_profiles(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  notes text,
  created_at timestamptz not null default now(),
  unique (owner_id, player_id)
);

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  agent_user_id uuid not null references public.profiles(id) on delete cascade,
  agent_profile_id uuid references public.agent_profiles(id) on delete set null,
  player_id uuid references public.players(id) on delete cascade,
  academy_id uuid references public.academy_profiles(id) on delete cascade,
  message text,
  status text not null default 'pending' check (status in ('pending','granted','denied','cancelled')),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (player_id is not null or academy_id is not null)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  initiator_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  subject text,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (initiator_id <> recipient_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null default '',
  attachment_bucket text,
  attachment_path text,
  player_card_id uuid references public.players(id) on delete set null,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (length(content) <= 10000),
  check (length(content) > 0 or attachment_path is not null or player_card_id is not null)
);

create table if not exists public.agent_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  agent_profile_id uuid not null references public.agent_profiles(id) on delete cascade,
  sport text not null check (sport in ('football','basketball')),
  score integer not null check (score between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, agent_profile_id)
);

create table if not exists public.agent_recommendations (
  id uuid primary key default gen_random_uuid(),
  recommender_user_id uuid not null references public.profiles(id) on delete cascade,
  agent_profile_id uuid not null references public.agent_profiles(id) on delete cascade,
  sport text not null check (sport in ('football','basketball')),
  player_id uuid references public.players(id) on delete set null,
  recommended_to_name text,
  proposed_percentage numeric(5,2) check (proposed_percentage between 0 and 100),
  note text,
  status text not null default 'pending' check (status in ('pending','acknowledged','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (player_id is not null or nullif(trim(recommended_to_name), '') is not null)
);

create table if not exists public.agent_documents (
  id uuid primary key default gen_random_uuid(),
  agent_profile_id uuid not null references public.agent_profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  storage_path text not null,
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (reason in ('fraud_or_payment_request','fake_profile','harassment','inappropriate_content','other')),
  details text,
  status text not null default 'pending' check (status in ('pending','dismissed','actioned')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (reporter_id <> reported_user_id)
);

create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete restrict,
  action text not null,
  target_type text,
  target_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  sport text check (sport in ('football','basketball')),
  label text not null,
  criteria jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trials (
  id uuid primary key default gen_random_uuid(),
  organizer_user_id uuid not null references public.profiles(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  sport text not null check (sport in ('football','basketball')),
  scheduled_at timestamptz not null,
  location text,
  notes text,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.try_outs (
  id uuid primary key default gen_random_uuid(),
  posted_by_user_id uuid not null references public.profiles(id) on delete cascade,
  sport text not null check (sport in ('football','basketball')),
  gender text not null default 'mixed' check (gender in ('male','female','mixed')),
  title text not null,
  description text,
  location text,
  scheduled_date date,
  age_group text,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.try_out_interests (
  id uuid primary key default gen_random_uuid(),
  try_out_id uuid not null references public.try_outs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  created_at timestamptz not null default now(),
  unique (try_out_id, user_id)
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null,
  endpoint_hash text not null unique,
  public_key text not null,
  auth_token text not null,
  content_encoding text not null default 'aes128gcm',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  notification_type text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists players_public_listing_idx on public.players (sport, country, position) where is_public = true and status = 'active';
create index if not exists teams_academy_sport_idx on public.teams (academy_id, sport);
create index if not exists jobs_public_listing_idx on public.jobs (sport, status, created_at desc);
create index if not exists feed_posts_public_listing_idx on public.feed_posts (created_at desc) where visibility = 'public' and status = 'published';
create index if not exists feed_posts_author_idx on public.feed_posts (author_id, created_at desc);
create index if not exists media_assets_player_idx on public.media_assets (player_id, sort_order);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);
create index if not exists reports_queue_idx on public.reports (status, created_at desc);
create index if not exists trials_participant_idx on public.trials (organizer_user_id, scheduled_at);
create index if not exists try_outs_public_listing_idx on public.try_outs (sport, status, scheduled_date);
create unique index if not exists push_subscriptions_endpoint_hash_idx on public.push_subscriptions (endpoint_hash);

create or replace function public.profile_is_active(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = p_user_id and status = 'active'
  );
$$;

create or replace function public.current_user_owns_academy(p_academy_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.academy_profiles
    where id = p_academy_id and user_id = (select auth.uid())
  );
$$;

create or replace function public.current_user_owns_player(p_player_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.players as player
    left join public.academy_profiles as academy on academy.id = player.academy_id
    where player.id = p_player_id
      and (player.profile_id = (select auth.uid()) or academy.user_id = (select auth.uid()))
  );
$$;

create or replace function public.current_user_owns_agent(p_agent_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.agent_profiles
    where id = p_agent_id and user_id = (select auth.uid())
  );
$$;

create or replace function public.current_user_is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversations
    where id = p_conversation_id
      and (initiator_id = (select auth.uid()) or recipient_id = (select auth.uid()))
  );
$$;

create or replace function public.current_user_has_agent_interaction(p_agent_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.agent_profiles as agent
    join public.conversations as conversation
      on (conversation.initiator_id = agent.user_id and conversation.recipient_id = (select auth.uid()))
      or (conversation.recipient_id = agent.user_id and conversation.initiator_id = (select auth.uid()))
    join public.messages as message on message.conversation_id = conversation.id
    where agent.id = p_agent_id
  ) or exists (
    select 1
    from public.access_requests as access_request
    where access_request.agent_profile_id = p_agent_id
      and access_request.status = 'granted'
      and (
        public.current_user_owns_player(access_request.player_id)
        or public.current_user_owns_academy(access_request.academy_id)
      )
  );
$$;

revoke all on function public.profile_is_active(uuid) from public;
revoke all on function public.current_user_owns_academy(uuid) from public, anon;
revoke all on function public.current_user_owns_player(uuid) from public, anon;
revoke all on function public.current_user_owns_agent(uuid) from public, anon;
revoke all on function public.current_user_is_conversation_member(uuid) from public, anon;
revoke all on function public.current_user_has_agent_interaction(uuid) from public, anon;
grant execute on function public.profile_is_active(uuid) to anon, authenticated;
grant execute on function public.current_user_owns_academy(uuid) to authenticated;
grant execute on function public.current_user_owns_player(uuid) to authenticated;
grant execute on function public.current_user_owns_agent(uuid) to authenticated;
grant execute on function public.current_user_is_conversation_member(uuid) to authenticated;
grant execute on function public.current_user_has_agent_interaction(uuid) to authenticated;

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
    when new.raw_user_meta_data ->> 'role' in ('player','coach','agent','academy')
      then new.raw_user_meta_data ->> 'role'
    else 'player'
  end;
  selected_sport := case
    when new.raw_user_meta_data ->> 'sport' in ('football','basketball')
      then new.raw_user_meta_data ->> 'sport'
    else 'football'
  end;
  display_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), nullif(trim(new.raw_user_meta_data ->> 'name'), ''), 'SportBridge member');

  insert into public.profiles (id, email, full_name, role, sport, status)
  values (new.id, new.email, display_name, selected_role, selected_sport, 'active')
  on conflict (id) do update set email = excluded.email;

  if selected_role = 'player' then
    if not exists (select 1 from public.players where profile_id = new.id) then
      insert into public.players (profile_id, display_name, sport, is_public, status)
      values (new.id, display_name, selected_sport, false, 'active');
    end if;
  elsif selected_role = 'coach' then
    insert into public.coach_profiles (user_id, sport, full_name)
    values (new.id, selected_sport, display_name)
    on conflict (user_id) do nothing;
  elsif selected_role = 'agent' then
    insert into public.agent_profiles (user_id, sport)
    values (new.id, selected_sport)
    on conflict (user_id) do nothing;
  elsif selected_role = 'academy' then
    select id into new_club_id from public.clubs where owner_id = new.id order by created_at limit 1;
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

create or replace function public.sync_auth_user_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email, updated_at = now() where id = new.id;
  end if;
  return new;
end;
$$;

create or replace function public.prevent_profile_privilege_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) = old.id
     and (new.role is distinct from old.role or new.status is distinct from old.status or new.email is distinct from old.email) then
    raise exception 'Users cannot change their own role, status, or email through the profile table.';
  end if;
    if (select auth.uid()) is not null
      and new.role = 'super_admin'
      and old.role is distinct from new.role
      and not public.current_user_is_admin() then
    raise exception 'Only an existing administrator can grant administrator access.';
  end if;
  return new;
end;
$$;

create or replace function public.prevent_unverified_flag_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or public.current_user_is_admin() then
    return new;
  end if;

  if tg_table_name in ('clubs','agent_profiles') then
    if coalesce((to_jsonb(new) ->> 'verified_badge')::boolean, false)
       is distinct from coalesce((to_jsonb(old) ->> 'verified_badge')::boolean, false) then
      raise exception 'Only administrators can change verification badges.';
    end if;
  elsif tg_table_name in ('academy_verifications','agent_verifications','agent_documents') then
    if (to_jsonb(new) ->> 'verified_at') is distinct from (to_jsonb(old) ->> 'verified_at')
       or (to_jsonb(new) ->> 'verified_by') is distinct from (to_jsonb(old) ->> 'verified_by') then
      raise exception 'Only administrators can change document verification status.';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.prevent_non_admin_post_pinning()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null
     and not public.current_user_is_admin()
     and coalesce(new.is_pinned, false) is distinct from coalesce(old.is_pinned, false) then
    raise exception 'Only administrators can pin feed posts.';
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute procedure public.sync_auth_user_email();

drop trigger if exists prevent_profile_role_escalation on public.profiles;
drop trigger if exists prevent_profile_privilege_changes on public.profiles;
create trigger prevent_profile_privilege_changes
  before update on public.profiles
  for each row execute procedure public.prevent_profile_privilege_changes();

drop trigger if exists prevent_club_verification_changes on public.clubs;
create trigger prevent_club_verification_changes before insert or update on public.clubs
  for each row execute procedure public.prevent_unverified_flag_changes();
drop trigger if exists prevent_agent_verification_changes on public.agent_profiles;
create trigger prevent_agent_verification_changes before insert or update on public.agent_profiles
  for each row execute procedure public.prevent_unverified_flag_changes();
drop trigger if exists prevent_academy_verification_changes on public.academy_verifications;
create trigger prevent_academy_verification_changes before insert or update on public.academy_verifications
  for each row execute procedure public.prevent_unverified_flag_changes();
drop trigger if exists prevent_agent_verification_document_changes on public.agent_verifications;
create trigger prevent_agent_verification_document_changes before insert or update on public.agent_verifications
  for each row execute procedure public.prevent_unverified_flag_changes();
drop trigger if exists prevent_agent_document_verification_changes on public.agent_documents;
create trigger prevent_agent_document_verification_changes before insert or update on public.agent_documents
  for each row execute procedure public.prevent_unverified_flag_changes();
drop trigger if exists prevent_non_admin_post_pinning on public.feed_posts;
create trigger prevent_non_admin_post_pinning before insert or update on public.feed_posts
  for each row execute procedure public.prevent_non_admin_post_pinning();

insert into public.clubs (name, owner_id, sports, status)
select coalesce(nullif(profile.full_name, ''), 'Academy'), profile.id, array[coalesce(profile.sport, 'football')], 'active'
from public.profiles as profile
where profile.role = 'academy'
  and not exists (select 1 from public.clubs as club where club.owner_id = profile.id);

insert into public.academy_profiles (user_id, club_id, sports)
select profile.id, club.id, array[coalesce(profile.sport, 'football')]
from public.profiles as profile
join public.clubs as club on club.owner_id = profile.id
where profile.role = 'academy'
on conflict (user_id) do nothing;

insert into public.agent_profiles (user_id, sport)
select profile.id, coalesce(profile.sport, 'football')
from public.profiles as profile
where profile.role = 'agent'
on conflict (user_id) do nothing;

insert into public.coach_profiles (user_id, sport, full_name)
select profile.id, coalesce(profile.sport, 'football'), profile.full_name
from public.profiles as profile
where profile.role = 'coach'
on conflict (user_id) do nothing;

alter table public.academy_profiles enable row level security;
alter table public.agent_profiles enable row level security;
alter table public.coach_profiles enable row level security;
alter table public.teams enable row level security;
alter table public.player_private enable row level security;
alter table public.coach_private enable row level security;
alter table public.academy_verifications enable row level security;
alter table public.agent_verifications enable row level security;
alter table public.media_assets enable row level security;
alter table public.feed_posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.watchlists enable row level security;
alter table public.access_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.agent_ratings enable row level security;
alter table public.agent_recommendations enable row level security;
alter table public.agent_documents enable row level security;
alter table public.reports enable row level security;
alter table public.admin_logs enable row level security;
alter table public.saved_searches enable row level security;
alter table public.trials enable row level security;
alter table public.try_outs enable row level security;
alter table public.try_out_interests enable row level security;
alter table public.push_subscriptions enable row level security;

drop policy if exists "clubs are viewable by everyone" on public.clubs;
drop policy if exists "clubs are created by owner" on public.clubs;
drop policy if exists "clubs are updated by owner" on public.clubs;
drop policy if exists "clubs are deleted by owner" on public.clubs;
drop policy if exists "clubs public read" on public.clubs;
drop policy if exists "clubs owner insert" on public.clubs;
drop policy if exists "clubs owner update" on public.clubs;
drop policy if exists "clubs owner delete" on public.clubs;
drop policy if exists "clubs admin manage" on public.clubs;
create policy "clubs public read" on public.clubs for select to anon
  using (status = 'active' and public.profile_is_active(owner_id));
create policy "clubs authenticated read" on public.clubs for select to authenticated
  using ((status = 'active' and public.profile_is_active(owner_id)) or owner_id = (select auth.uid()) or public.current_user_is_admin());
create policy "clubs owner insert" on public.clubs for insert to authenticated
  with check (owner_id = (select auth.uid()) and public.profile_is_active((select auth.uid())));
create policy "clubs owner update" on public.clubs for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "clubs owner delete" on public.clubs for delete to authenticated
  using (owner_id = (select auth.uid()));
create policy "clubs admin manage" on public.clubs for all to authenticated
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());

drop policy if exists "players are viewable by everyone" on public.players;
drop policy if exists "players can be created by profile owner" on public.players;
drop policy if exists "players can be updated by profile owner" on public.players;
drop policy if exists "players can be deleted by profile owner" on public.players;
drop policy if exists "players public read" on public.players;
drop policy if exists "players authenticated read" on public.players;
drop policy if exists "players owner insert" on public.players;
drop policy if exists "players owner update" on public.players;
drop policy if exists "players owner delete" on public.players;
drop policy if exists "players admin manage" on public.players;
create policy "players public read" on public.players for select to anon
  using (
    is_public and status = 'active'
    and public.profile_is_active(coalesce(profile_id, (select academy.user_id from public.academy_profiles as academy where academy.id = academy_id)))
  );
create policy "players authenticated read" on public.players for select to authenticated
  using (
    (is_public and status = 'active'
      and public.profile_is_active(coalesce(profile_id, (select academy.user_id from public.academy_profiles as academy where academy.id = academy_id))))
    or profile_id = (select auth.uid())
    or public.current_user_owns_player(id)
    or public.current_user_is_admin()
  );
create policy "players owner insert" on public.players for insert to authenticated
  with check (
    (profile_id = (select auth.uid()) and public.profile_is_active((select auth.uid())))
    or (academy_id is not null and public.current_user_owns_academy(academy_id))
  );
create policy "players owner update" on public.players for update to authenticated
  using (public.current_user_owns_player(id))
  with check (public.current_user_owns_player(id));
create policy "players owner delete" on public.players for delete to authenticated
  using (public.current_user_owns_player(id));
create policy "players admin manage" on public.players for all to authenticated
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());

drop policy if exists "jobs are viewable by everyone" on public.jobs;
drop policy if exists "jobs can be created by club owner" on public.jobs;
drop policy if exists "jobs can be updated by club owner" on public.jobs;
drop policy if exists "jobs can be deleted by club owner" on public.jobs;
drop policy if exists "jobs public read" on public.jobs;
drop policy if exists "jobs authenticated read" on public.jobs;
drop policy if exists "jobs owner insert" on public.jobs;
drop policy if exists "jobs owner update" on public.jobs;
drop policy if exists "jobs owner delete" on public.jobs;
drop policy if exists "jobs admin manage" on public.jobs;
create policy "jobs public read" on public.jobs for select to anon
  using (status = 'open' and published_at <= now());
create policy "jobs authenticated read" on public.jobs for select to authenticated
  using (status = 'open' and published_at <= now()
    or posted_by_user_id = (select auth.uid())
    or exists (select 1 from public.clubs where clubs.id = jobs.club_id and clubs.owner_id = (select auth.uid()))
    or public.current_user_is_admin());
create policy "jobs owner insert" on public.jobs for insert to authenticated
  with check (
    posted_by_user_id = (select auth.uid())
    and (club_id is null or exists (select 1 from public.clubs where clubs.id = club_id and owner_id = (select auth.uid())))
  );
create policy "jobs owner update" on public.jobs for update to authenticated
  using (posted_by_user_id = (select auth.uid()) or exists (select 1 from public.clubs where clubs.id = jobs.club_id and clubs.owner_id = (select auth.uid())))
  with check (posted_by_user_id = (select auth.uid()) or exists (select 1 from public.clubs where clubs.id = jobs.club_id and clubs.owner_id = (select auth.uid())));
create policy "jobs owner delete" on public.jobs for delete to authenticated
  using (posted_by_user_id = (select auth.uid()) or exists (select 1 from public.clubs where clubs.id = jobs.club_id and clubs.owner_id = (select auth.uid())));
create policy "jobs admin manage" on public.jobs for all to authenticated
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());

drop policy if exists "profiles are viewable by everyone" on public.profiles;
drop policy if exists "profiles are viewable by owner" on public.profiles;
drop policy if exists "profiles are viewable by admins" on public.profiles;
drop policy if exists "profiles can be updated by owner" on public.profiles;
drop policy if exists "profiles can be updated by admins" on public.profiles;
drop policy if exists "profiles owner read" on public.profiles;
drop policy if exists "profiles admin read" on public.profiles;
drop policy if exists "profiles owner update" on public.profiles;
drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles owner read" on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "profiles admin read" on public.profiles for select to authenticated
  using (public.current_user_is_admin());
create policy "profiles owner update" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "profiles admin update" on public.profiles for update to authenticated
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());

drop policy if exists "academy profile owner access" on public.academy_profiles;
create policy "academy profile owner access" on public.academy_profiles for all to authenticated
  using (user_id = (select auth.uid()) or public.current_user_is_admin())
  with check (user_id = (select auth.uid()) or public.current_user_is_admin());
drop policy if exists "agent profiles public read" on public.agent_profiles;
drop policy if exists "agent profile owner access" on public.agent_profiles;
create policy "agent profiles public read" on public.agent_profiles for select to anon
  using (is_public and public.profile_is_active(user_id));
create policy "agent profile authenticated read" on public.agent_profiles for select to authenticated
  using ((is_public and public.profile_is_active(user_id)) or user_id = (select auth.uid()) or public.current_user_is_admin());
create policy "agent profile owner write" on public.agent_profiles for all to authenticated
  using (user_id = (select auth.uid()) or public.current_user_is_admin())
  with check (user_id = (select auth.uid()) or public.current_user_is_admin());
drop policy if exists "coach profiles public read" on public.coach_profiles;
drop policy if exists "coach profile owner access" on public.coach_profiles;
create policy "coach profiles public read" on public.coach_profiles for select to anon
  using (is_public and open_to_work and public.profile_is_active(user_id));
create policy "coach profiles authenticated read" on public.coach_profiles for select to authenticated
  using ((is_public and open_to_work and public.profile_is_active(user_id)) or user_id = (select auth.uid()) or public.current_user_is_admin());
create policy "coach profile owner write" on public.coach_profiles for all to authenticated
  using (user_id = (select auth.uid()) or public.current_user_is_admin())
  with check (user_id = (select auth.uid()) or public.current_user_is_admin());

drop policy if exists "teams public read" on public.teams;
drop policy if exists "teams owner manage" on public.teams;
create policy "teams public read" on public.teams for select to anon, authenticated
  using (exists (
    select 1 from public.academy_profiles as academy
    join public.clubs as club on club.id = academy.club_id
    where academy.id = academy_id and club.status = 'active' and public.profile_is_active(academy.user_id)
  ) or public.current_user_owns_academy(academy_id) or public.current_user_is_admin());
create policy "teams owner manage" on public.teams for all to authenticated
  using (public.current_user_owns_academy(academy_id) or public.current_user_is_admin())
  with check (public.current_user_owns_academy(academy_id) or public.current_user_is_admin());

drop policy if exists "player private owner access" on public.player_private;
create policy "player private owner access" on public.player_private for all to authenticated
  using (public.current_user_owns_player(player_id) or public.current_user_is_admin())
  with check (public.current_user_owns_player(player_id) or public.current_user_is_admin());
drop policy if exists "coach private owner access" on public.coach_private;
create policy "coach private owner access" on public.coach_private for all to authenticated
  using (user_id = (select auth.uid()) or public.current_user_is_admin())
  with check (user_id = (select auth.uid()) or public.current_user_is_admin());
drop policy if exists "academy verifications admin owner access" on public.academy_verifications;
create policy "academy verifications admin owner access" on public.academy_verifications for all to authenticated
  using (public.current_user_owns_academy(academy_id) or public.current_user_is_admin())
  with check (public.current_user_owns_academy(academy_id) or public.current_user_is_admin());
drop policy if exists "agent verifications admin owner access" on public.agent_verifications;
create policy "agent verifications admin owner access" on public.agent_verifications for all to authenticated
  using (public.current_user_owns_agent(agent_id) or public.current_user_is_admin())
  with check (public.current_user_owns_agent(agent_id) or public.current_user_is_admin());

drop policy if exists "media assets visible read" on public.media_assets;
drop policy if exists "media assets owner write" on public.media_assets;
create policy "media assets visible read" on public.media_assets for select to anon, authenticated
  using (
    (visibility = 'public' and asset_type <> 'document' and (
      (player_id is not null and exists (select 1 from public.players where players.id = player_id and players.is_public and players.status = 'active'))
      or (feed_post_id is not null and exists (select 1 from public.feed_posts where feed_posts.id = feed_post_id and feed_posts.visibility = 'public' and feed_posts.status = 'published'))
    ))
    or owner_id = (select auth.uid())
    or public.current_user_is_admin()
  );
create policy "media assets owner write" on public.media_assets for all to authenticated
  using (owner_id = (select auth.uid()) or public.current_user_is_admin())
  with check (owner_id = (select auth.uid()) or public.current_user_is_admin());

drop policy if exists "feed posts visible read" on public.feed_posts;
drop policy if exists "feed posts author insert" on public.feed_posts;
drop policy if exists "feed posts author update" on public.feed_posts;
drop policy if exists "feed posts author delete" on public.feed_posts;
create policy "feed posts visible read" on public.feed_posts for select to anon, authenticated
  using ((visibility = 'public' and status = 'published' and public.profile_is_active(author_id))
    or author_id = (select auth.uid()) or public.current_user_is_admin());
create policy "feed posts author insert" on public.feed_posts for insert to authenticated
  with check (author_id = (select auth.uid()) and public.profile_is_active((select auth.uid())) and not is_pinned);
create policy "feed posts author update" on public.feed_posts for update to authenticated
  using (author_id = (select auth.uid()) or public.current_user_is_admin())
  with check (author_id = (select auth.uid()) or public.current_user_is_admin());
create policy "feed posts author delete" on public.feed_posts for delete to authenticated
  using (author_id = (select auth.uid()) or public.current_user_is_admin());

drop policy if exists "post comments visible read" on public.post_comments;
drop policy if exists "post comments author insert" on public.post_comments;
drop policy if exists "post comments author update" on public.post_comments;
drop policy if exists "post comments author delete" on public.post_comments;
create policy "post comments visible read" on public.post_comments for select to anon, authenticated
  using (deleted_at is null and exists (select 1 from public.feed_posts where feed_posts.id = feed_post_id and feed_posts.visibility = 'public' and feed_posts.status = 'published')
    or user_id = (select auth.uid()) or public.current_user_is_admin());
create policy "post comments author insert" on public.post_comments for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from public.feed_posts where feed_posts.id = feed_post_id and feed_posts.visibility = 'public' and feed_posts.status = 'published'));
create policy "post comments author update" on public.post_comments for update to authenticated
  using (user_id = (select auth.uid()) or public.current_user_is_admin())
  with check (user_id = (select auth.uid()) or public.current_user_is_admin());
create policy "post comments author delete" on public.post_comments for delete to authenticated
  using (user_id = (select auth.uid()) or public.current_user_is_admin());

drop policy if exists "post likes visible read" on public.post_likes;
drop policy if exists "post likes owner insert" on public.post_likes;
drop policy if exists "post likes owner delete" on public.post_likes;
create policy "post likes visible read" on public.post_likes for select to anon, authenticated
  using (exists (select 1 from public.feed_posts where feed_posts.id = feed_post_id and feed_posts.visibility = 'public' and feed_posts.status = 'published')
    or user_id = (select auth.uid()) or public.current_user_is_admin());
create policy "post likes owner insert" on public.post_likes for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from public.feed_posts where feed_posts.id = feed_post_id and feed_posts.visibility = 'public' and feed_posts.status = 'published'));
create policy "post likes owner delete" on public.post_likes for delete to authenticated
  using (user_id = (select auth.uid()) or public.current_user_is_admin());

drop policy if exists "applications participant read" on public.applications;
drop policy if exists "applications owner insert" on public.applications;
drop policy if exists "applications club update" on public.applications;
create policy "applications participant read" on public.applications for select to authenticated
  using (
    applicant_user_id = (select auth.uid())
    or exists (select 1 from public.players where players.id = player_id and public.current_user_owns_player(players.id))
    or exists (select 1 from public.coach_profiles where coach_profiles.id = coach_profile_id and coach_profiles.user_id = (select auth.uid()))
    or exists (select 1 from public.jobs where jobs.id = job_id and (jobs.posted_by_user_id = (select auth.uid()) or exists (select 1 from public.clubs where clubs.id = jobs.club_id and clubs.owner_id = (select auth.uid()))))
    or public.current_user_is_admin()
  );
create policy "applications owner insert" on public.applications for insert to authenticated
  with check (
    applicant_user_id = (select auth.uid())
    and status = 'pending'
    and (player_id is null or public.current_user_owns_player(player_id))
    and (coach_profile_id is null or exists (select 1 from public.coach_profiles where coach_profiles.id = coach_profile_id and coach_profiles.user_id = (select auth.uid())))
  );
create policy "applications club update" on public.applications for update to authenticated
  using (exists (select 1 from public.jobs where jobs.id = job_id and (jobs.posted_by_user_id = (select auth.uid()) or exists (select 1 from public.clubs where clubs.id = jobs.club_id and clubs.owner_id = (select auth.uid())))) or public.current_user_is_admin())
  with check (exists (select 1 from public.jobs where jobs.id = job_id and (jobs.posted_by_user_id = (select auth.uid()) or exists (select 1 from public.clubs where clubs.id = jobs.club_id and clubs.owner_id = (select auth.uid())))) or public.current_user_is_admin());

drop policy if exists "watchlists owner access" on public.watchlists;
create policy "watchlists owner access" on public.watchlists for all to authenticated
  using (owner_id = (select auth.uid()) or public.current_user_is_admin())
  with check (owner_id = (select auth.uid()) and (agent_profile_id is null or public.current_user_owns_agent(agent_profile_id)) or public.current_user_is_admin());

drop policy if exists "access requests participant read" on public.access_requests;
drop policy if exists "access requests agent insert" on public.access_requests;
drop policy if exists "access requests recipient update" on public.access_requests;
create policy "access requests participant read" on public.access_requests for select to authenticated
  using (agent_user_id = (select auth.uid()) or public.current_user_owns_player(player_id) or public.current_user_owns_academy(academy_id) or public.current_user_is_admin());
create policy "access requests agent insert" on public.access_requests for insert to authenticated
  with check (agent_user_id = (select auth.uid()) and status = 'pending'
    and (agent_profile_id is null or public.current_user_owns_agent(agent_profile_id)));
create policy "access requests recipient update" on public.access_requests for update to authenticated
  using (public.current_user_owns_player(player_id) or public.current_user_owns_academy(academy_id) or public.current_user_is_admin())
  with check (public.current_user_owns_player(player_id) or public.current_user_owns_academy(academy_id) or public.current_user_is_admin());

drop policy if exists "conversation participants access" on public.conversations;
create policy "conversation participants access" on public.conversations for all to authenticated
  using (initiator_id = (select auth.uid()) or recipient_id = (select auth.uid()))
  with check (initiator_id = (select auth.uid()) or recipient_id = (select auth.uid()));
drop policy if exists "message participants read" on public.messages;
drop policy if exists "conversation participants send" on public.messages;
drop policy if exists "message recipient read state" on public.messages;
create policy "message participants read" on public.messages for select to authenticated
  using (public.current_user_is_conversation_member(conversation_id));
create policy "conversation participants send" on public.messages for insert to authenticated
  with check (sender_id = (select auth.uid()) and public.current_user_is_conversation_member(conversation_id));
create policy "message recipient read state" on public.messages for update to authenticated
  using (public.current_user_is_conversation_member(conversation_id) and sender_id <> (select auth.uid()))
  with check (public.current_user_is_conversation_member(conversation_id) and sender_id <> (select auth.uid()));

drop policy if exists "agent ratings public read" on public.agent_ratings;
drop policy if exists "agent ratings verified interaction insert" on public.agent_ratings;
drop policy if exists "agent ratings owner update" on public.agent_ratings;
create policy "agent ratings public read" on public.agent_ratings for select to anon, authenticated using (true);
create policy "agent ratings verified interaction insert" on public.agent_ratings for insert to authenticated
  with check (user_id = (select auth.uid()) and public.current_user_has_agent_interaction(agent_profile_id));
create policy "agent ratings owner update" on public.agent_ratings for update to authenticated
  using (user_id = (select auth.uid()) and public.current_user_has_agent_interaction(agent_profile_id))
  with check (user_id = (select auth.uid()) and public.current_user_has_agent_interaction(agent_profile_id));

drop policy if exists "recommendations participant access" on public.agent_recommendations;
create policy "recommendations participant access" on public.agent_recommendations for select to authenticated
  using (recommender_user_id = (select auth.uid()) or public.current_user_owns_agent(agent_profile_id) or public.current_user_is_admin());
drop policy if exists "recommendations owner insert" on public.agent_recommendations;
create policy "recommendations owner insert" on public.agent_recommendations for insert to authenticated
  with check (recommender_user_id = (select auth.uid()));
drop policy if exists "recommendations participants update" on public.agent_recommendations;
create policy "recommendations participants update" on public.agent_recommendations for update to authenticated
  using (public.current_user_owns_agent(agent_profile_id) or public.current_user_is_admin())
  with check (public.current_user_owns_agent(agent_profile_id) or public.current_user_is_admin());

drop policy if exists "agent documents private access" on public.agent_documents;
create policy "agent documents private access" on public.agent_documents for all to authenticated
  using (owner_id = (select auth.uid()) or public.current_user_is_admin())
  with check ((owner_id = (select auth.uid()) and public.current_user_owns_agent(agent_profile_id)) or public.current_user_is_admin());

drop policy if exists "reports reporter insert" on public.reports;
drop policy if exists "reports reporter or admin read" on public.reports;
drop policy if exists "reports admin update" on public.reports;
create policy "reports reporter insert" on public.reports for insert to authenticated
  with check (reporter_id = (select auth.uid()) and reporter_id <> reported_user_id and status = 'pending' and reviewed_by is null and reviewed_at is null);
create policy "reports reporter or admin read" on public.reports for select to authenticated
  using (reporter_id = (select auth.uid()) or public.current_user_is_admin());
create policy "reports admin update" on public.reports for update to authenticated
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());

drop policy if exists "admin logs admin read" on public.admin_logs;
drop policy if exists "admin logs admin insert" on public.admin_logs;
create policy "admin logs admin read" on public.admin_logs for select to authenticated using (public.current_user_is_admin());
create policy "admin logs admin insert" on public.admin_logs for insert to authenticated with check (admin_id = (select auth.uid()) and public.current_user_is_admin());

drop policy if exists "saved searches owner access" on public.saved_searches;
create policy "saved searches owner access" on public.saved_searches for all to authenticated
  using (user_id = (select auth.uid()) or public.current_user_is_admin())
  with check (user_id = (select auth.uid()) or public.current_user_is_admin());

drop policy if exists "trials participants read" on public.trials;
drop policy if exists "trials organizer insert" on public.trials;
drop policy if exists "trials participant update" on public.trials;
create policy "trials participants read" on public.trials for select to authenticated
  using (organizer_user_id = (select auth.uid()) or public.current_user_owns_player(player_id) or public.current_user_is_admin());
create policy "trials organizer insert" on public.trials for insert to authenticated
  with check (organizer_user_id = (select auth.uid()) and public.profile_is_active((select auth.uid())));
create policy "trials participant update" on public.trials for update to authenticated
  using (organizer_user_id = (select auth.uid()) or public.current_user_owns_player(player_id) or public.current_user_is_admin())
  with check (organizer_user_id = (select auth.uid()) or public.current_user_owns_player(player_id) or public.current_user_is_admin());

drop policy if exists "try outs public read" on public.try_outs;
drop policy if exists "try outs owner manage" on public.try_outs;
create policy "try outs public read" on public.try_outs for select to anon, authenticated
  using (status = 'open' and public.profile_is_active(posted_by_user_id) or posted_by_user_id = (select auth.uid()) or public.current_user_is_admin());
create policy "try outs owner manage" on public.try_outs for all to authenticated
  using (posted_by_user_id = (select auth.uid()) or public.current_user_is_admin())
  with check (posted_by_user_id = (select auth.uid()) or public.current_user_is_admin());
drop policy if exists "try out interests participants read" on public.try_out_interests;
drop policy if exists "try out interests owner insert" on public.try_out_interests;
drop policy if exists "try out interests owner delete" on public.try_out_interests;
create policy "try out interests participants read" on public.try_out_interests for select to authenticated
  using (user_id = (select auth.uid()) or exists (select 1 from public.try_outs where try_outs.id = try_out_id and try_outs.posted_by_user_id = (select auth.uid())) or public.current_user_is_admin());
create policy "try out interests owner insert" on public.try_out_interests for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from public.profiles where profiles.id = (select auth.uid()) and profiles.role = 'player') and exists (select 1 from public.try_outs where try_outs.id = try_out_id and try_outs.status = 'open'));
create policy "try out interests owner delete" on public.try_out_interests for delete to authenticated
  using (user_id = (select auth.uid()) or public.current_user_is_admin());

drop policy if exists "push subscriptions owner access" on public.push_subscriptions;
create policy "push subscriptions owner access" on public.push_subscriptions for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant usage on schema public to anon, authenticated;
revoke all on public.profiles from anon;
revoke update on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, username, avatar_path, phone, updated_at, role, status) on public.profiles to authenticated;
revoke select on public.players from anon;
grant select (id, display_name, position, age, country, nationality, gender, bio, sport, primary_photo_path, is_public, status, created_at) on public.players to anon;
revoke select on public.clubs from anon;
grant select (id, name, slug, sports, country, state, about, website, logo_path, cover_image_path, status, verified_badge, created_at) on public.clubs to anon;
revoke select on public.jobs from anon;
grant select (id, club_id, academy_id, title, description, role_type, requirements, location, salary_min, salary_max, currency, contract_type, application_deadline, sport, status, created_at) on public.jobs to anon;
grant select, insert, update, delete on public.academy_profiles, public.agent_profiles, public.coach_profiles, public.teams, public.player_private, public.coach_private, public.academy_verifications, public.agent_verifications, public.media_assets, public.feed_posts, public.post_comments, public.post_likes, public.watchlists, public.access_requests, public.conversations, public.messages, public.agent_ratings, public.agent_recommendations, public.agent_documents, public.reports, public.admin_logs, public.saved_searches, public.trials, public.try_outs, public.try_out_interests, public.push_subscriptions to authenticated;
grant select (id, user_id, club_id, sports, year_founded, leagues, languages, linkedin, created_at, updated_at) on public.academy_profiles to authenticated;
grant select (id, user_id, agency_name, sport, nationality, gender, experience_years, regions, about, achievements, photo_path, cover_image_path, linkedin, is_public, verified_badge, created_at, updated_at) on public.agent_profiles to anon, authenticated;
grant select (id, user_id, sport, full_name, badges, preferred_role, experience_years, current_club, nationality, gender, about, achievements, photo_path, cover_image_path, open_to_work, linkedin, is_public, created_at, updated_at) on public.coach_profiles to anon, authenticated;
grant select (id, academy_id, sport, name, season, age_group, coach_name, created_at) on public.teams to anon;
grant select (id, author_id, sport, content, media_urls, visibility, status, is_pinned, is_training, training_link, training_at, is_live, live_link, live_at, likes_count, comments_count, created_at) on public.feed_posts to anon;
grant select (id, feed_post_id, user_id, body, created_at) on public.post_comments to anon;
grant select (id, feed_post_id, user_id, created_at) on public.post_likes to anon;
grant select (id, posted_by_user_id, sport, gender, title, description, location, scheduled_date, age_group, status, created_at) on public.try_outs to anon;
revoke select on public.media_assets from anon;
grant select (id, player_id, feed_post_id, asset_type, storage_bucket, storage_path, external_url, youtube_embed_id, title, thumbnail_path, duration_seconds, is_featured, visibility, sort_order, created_at) on public.media_assets to anon;
grant select on public.media_assets to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-media', 'public-media', true, 52428800, array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm']),
  ('private-media', 'private-media', false, 52428800, array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm']),
  ('private-documents', 'private-documents', false, 20971520, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "sportbridge public media read" on storage.objects;
drop policy if exists "sportbridge public media owner insert" on storage.objects;
drop policy if exists "sportbridge public media owner update" on storage.objects;
drop policy if exists "sportbridge public media owner delete" on storage.objects;
drop policy if exists "sportbridge private docs owner select" on storage.objects;
drop policy if exists "sportbridge private docs owner insert" on storage.objects;
drop policy if exists "sportbridge private docs owner update" on storage.objects;
drop policy if exists "sportbridge private docs owner delete" on storage.objects;
drop policy if exists "sportbridge private media owner select" on storage.objects;
drop policy if exists "sportbridge private media owner insert" on storage.objects;
drop policy if exists "sportbridge private media owner update" on storage.objects;
drop policy if exists "sportbridge private media owner delete" on storage.objects;
create policy "sportbridge public media read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'public-media');
create policy "sportbridge public media owner insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'public-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "sportbridge public media owner update" on storage.objects for update to authenticated
  using (bucket_id = 'public-media' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'public-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "sportbridge public media owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'public-media' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.current_user_is_admin()));
create policy "sportbridge private docs owner select" on storage.objects for select to authenticated
  using (bucket_id = 'private-documents' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.current_user_is_admin()));
create policy "sportbridge private docs owner insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'private-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "sportbridge private docs owner update" on storage.objects for update to authenticated
  using (bucket_id = 'private-documents' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.current_user_is_admin()))
  with check (bucket_id = 'private-documents' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.current_user_is_admin()));
create policy "sportbridge private docs owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'private-documents' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.current_user_is_admin()));
create policy "sportbridge private media owner select" on storage.objects for select to authenticated
  using (bucket_id = 'private-media' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.current_user_is_admin()));
create policy "sportbridge private media owner insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'private-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "sportbridge private media owner update" on storage.objects for update to authenticated
  using (bucket_id = 'private-media' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.current_user_is_admin()))
  with check (bucket_id = 'private-media' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.current_user_is_admin()));
create policy "sportbridge private media owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'private-media' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.current_user_is_admin()));

alter table public.notifications enable row level security;
drop policy if exists "notifications owner read" on public.notifications;
drop policy if exists "notifications owner read state" on public.notifications;
create policy "notifications owner read" on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy "notifications owner read state" on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

revoke select on public.teams, public.feed_posts, public.post_comments, public.post_likes, public.try_outs from anon;
revoke select (academy_id) on public.teams from anon;
revoke select (author_id) on public.feed_posts from anon;
revoke select (user_id) on public.post_comments from anon;
revoke select (user_id) on public.post_likes from anon;
revoke select (posted_by_user_id) on public.try_outs from anon;
revoke select on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;
revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;
revoke update on public.messages from authenticated;
grant update (is_read, read_at) on public.messages to authenticated;

revoke select on public.agent_profiles, public.coach_profiles from anon;
revoke select (user_id) on public.agent_profiles from anon;
revoke select (user_id) on public.coach_profiles from anon;
grant select (id, agency_name, sport, nationality, gender, experience_years, regions, about, achievements, photo_path, cover_image_path, linkedin, is_public, verified_badge, created_at, updated_at) on public.agent_profiles to anon;
grant select (id, sport, full_name, badges, preferred_role, experience_years, current_club, nationality, gender, about, achievements, photo_path, cover_image_path, open_to_work, linkedin, is_public, created_at, updated_at) on public.coach_profiles to anon;
grant select (id, agent_profile_id, sport, score, comment, created_at, updated_at) on public.agent_ratings to anon;

drop policy if exists "notifications are visible by everyone" on public.notifications;
drop policy if exists "notifications can be updated by everyone" on public.notifications;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_status_allowed') then
    alter table public.profiles add constraint profiles_status_allowed check (status in ('pending','active','suspended','denied'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'players_sport_allowed') then
    alter table public.players add constraint players_sport_allowed check (sport in ('football','basketball'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'players_status_allowed') then
    alter table public.players add constraint players_status_allowed check (status in ('pending','active','suspended','denied'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'clubs_status_allowed') then
    alter table public.clubs add constraint clubs_status_allowed check (status in ('active','suspended','closed'));
  end if;
end;
$$;
