-- ============================================================
-- Springr – candidatures status, alertes emploi, profile views, CV storage
-- ============================================================

-- ------------------------------------------------------------------ candidatures: add status + metadata
ALTER TABLE public.candidatures
  ADD COLUMN IF NOT EXISTS status     text        NOT NULL DEFAULT 'envoyée'
    CHECK (status IN ('envoyée','vue','refusée','acceptée')),
  ADD COLUMN IF NOT EXISTS notes      text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS candidatures_updated_at ON public.candidatures;
CREATE TRIGGER candidatures_updated_at
  BEFORE UPDATE ON public.candidatures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------ alertes_emploi
CREATE TABLE public.alertes_emploi (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency text        NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('daily','weekly')),
  sectors   text[]      NOT NULL DEFAULT '{}',
  types     text[]      NOT NULL DEFAULT '{}',
  active    boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.alertes_emploi ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "alertes_own_all" ON public.alertes_emploi;
CREATE POLICY "alertes_own_all" ON public.alertes_emploi
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.alertes_emploi TO authenticated;
GRANT ALL ON public.alertes_emploi TO service_role;

-- ------------------------------------------------------------------ profile_views
CREATE TABLE public.profile_views (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_id  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "views_owner_read" ON public.profile_views;
CREATE POLICY "views_owner_read" ON public.profile_views FOR SELECT TO authenticated
  USING (auth.uid() = profile_id);
DROP POLICY IF EXISTS "views_anyone_insert" ON public.profile_views;
CREATE POLICY "views_anyone_insert" ON public.profile_views FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = viewer_id AND viewer_id <> profile_id);

GRANT SELECT ON public.profile_views TO authenticated;
GRANT INSERT ON public.profile_views TO authenticated;
GRANT ALL    ON public.profile_views TO service_role;

-- ------------------------------------------------------------------ CV Storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('cvs', 'cvs', false, 5242880, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "cv_own_select" ON storage.objects;
CREATE POLICY "cv_own_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "cv_own_insert" ON storage.objects;
CREATE POLICY "cv_own_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "cv_own_update" ON storage.objects;
CREATE POLICY "cv_own_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "cv_own_delete" ON storage.objects;
CREATE POLICY "cv_own_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);
