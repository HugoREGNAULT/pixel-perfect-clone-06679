DROP FUNCTION IF EXISTS public.get_pending_jpo_submissions();

DROP POLICY IF EXISTS "jpo_admin_select" ON public.jpo_submissions;
DROP POLICY IF EXISTS "jpo_admin_update" ON public.jpo_submissions;
DROP POLICY IF EXISTS "jpo_admin_delete" ON public.jpo_submissions;
DROP POLICY IF EXISTS "jpo_insert_auth"  ON public.jpo_submissions;

CREATE POLICY "jpo_insert_auth" ON public.jpo_submissions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = submitted_by AND status = 'pending');

CREATE POLICY "jpo_admin_select" ON public.jpo_submissions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "jpo_admin_update" ON public.jpo_submissions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "jpo_admin_delete" ON public.jpo_submissions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
