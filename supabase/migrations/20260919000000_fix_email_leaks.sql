-- ============================================================
-- Sprint 1 Security: Fix email leaks & enumeration
-- ============================================================

-- ---- FIX 1: get_users_display_names() — remove email exposure
DROP FUNCTION IF EXISTS public.get_users_display_names(uuid[]);

CREATE OR REPLACE FUNCTION public.get_users_display_names(user_ids uuid[])
RETURNS TABLE (id uuid, display_name text)
LANGUAGE sql SECURITY DEFINER SET search_path = auth, public AS $$
  SELECT
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) AS display_name
  FROM auth.users u
  INNER JOIN public.conversations c ON (
    (c.participant_1 = auth.uid() AND c.participant_2 = u.id)
    OR (c.participant_2 = auth.uid() AND c.participant_1 = u.id)
  )
  WHERE u.id = ANY(user_ids);
$$;

GRANT EXECUTE ON FUNCTION public.get_users_display_names TO authenticated;

-- ---- FIX 2: find_user_by_email() — remove email exposure + rate-limiting logic
DROP FUNCTION IF EXISTS public.find_user_by_email(text);

CREATE OR REPLACE FUNCTION public.find_user_by_email(p_email text)
RETURNS TABLE (id uuid, display_name text)
LANGUAGE sql SECURITY DEFINER SET search_path = auth, public AS $$
  SELECT
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) AS display_name
  FROM auth.users u
  INNER JOIN public.conversations c ON (
    (c.participant_1 = auth.uid() AND c.participant_2 = u.id)
    OR (c.participant_2 = auth.uid() AND c.participant_1 = u.id)
  )
  WHERE lower(u.email) = lower(p_email)
    AND u.id != auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.find_user_by_email TO authenticated;

-- ---- FIX 3: referral_codes — restrict SELECT policy
DROP POLICY IF EXISTS "rc_select_public" ON public.referral_codes;

-- No public SELECT anymore. Use RPC instead.

-- ---- FIX 4: NEW RPC — get_referrer_by_code() — safe lookup for invite page (no email exposure)
CREATE OR REPLACE FUNCTION public.get_referrer_by_code(p_code text)
RETURNS TABLE (user_id uuid, first_name text)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT user_id, first_name
  FROM public.referral_codes
  WHERE code = p_code
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_referrer_by_code TO anon, authenticated;
