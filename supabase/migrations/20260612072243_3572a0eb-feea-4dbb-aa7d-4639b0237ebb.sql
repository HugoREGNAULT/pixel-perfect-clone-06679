
-- Drop old waitlist table (replaced by newsletter_signups + founders)
DROP TABLE IF EXISTS public.waitlist;

-- Newsletter signups
CREATE TABLE public.newsletter_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_signups TO anon, authenticated;
GRANT ALL ON public.newsletter_signups TO service_role;
ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_signups
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Founders (one-time payments)
CREATE TABLE public.founders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  amount integer NOT NULL DEFAULT 499,
  currency text NOT NULL DEFAULT 'eur',
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
CREATE INDEX idx_founders_email ON public.founders(email);
CREATE INDEX idx_founders_status ON public.founders(payment_status);
GRANT ALL ON public.founders TO service_role;
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
-- Only service role (webhook/server fns) writes. Admins read via server fn using service role.

-- Roles for admin gating
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
