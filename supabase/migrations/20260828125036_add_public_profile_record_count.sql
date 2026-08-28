CREATE INDEX IF NOT EXISTS records_user_timeline_cursor_idx
  ON public.records (user_id, date DESC, created_at DESC, id DESC);

CREATE OR REPLACE FUNCTION public.get_public_profile_records_count(
  p_username text
)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)
  FROM public.records AS r
  INNER JOIN public.profiles AS p ON p.id = r.user_id
  WHERE lower(p.username) = lower(p_username)
    AND r.visibility = 'public';
$$;

REVOKE ALL ON FUNCTION public.get_public_profile_records_count(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profile_records_count(text)
  TO anon, authenticated;
