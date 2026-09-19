-- ============================================================
-- Fix: find_user_by_email should not require existing conversation
-- Allows users to start new conversations with anyone by email
-- ============================================================

DROP FUNCTION IF EXISTS public.find_user_by_email(text);

-- Search by email without requiring existing conversation
-- Returns: id, display_name (email removed for privacy)
CREATE OR REPLACE FUNCTION public.find_user_by_email(p_email text)
RETURNS TABLE (id uuid, display_name text)
LANGUAGE sql SECURITY DEFINER SET search_path = auth, public AS $$
  SELECT
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) AS display_name
  FROM auth.users u
  WHERE lower(u.email) = lower(p_email)
    AND u.id != auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.find_user_by_email TO authenticated;
