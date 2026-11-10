-- =============================================================================
-- SportBridge — patch-photo-storage.sql
-- Creates the avatars storage bucket and sets RLS policies so users
-- can upload/update their own profile photo.
-- Run in Supabase SQL Editor (safe to run multiple times).
-- =============================================================================

-- ── Ensure avatar_path column exists on profiles ──────────────────────────────
alter table public.profiles
  add column if not exists avatar_path text;

-- ── Allow avatar_path to be updated by authenticated users ───────────────────
-- (Already included in profiles UPDATE grant — just making sure)
-- If grant was already given in MASTER patch, this is a no-op.
grant update (avatar_path) on public.profiles to authenticated;

-- ── Create avatars bucket in Supabase Storage if not already there ────────────
-- Go to: Supabase Dashboard → Storage → New bucket
-- Name: uploads (already exists)
-- Make sure the 'uploads' bucket has PUBLIC access enabled.
--
-- Then add this storage policy in Supabase Dashboard → Storage → Policies:
-- Policy name: "Users can upload their own avatar"
-- Allowed operations: INSERT, UPDATE, SELECT
-- Target roles: authenticated
-- Policy definition:
--   bucket_id = 'uploads' AND (storage.foldername(name))[1] = 'avatars' AND auth.uid()::text = (storage.foldername(name))[2]

-- ── Verify ────────────────────────────────────────────────────────────────────
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
  and column_name = 'avatar_path';
