-- Table des abonnements Stripe (plans premium étudiants & entreprises)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id                text        NOT NULL,           -- 'student_premium', 'student_premium_plus', 'company_starter', 'company_pro'
  billing_period         text,                           -- 'monthly', 'yearly', 'once'
  status                 text        NOT NULL DEFAULT 'active', -- 'active', 'trialing', 'past_due', 'canceled', 'incomplete'
  stripe_customer_id     text,
  stripe_subscription_id text        UNIQUE,
  stripe_session_id      text,
  current_period_end     timestamptz,
  canceled_at            timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent lire leurs propres abonnements
DROP POLICY IF EXISTS "subs_own_read" ON public.subscriptions;
CREATE POLICY "subs_own_read" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Le service role (webhook) peut tout faire
DROP POLICY IF EXISTS "subs_service_all" ON public.subscriptions;
CREATE POLICY "subs_service_all" ON public.subscriptions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_subs_user_id    ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_customer   ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subs_stripe_sub ON public.subscriptions(stripe_subscription_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_subscriptions_updated_at()
  RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_subs_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subs_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_subscriptions_updated_at();
