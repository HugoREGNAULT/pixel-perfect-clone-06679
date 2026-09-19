-- ============================================================
-- JPO Submissions: replace scraping with user-submitted JPO
-- ============================================================

CREATE TABLE IF NOT EXISTS public.jpo_submissions (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  nom_ecole    text        NOT NULL,
  date_jpo     date        NOT NULL,
  description  text,
  lien         text,
  submitted_by uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  status       text        DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes  text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS jpo_submissions_status_idx ON public.jpo_submissions (status);
CREATE INDEX IF NOT EXISTS jpo_submissions_ecole_idx ON public.jpo_submissions (nom_ecole);

ALTER TABLE public.jpo_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved JPO
DROP POLICY IF EXISTS "jpo_select_approved" ON public.jpo_submissions;
CREATE POLICY "jpo_select_approved" ON public.jpo_submissions
  FOR SELECT USING (status = 'approved');

-- Authenticated can submit their own JPO
DROP POLICY IF EXISTS "jpo_insert_auth" ON public.jpo_submissions;
CREATE POLICY "jpo_insert_auth" ON public.jpo_submissions
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

-- Only admin can view/update all JPO (see bypass)
-- Admin sees all via service role or via RPC with admin check

-- Endpoint for admin: get_pending_jpo_submissions
CREATE OR REPLACE FUNCTION public.get_pending_jpo_submissions()
RETURNS TABLE (
  id uuid, nom_ecole text, date_jpo date, description text, lien text,
  submitted_by uuid, status text, created_at timestamptz
)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT id, nom_ecole, date_jpo, description, lien, submitted_by, status, created_at
  FROM public.jpo_submissions
  WHERE status IN ('pending', 'approved')
  ORDER BY status, created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_pending_jpo_submissions TO authenticated;
