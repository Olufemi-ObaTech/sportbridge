-- Apply after schema.sql and fix-public-badge-relationships.sql on existing
-- Supabase projects. This keeps client UI checks backed by database controls.
begin;

-- Add columns used by the public badge projection and verification checks for
-- installations that predate the current profile schema.
alter table public.profiles
  add column if not exists role text not null default 'player'
    check (role in ('player','coach','agent','academy','super_admin')),
  add column if not exists status text not null default 'active'
    check (status in ('pending','active','suspended','denied')),
  add column if not exists country text,
  add column if not exists region text,
  add column if not exists verification_status text not null default 'unverified'
    check (verification_status in ('unverified','pending','verified','rejected')),
  add column if not exists verification_badge text;

grant update (country, region) on public.profiles to authenticated;

create or replace view public.public_profile_badges
with (security_barrier = true)
as
select id, role, verification_status, verification_badge
from public.profiles
where status = 'active';

revoke all on public.public_profile_badges from public;
grant select on public.public_profile_badges to anon, authenticated;

grant select (
  id, profile_id, display_name, position, secondary_position, age, country,
  nationality, gender, bio, sport, primary_photo_path, is_public, status,
  region, preferred_foot, foot, dominant_hand, height_cm, weight_kg,
  age_group, availability, stats, achievements, achievements_data, linkedin,
  views_count, current_club, created_at
) on public.players to anon;
grant select (
  id, profile_id, academy_id, display_name, position, secondary_position,
  age, country, nationality, gender, bio, sport, primary_photo_path,
  is_public, status, region, preferred_foot, foot, dominant_hand, height_cm,
  weight_kg, age_group, availability, stats, achievements, achievements_data,
  linkedin, views_count, current_club, created_at
) on public.players to authenticated;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'super_admin'
  );
$function$;

create or replace function public.profile_is_active(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.profiles
    where id = p_user_id and status = 'active'
  );
$function$;

create or replace function public.current_user_is_verified()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and status = 'active'
      and verification_status = 'verified'
  );
$function$;

revoke all on function public.current_user_is_admin() from public, anon;
revoke all on function public.profile_is_active(uuid) from public, anon;
revoke all on function public.current_user_is_verified() from public, anon;
grant execute on function public.current_user_is_admin() to authenticated;
grant execute on function public.profile_is_active(uuid) to authenticated;
grant execute on function public.current_user_is_verified() to authenticated;

alter table public.media_assets
  add column if not exists video_kind text,
  add column if not exists file_hash text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.media_assets'::regclass
      and conname = 'media_assets_video_kind_check'
  ) then
    alter table public.media_assets
      add constraint media_assets_video_kind_check
      check (video_kind is null or video_kind in ('highlight','full_match','training'));
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.media_assets'::regclass
      and conname = 'media_assets_file_hash_check'
  ) then
    alter table public.media_assets
      add constraint media_assets_file_hash_check
      check (file_hash is null or file_hash ~ '^[a-f0-9]{64}$');
  end if;
end;
$$;

update public.media_assets
set video_kind = case
  when lower(coalesce(title, '')) like '%full match%' then 'full_match'
  when lower(coalesce(title, '')) like '%training%' then 'training'
  when lower(coalesce(title, '')) like '%highlight%' then 'highlight'
  else null
end
where asset_type = 'video' and video_kind is null;

update public.media_assets as media_row
set file_hash = upload_row.file_hash
from public.uploads as upload_row
where media_row.owner_id = upload_row.user_id
  and media_row.storage_path = upload_row.url
  and media_row.file_hash is null
  and media_row.asset_type = 'video';

grant select (video_kind, file_hash) on public.media_assets to anon;

create or replace function public.flag_opportunity_for_review()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  requires_review boolean;
begin
  if public.current_user_is_admin() then
    return new;
  end if;

  requires_review :=
    new.fee_amount > 0
    or new.is_fee_flagged
    or lower(coalesce(new.title, '') || ' ' || coalesce(new.description, ''))
      ~ '(guaranteed selection|guaranteed trial|100% selection|100% guaranteed|pay before trial|pay to be selected|must pay|payment required|pay to play|pay for trial)';

  new.is_fee_flagged := requires_review;
  if requires_review then
    new.status := 'pending_approval';
  end if;
  return new;
end;
$$;

drop trigger if exists flag_opportunity_for_review on public.opportunities;
create trigger flag_opportunity_for_review
  before insert or update on public.opportunities
  for each row execute function public.flag_opportunity_for_review();

drop policy if exists "uploads owner access" on public.uploads;
create policy "uploads owner access" on public.uploads
  for select to authenticated
  using (user_id = (select auth.uid()) or public.current_user_is_admin());

drop policy if exists "uploads hash lookup" on public.uploads;
revoke insert, update, delete on public.uploads from authenticated;

create or replace function public.upload_hash_exists_for_other_user(p_file_hash text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'Sign in before checking duplicate uploads.';
  end if;
  if p_file_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'A valid SHA-256 hash is required.';
  end if;

  return exists (
    select 1
    from public.uploads
    where file_hash = p_file_hash and user_id <> current_user_id
  );
end;
$$;

create or replace function public.register_upload_record(
  p_file_hash text,
  p_file_type text,
  p_url text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'Sign in before recording an upload.';
  end if;
  if p_file_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'A valid SHA-256 hash is required.';
  end if;
  if coalesce(length(p_file_type), 0) = 0 or coalesce(length(p_file_type), 0) > 128 then
    raise exception 'A valid file type is required.';
  end if;
  if coalesce(length(p_url), 0) = 0 or coalesce(length(p_url), 0) > 2048 then
    raise exception 'A valid storage path is required.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_file_hash, 0));

  if exists (
    select 1 from public.uploads
    where file_hash = p_file_hash and user_id <> current_user_id
  ) then
    insert into public.uploads (user_id, file_hash, file_type, url, is_duplicate)
    values (current_user_id, p_file_hash, p_file_type, p_url, true);
    return false;
  end if;

  if not exists (
    select 1 from public.uploads
    where file_hash = p_file_hash and user_id = current_user_id
  ) then
    insert into public.uploads (user_id, file_hash, file_type, url)
    values (current_user_id, p_file_hash, p_file_type, p_url);
  end if;
  return true;
end;
$$;

revoke all on function public.upload_hash_exists_for_other_user(text) from public, anon;
revoke all on function public.register_upload_record(text, text, text) from public, anon;
grant execute on function public.upload_hash_exists_for_other_user(text) to authenticated;
grant execute on function public.register_upload_record(text, text, text) to authenticated;
grant select on public.uploads to authenticated;

drop policy if exists "contact unlock owner" on public.contact_unlocks;
create policy "contact unlock owner" on public.contact_unlocks
  for select to authenticated
  using (unlocker_id = (select auth.uid()) or public.current_user_is_admin());

drop policy if exists "contact unlock verified insert" on public.contact_unlocks;
create policy "contact unlock verified insert" on public.contact_unlocks
  for insert to authenticated
  with check (
    unlocker_id = (select auth.uid())
    and public.current_user_is_verified()
    and exists (
      select 1
      from public.players as player_row
      where player_row.id = contact_unlocks.player_id
        and player_row.profile_id <> (select auth.uid())
        and player_row.is_public
        and player_row.status = 'active'
        and public.profile_is_active(player_row.profile_id)
    )
  );

create or replace function public.public_profile_badges(opportunity_row public.opportunities)
returns setof public.public_profile_badges
rows 1
language sql
stable
set search_path = ''
as $function$
  select badge.*
  from public.public_profile_badges as badge
  where badge.id = opportunity_row.posted_by
$function$;

revoke all on function public.public_profile_badges(public.opportunities) from public;
grant execute on function public.public_profile_badges(public.opportunities) to anon, authenticated;

create or replace function public.review_verification_request(
  p_request_id uuid,
  p_approved boolean,
  p_reviewer_notes text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row public.verification_requests%rowtype;
  badge_label text;
  coach_role text;
begin
  if not public.current_user_is_admin() then
    raise exception 'Only an administrator can review verification requests.';
  end if;

  select * into request_row
  from public.verification_requests
  where id = p_request_id and status = 'pending'
  for update;

  if not found then
    raise exception 'Pending verification request was not found.';
  end if;

  if p_approved then
    if request_row.role = 'player' then
      if not exists (
        select 1
        from public.players as player_row
        join public.media_assets as media_row on media_row.player_id = player_row.id
        where player_row.profile_id = request_row.user_id
          and media_row.owner_id = request_row.user_id
          and media_row.asset_type = 'video'
          and media_row.video_kind = 'full_match'
          and media_row.visibility = 'public'
      ) then
        raise exception 'A public full-match video must be uploaded before player verification can be approved.';
      end if;
      badge_label := 'Verified Player';
    elsif request_row.role = 'academy' then
      badge_label := case
        when request_row.fa_verification_body like 'FIFA TMS:%' then 'FIFA TMS Verified Academy / Club'
        else 'Verified Academy / Club'
      end;
    elsif request_row.role = 'agent' then
      badge_label := case when request_row.fifa_agent_id is not null
        then 'FIFA Agent Verified'
        else 'Verified Agent / Scout'
      end;
    elsif request_row.role = 'coach' then
      select preferred_role into coach_role
      from public.coach_profiles where user_id = request_row.user_id;
      badge_label := case
        when lower(coalesce(coach_role, '')) like '%goal%keep%' then 'Verified Goalkeeper Coach'
        when lower(coalesce(coach_role, '')) like '%fitness%' or lower(coalesce(coach_role, '')) like '%physio%' then 'Verified Fitness Coach'
        when lower(coalesce(coach_role, '')) like '%team manager%' then 'Verified Team Manager'
        when lower(coalesce(coach_role, '')) like '%sporting director%' then 'Verified Sporting Director'
        when lower(coalesce(coach_role, '')) like '%scout%' then 'Verified Scout'
        else 'Verified Coach'
      end;
    else
      badge_label := 'Verified';
    end if;
  end if;

  update public.verification_requests
  set status = case when p_approved then 'approved' else 'rejected' end,
      reviewer_id = (select auth.uid()),
      reviewer_notes = p_reviewer_notes,
      reviewed_at = now()
  where id = request_row.id;

  update public.profiles
  set verification_status = case when p_approved then 'verified' else 'rejected' end,
      verification_badge = case when p_approved then badge_label else null end
  where id = request_row.user_id;

  if request_row.role = 'agent' then
    update public.agent_profiles set verified_badge = p_approved where user_id = request_row.user_id;
  elsif request_row.role = 'academy' then
    update public.clubs set verified_badge = p_approved where owner_id = request_row.user_id;
  end if;
  return badge_label;
end;
$$;

revoke all on function public.review_verification_request(uuid, boolean, text) from public, anon;
grant execute on function public.review_verification_request(uuid, boolean, text) to authenticated;

notify pgrst, 'reload schema';
commit;
