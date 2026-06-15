-- ── offres_cache: TTL-based cache for external job API results ───────────────
CREATE TABLE IF NOT EXISTS public.offres_cache (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  query_hash  text        NOT NULL UNIQUE,
  source      text        NOT NULL,   -- 'france_travail' | 'bonne_alternance' | 'merged'
  data        jsonb       NOT NULL,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS offres_cache_hash_idx    ON public.offres_cache (query_hash);
CREATE INDEX IF NOT EXISTS offres_cache_expires_idx ON public.offres_cache (expires_at);

ALTER TABLE public.offres_cache ENABLE ROW LEVEL SECURITY;

-- Edge function (service role) can read/write; anyone can read cached results
DROP POLICY IF EXISTS "cache_select_public"   ON public.offres_cache;
DROP POLICY IF EXISTS "cache_insert_service"  ON public.offres_cache;
DROP POLICY IF EXISTS "cache_update_service"  ON public.offres_cache;
DROP POLICY IF EXISTS "cache_delete_service"  ON public.offres_cache;

CREATE POLICY "cache_select_public"  ON public.offres_cache FOR SELECT USING (true);
-- Insert/Update/Delete only via service role (Edge Function) — anon cannot write
CREATE POLICY "cache_insert_service" ON public.offres_cache FOR INSERT WITH CHECK (false);
CREATE POLICY "cache_update_service" ON public.offres_cache FOR UPDATE USING (false);
CREATE POLICY "cache_delete_service" ON public.offres_cache FOR DELETE USING (false);
