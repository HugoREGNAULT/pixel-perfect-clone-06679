-- ============================================================
-- Admin roles — ajoute role à profiles + helper is_admin()
-- + tables signalements & admin_settings
-- ============================================================

-- 1. Add role column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin', 'moderator'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS banned_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- 2. is_admin() SECURITY DEFINER helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
$$;

-- 3. Update profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (is_admin() OR auth.uid() = id);

DROP POLICY IF EXISTS "admin_update_profiles" ON public.profiles;
CREATE POLICY "admin_update_profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 4. Admin read for candidatures
DROP POLICY IF EXISTS "admin_read_candidatures" ON public.candidatures;
CREATE POLICY "admin_read_candidatures" ON public.candidatures
  FOR SELECT TO authenticated USING (is_admin());

-- 5. Admin read for subscriptions
DROP POLICY IF EXISTS "admin_read_subs" ON public.subscriptions;
CREATE POLICY "admin_read_subs" ON public.subscriptions
  FOR SELECT TO authenticated USING (is_admin());

-- Admin can also update subscriptions (grant premium)
DROP POLICY IF EXISTS "admin_update_subs" ON public.subscriptions;
CREATE POLICY "admin_update_subs" ON public.subscriptions
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 6. Admin read for newsletter_signups
DROP POLICY IF EXISTS "newsletter_admin_select" ON public.newsletter_signups;
CREATE POLICY "newsletter_admin_select" ON public.newsletter_signups
  FOR SELECT TO authenticated USING (is_admin());

-- 7. Admin read for founders
DROP POLICY IF EXISTS "founders_admin_select" ON public.founders;
CREATE POLICY "founders_admin_select" ON public.founders
  FOR SELECT TO authenticated USING (is_admin());

-- 8. Admin write for offres (validate, feature, delete)
DROP POLICY IF EXISTS "admin_write_offres" ON public.offres;
CREATE POLICY "admin_write_offres" ON public.offres
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- 9. signalements table
CREATE TABLE IF NOT EXISTS public.signalements (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type  text        NOT NULL CHECK (content_type IN ('profil','offre','message','avis')),
  content_id    text,
  content_excerpt text,
  reason        text        NOT NULL,
  status        text        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','ignored','actioned','banned')),
  created_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.signalements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "signalements_insert" ON public.signalements;
CREATE POLICY "signalements_insert"       ON public.signalements
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
DROP POLICY IF EXISTS "signalements_admin_read" ON public.signalements;
CREATE POLICY "signalements_admin_read"   ON public.signalements
  FOR SELECT TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "signalements_admin_update" ON public.signalements;
CREATE POLICY "signalements_admin_update" ON public.signalements
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
GRANT INSERT                ON public.signalements TO authenticated;
GRANT SELECT, UPDATE        ON public.signalements TO authenticated;
GRANT ALL                   ON public.signalements TO service_role;

-- Seed some demo reports so the page isn't empty
INSERT INTO public.signalements (reporter_id, content_type, content_excerpt, reason, status)
SELECT auth.uid(), 'offre', 'Offre de stage bidon', 'Contenu trompeur', 'pending'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

-- 10. admin_settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  key        text    PRIMARY KEY,
  value      jsonb   NOT NULL DEFAULT 'null',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_settings_select" ON public.admin_settings;
CREATE POLICY "admin_settings_select" ON public.admin_settings
  FOR SELECT TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "admin_settings_all" ON public.admin_settings;
CREATE POLICY "admin_settings_all" ON public.admin_settings
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
GRANT SELECT, INSERT, UPDATE ON public.admin_settings TO authenticated;
GRANT ALL                    ON public.admin_settings TO service_role;

INSERT INTO public.admin_settings (key, value) VALUES
  ('registrations_enabled',    'true'),
  ('maintenance_message',      'null'),
  ('max_candidatures_per_month','10'),
  ('commission_rate',          '0.15'),
  ('support_email',            '"support@springr.app"')
ON CONFLICT (key) DO NOTHING;
