-- Public sharing RPCs must compare usernames literally and must never expose
-- private location data (or the owning auth user ID) to anonymous callers.

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
  FROM public.records AS r
  INNER JOIN public.profiles AS p ON p.id = r.user_id
  WHERE lower(p.username) = lower(p_username)
    AND r.id = p_record_id
    AND r.visibility IN ('unlisted', 'public');
$$;

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
  FROM public.records AS r
  INNER JOIN public.profiles AS p ON p.id = r.user_id
  WHERE lower(p.username) = lower(p_username)
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
  SELECT p.id, p.username, p.display_name, p.bio, p.avatar_url
  FROM public.profiles AS p
  WHERE lower(p.username) = lower(p_username);
$$;

DROP FUNCTION public.get_public_profile_records(text, integer, integer);

CREATE FUNCTION public.get_public_profile_records(
  p_username text,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  pair_id uuid,
  created_at timestamptz,
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
    r.id,
    r.pair_id,
    r.created_at,
    r.date,
    r.category,
    r.name,
    r.producer,
    r.style,
    r.sub_info,
    CASE WHEN r.hide_place_when_shared THEN NULL ELSE r.place END AS place,
    r.rating,
    r.flavor_metrics,
    r.comment,
    r.visibility,
    r.hide_place_when_shared
  FROM public.records AS r
  INNER JOIN public.profiles AS p ON p.id = r.user_id
  WHERE lower(p.username) = lower(p_username)
    AND r.visibility = 'public'
  ORDER BY r.date DESC, r.created_at DESC
  LIMIT greatest(0, least(p_limit, 100))
  OFFSET greatest(0, p_offset);
$$;

REVOKE ALL ON FUNCTION public.get_shared_record(text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_shared_pair_records(text, uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_profile(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_profile_records(text, integer, integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_shared_record(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_shared_pair_records(text, uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile_records(text, integer, integer) TO anon, authenticated;

-- Evaluate auth.uid() once per statement instead of once per scanned row.
ALTER POLICY "records_select_own"
  ON public.records
  USING ((SELECT auth.uid()) = user_id);

ALTER POLICY "records_insert_own"
  ON public.records
  WITH CHECK ((SELECT auth.uid()) = user_id);

ALTER POLICY "records_update_own"
  ON public.records
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

ALTER POLICY "records_delete_own"
  ON public.records
  USING ((SELECT auth.uid()) = user_id);

ALTER POLICY "profiles_insert_own"
  ON public.profiles
  WITH CHECK ((SELECT auth.uid()) = id);

ALTER POLICY "profiles_update_own"
  ON public.profiles
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

ALTER POLICY "profiles_delete_own"
  ON public.profiles
  USING ((SELECT auth.uid()) = id);
