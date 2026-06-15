-- ── referral_codes: maps user → unique invite code ──────────────────────────
CREATE TABLE IF NOT EXISTS public.referral_codes (
  user_id    uuid        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  code       text        UNIQUE NOT NULL,
  first_name text        NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referral_codes_code_idx ON public.referral_codes (code);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rc_select_public"    ON public.referral_codes;
DROP POLICY IF EXISTS "rc_insert_own"       ON public.referral_codes;
DROP POLICY IF EXISTS "rc_update_own"       ON public.referral_codes;

-- Anyone can look up a code (needed for invite landing page)
CREATE POLICY "rc_select_public" ON public.referral_codes
  FOR SELECT USING (true);

-- Only the owner can register their code
CREATE POLICY "rc_insert_own" ON public.referral_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "rc_update_own" ON public.referral_codes
  FOR UPDATE USING (auth.uid() = user_id);

-- ── referrals: tracks who invited whom ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referrals (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_id  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  code         text        NOT NULL,
  status       text        DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  reward_given boolean     DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referrals_code_idx     ON public.referrals (code);
CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON public.referrals (referrer_id);
CREATE INDEX IF NOT EXISTS referrals_referred_idx ON public.referrals (referred_id);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referrals_select_own"       ON public.referrals;
DROP POLICY IF EXISTS "referrals_insert_auth"      ON public.referrals;
DROP POLICY IF EXISTS "referrals_update_referrer"  ON public.referrals;

-- Referrer can see their own referrals; referred can see their own record
CREATE POLICY "referrals_select_own" ON public.referrals
  FOR SELECT USING (
    auth.uid() = referrer_id OR auth.uid() = referred_id
  );

-- Any authenticated user can create a referral record (they add themselves as referred)
CREATE POLICY "referrals_insert_auth" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referred_id);

-- Referrer can update (e.g. mark reward_given)
CREATE POLICY "referrals_update_referrer" ON public.referrals
  FOR UPDATE USING (auth.uid() = referrer_id);
