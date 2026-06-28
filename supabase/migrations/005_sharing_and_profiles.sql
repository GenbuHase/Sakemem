-- Sakemem: profiles, sharing visibility, RPC functions, profile-images storage

-- profiles
CREATE TABLE public.profiles (
  id           uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     text        NOT NULL,
  display_name text        NOT NULL,
  avatar_url   text,
  bio          text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT profiles_username_format CHECK (
    username ~ '^[a-zA-Z0-9_-]{3,30}$'
  )
);

CREATE UNIQUE INDEX profiles_username_key ON public.profiles (lower(username));

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_public"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- records: visibility & place mask
ALTER TABLE public.records
  ADD COLUMN visibility text NOT NULL DEFAULT 'private',
  ADD COLUMN hide_place_when_shared boolean NOT NULL DEFAULT false;

ALTER TABLE public.records
  ADD CONSTRAINT records_visibility_check CHECK (
    visibility IN ('private', 'unlisted', 'public')
  );

CREATE INDEX records_user_public_idx
  ON public.records (user_id, date DESC, created_at DESC)
  WHERE visibility = 'public';

-- profile-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "profile_images_select_public"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'profile-images');

CREATE POLICY "profile_images_insert_own"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "profile_images_update_own"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "profile_images_delete_own"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- shared record (single)
CREATE OR REPLACE FUNCTION public.get_shared_record(
  p_username text,
  p_record_id uuid
)
RETURNS TABLE (
  id uuid,
  pair_id uuid,
  date date,
  category text,
  name text,
  producer text,
  style text,
  sub_info text,
  place text,
  rating integer,
  flavor_metrics jsonb,
  comment text,
  visibility text,
  hide_place_when_shared boolean,
  profile_username text,
  profile_display_name text,
  profile_bio text,
  profile_avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id, r.pair_id, r.date, r.category, r.name, r.producer, r.style,
    r.sub_info,
    CASE WHEN r.hide_place_when_shared THEN NULL ELSE r.place END AS place,
    r.rating, r.flavor_metrics, r.comment, r.visibility,
    r.hide_place_when_shared,
    p.username, p.display_name, p.bio, p.avatar_url
  FROM public.records r
  INNER JOIN public.profiles p ON p.id = r.user_id
  WHERE p.username ILIKE p_username
    AND r.id = p_record_id
    AND r.visibility IN ('unlisted', 'public');
$$;

-- pair members for shared record page (unlisted/public only)
CREATE OR REPLACE FUNCTION public.get_shared_pair_records(
  p_username text,
  p_pair_id uuid,
  p_exclude_id uuid
)
RETURNS TABLE (
  id uuid,
  pair_id uuid,
  date date,
  category text,
  name text,
  producer text,
  style text,
  sub_info text,
  place text,
  rating integer,
  flavor_metrics jsonb,
  comment text,
  visibility text,
  hide_place_when_shared boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id, r.pair_id, r.date, r.category, r.name, r.producer, r.style,
    r.sub_info,
    CASE WHEN r.hide_place_when_shared THEN NULL ELSE r.place END AS place,
    r.rating, r.flavor_metrics, r.comment, r.visibility,
    r.hide_place_when_shared
  FROM public.records r
  INNER JOIN public.profiles p ON p.id = r.user_id
  WHERE p.username ILIKE p_username
    AND r.pair_id = p_pair_id
    AND r.id <> p_exclude_id
    AND r.visibility IN ('unlisted', 'public');
$$;

CREATE OR REPLACE FUNCTION public.get_public_profile(
  p_username text
)
RETURNS TABLE (
  id uuid,
  username text,
  display_name text,
  bio text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, username, display_name, bio, avatar_url
  FROM public.profiles
  WHERE username ILIKE p_username;
$$;

CREATE OR REPLACE FUNCTION public.get_public_profile_records(
  p_username text,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS SETOF public.records
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.*
  FROM public.records r
  INNER JOIN public.profiles p ON p.id = r.user_id
  WHERE p.username ILIKE p_username
    AND r.visibility = 'public'
  ORDER BY r.date DESC, r.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;

CREATE OR REPLACE FUNCTION public.check_username_available(
  p_username text,
  p_exclude_user_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE lower(username) = lower(p_username)
      AND (p_exclude_user_id IS NULL OR id <> p_exclude_user_id)
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_record(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_shared_pair_records(text, uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile_records(text, integer, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_username_available(text, uuid) TO anon, authenticated;
