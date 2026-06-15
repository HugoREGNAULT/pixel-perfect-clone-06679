-- ============================================================
-- Springr – Messaging Realtime + search helpers
-- ============================================================

-- ------------------------------------------------------------------ Messages: allow mark-as-read UPDATE
CREATE POLICY "messages_mark_read" ON public.messages
  FOR UPDATE TO authenticated
  USING (
    auth.uid() != sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  )
  WITH CHECK (true);

GRANT UPDATE ON public.messages TO authenticated;

-- ------------------------------------------------------------------ Conversations: allow UPDATE for sort
CREATE POLICY "conversations_participant_update" ON public.conversations
  FOR UPDATE TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

GRANT UPDATE ON public.conversations TO authenticated;

-- ------------------------------------------------------------------ Trigger: bump conversation.updated_at on new message
CREATE OR REPLACE FUNCTION public.bump_conversation_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER messages_bump_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_conversation_updated_at();

-- ------------------------------------------------------------------ Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- ------------------------------------------------------------------ RPC: batch display names for conversation partners
CREATE OR REPLACE FUNCTION public.get_users_display_names(user_ids uuid[])
RETURNS TABLE (id uuid, display_name text, email text)
LANGUAGE sql SECURITY DEFINER SET search_path = auth, public AS $$
  SELECT
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) AS display_name,
    u.email
  FROM auth.users u
  WHERE u.id = ANY(user_ids);
$$;

GRANT EXECUTE ON FUNCTION public.get_users_display_names TO authenticated;

-- ------------------------------------------------------------------ RPC: find user by email (new conversation)
CREATE OR REPLACE FUNCTION public.find_user_by_email(p_email text)
RETURNS TABLE (id uuid, display_name text, email text)
LANGUAGE sql SECURITY DEFINER SET search_path = auth, public AS $$
  SELECT
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) AS display_name,
    u.email
  FROM auth.users u
  WHERE lower(u.email) = lower(p_email)
    AND u.id != auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.find_user_by_email TO authenticated;
