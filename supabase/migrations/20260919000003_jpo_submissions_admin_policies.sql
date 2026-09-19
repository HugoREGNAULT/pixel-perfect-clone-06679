-- ============================================================
-- jpo_submissions: Add admin policies + remove get_pending_jpo_submissions
-- ============================================================

-- Remove the old RPC
DROP FUNCTION IF EXISTS public.get_pending_jpo_submissions();

-- Add admin policies for SELECT, UPDATE, DELETE
DROP POLICY IF EXISTS "jpo_admin_select" ON public.jpo_submissions;
DROP POLICY IF EXISTS "jpo_admin_update" ON public.jpo_submissions;
DROP POLICY IF EXISTS "jpo_admin_delete" ON public.jpo_submissions;

-- Admin can view all submissions
CREATE POLICY "jpo_admin_select" ON public.jpo_submissions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
      AND u.raw_user_meta_data->>'role' = 'admin'
  ));

-- Admin can update submissions (approve/reject)
CREATE POLICY "jpo_admin_update" ON public.jpo_submissions
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
      AND u.raw_user_meta_data->>'role' = 'admin'
  ));

-- Admin can delete submissions
CREATE POLICY "jpo_admin_delete" ON public.jpo_submissions
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
      AND u.raw_user_meta_data->>'role' = 'admin'
  ));
