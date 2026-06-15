-- ============================================================
-- Springr — Repair migration: ensure all tables + seed data
-- All CREATE TABLE use IF NOT EXISTS — safe to run multiple times
-- All policies use DROP … IF EXISTS before CREATE — idempotent
-- ============================================================

-- ── Shared updated_at trigger function ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ── 1. offres ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.offres (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  company     text        NOT NULL,
  city        text        NOT NULL,
  remote      boolean     NOT NULL DEFAULT false,
  type        text        NOT NULL CHECK (type IN ('stage','alternance','job')),
  sector      text        NOT NULL DEFAULT '',
  posted_at   date        NOT NULL DEFAULT current_date,
  tags        text[]      NOT NULL DEFAULT '{}',
  apply_url   text,
  description text,
  salary      text,
  start_date  date,
  expires_at  date,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.offres ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.offres ADD COLUMN IF NOT EXISTS salary      text;
ALTER TABLE public.offres ADD COLUMN IF NOT EXISTS start_date  date;
ALTER TABLE public.offres ADD COLUMN IF NOT EXISTS expires_at  date;

ALTER TABLE public.offres ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "offres_public_read"   ON public.offres;
DROP POLICY IF EXISTS "offres_service_write" ON public.offres;
CREATE POLICY "offres_public_read"   ON public.offres FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "offres_service_write" ON public.offres FOR ALL    TO service_role        USING (true) WITH CHECK (true);

GRANT SELECT ON public.offres TO anon, authenticated;
GRANT ALL    ON public.offres TO service_role;

-- ── 2. candidatures ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.candidatures (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offre_id    uuid        NOT NULL REFERENCES public.offres(id) ON DELETE CASCADE,
  status      text        NOT NULL DEFAULT 'envoyée' CHECK (status IN ('envoyée','vue','refusée','acceptée')),
  message     text,
  notes       text,
  cv_url      text,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, offre_id)
);

ALTER TABLE public.candidatures ADD COLUMN IF NOT EXISTS status    text NOT NULL DEFAULT 'envoyée';
ALTER TABLE public.candidatures ADD COLUMN IF NOT EXISTS message   text;
ALTER TABLE public.candidatures ADD COLUMN IF NOT EXISTS notes     text;
ALTER TABLE public.candidatures ADD COLUMN IF NOT EXISTS cv_url    text;
ALTER TABLE public.candidatures ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.candidatures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "candidatures_own_read"   ON public.candidatures;
DROP POLICY IF EXISTS "candidatures_own_insert" ON public.candidatures;
DROP POLICY IF EXISTS "candidatures_own_delete" ON public.candidatures;
DROP POLICY IF EXISTS "candidatures_own_update" ON public.candidatures;
DROP POLICY IF EXISTS "candidatures_service"    ON public.candidatures;
CREATE POLICY "candidatures_own_read"   ON public.candidatures FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "candidatures_own_insert" ON public.candidatures FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "candidatures_own_update" ON public.candidatures FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "candidatures_own_delete" ON public.candidatures FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "candidatures_service"    ON public.candidatures FOR ALL    TO service_role  USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidatures TO authenticated;
GRANT ALL                            ON public.candidatures TO service_role;

DROP TRIGGER IF EXISTS candidatures_updated_at ON public.candidatures;
CREATE TRIGGER candidatures_updated_at
  BEFORE UPDATE ON public.candidatures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 3. mentors ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mentors (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    text        NOT NULL,
  last_name     text        NOT NULL,
  position      text        NOT NULL,
  company       text        NOT NULL,
  sector        text        NOT NULL DEFAULT '',
  city          text        NOT NULL DEFAULT '',
  bio           text,
  skills        text[]      NOT NULL DEFAULT '{}',
  availability  text        NOT NULL DEFAULT 'disponible' CHECK (availability IN ('disponible','sur_demande','occupe')),
  sessions      integer     NOT NULL DEFAULT 0,
  avatar_color  text,
  user_id       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  photo_url     text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.mentors ADD COLUMN IF NOT EXISTS photo_url  text;

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mentors_public_read"   ON public.mentors;
DROP POLICY IF EXISTS "mentors_service_write" ON public.mentors;
CREATE POLICY "mentors_public_read"   ON public.mentors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "mentors_service_write" ON public.mentors FOR ALL    TO service_role        USING (true) WITH CHECK (true);

GRANT SELECT ON public.mentors TO anon, authenticated;
GRANT ALL    ON public.mentors TO service_role;

-- ── 4. conversations ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2 uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (participant_1, participant_2)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "conversations_participant_read"   ON public.conversations;
DROP POLICY IF EXISTS "conversations_participant_insert" ON public.conversations;
CREATE POLICY "conversations_participant_read"   ON public.conversations FOR SELECT TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "conversations_participant_insert" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

GRANT SELECT, INSERT ON public.conversations TO authenticated;
GRANT ALL            ON public.conversations TO service_role;

DROP TRIGGER IF EXISTS conversations_updated_at ON public.conversations;
CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 5. messages ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content         text        NOT NULL,
  read_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "messages_conversation_read" ON public.messages;
DROP POLICY IF EXISTS "messages_own_insert"        ON public.messages;
DROP POLICY IF EXISTS "messages_own_update"        ON public.messages;
CREATE POLICY "messages_conversation_read" ON public.messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );
CREATE POLICY "messages_own_insert" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_own_update" ON public.messages FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id);

GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL                    ON public.messages TO service_role;

-- ── 6. bons_plans ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bons_plans (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  titre            text        NOT NULL,
  description      text        NOT NULL DEFAULT '',
  categorie        text        NOT NULL,
  badge_texte      text        NOT NULL DEFAULT '',
  badge_couleur    text        NOT NULL DEFAULT 'amber'
                     CHECK (badge_couleur IN ('lime','amber','violet','blue')),
  lien_url         text,
  code_promo       text,
  valeur_reduction text,
  actif            boolean     NOT NULL DEFAULT true,
  ordre_affichage  integer     NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bons_plans ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Unique constraint for idempotent seed inserts
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bons_plans_titre_categorie_key'
  ) THEN
    ALTER TABLE public.bons_plans ADD CONSTRAINT bons_plans_titre_categorie_key UNIQUE (titre, categorie);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS bons_plans_categorie_idx ON public.bons_plans (categorie);
CREATE INDEX IF NOT EXISTS bons_plans_actif_idx     ON public.bons_plans (actif);
CREATE INDEX IF NOT EXISTS bons_plans_ordre_idx     ON public.bons_plans (categorie, ordre_affichage);

ALTER TABLE public.bons_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bp_select_active" ON public.bons_plans;
DROP POLICY IF EXISTS "bp_admin_write"   ON public.bons_plans;
CREATE POLICY "bp_select_active" ON public.bons_plans FOR SELECT TO anon, authenticated USING (actif = true);
CREATE POLICY "bp_admin_write"   ON public.bons_plans FOR ALL    TO service_role         USING (true) WITH CHECK (true);

GRANT SELECT ON public.bons_plans TO anon, authenticated;
GRANT ALL    ON public.bons_plans TO service_role;

-- ── 7. jpos ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.jpos (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_ecole        text        NOT NULL,
  date             date        NOT NULL,
  ville            text        NOT NULL,
  region           text        NOT NULL DEFAULT '',
  type_ecole       text        NOT NULL DEFAULT 'autre'
                     CHECK (type_ecole IN ('université','école de commerce','ingé','BTS','lycée','autre')),
  lien_inscription text,
  source_url       text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS jpos_ecole_date_idx ON public.jpos (nom_ecole, date);
CREATE INDEX IF NOT EXISTS jpos_date_idx   ON public.jpos (date);
CREATE INDEX IF NOT EXISTS jpos_region_idx ON public.jpos (region);
CREATE INDEX IF NOT EXISTS jpos_type_idx   ON public.jpos (type_ecole);
CREATE INDEX IF NOT EXISTS jpos_ville_idx  ON public.jpos (ville);

ALTER TABLE public.jpos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "jpos_select_all" ON public.jpos;
CREATE POLICY "jpos_select_all" ON public.jpos FOR SELECT USING (true);

GRANT SELECT ON public.jpos TO anon, authenticated;
GRANT ALL    ON public.jpos TO service_role;

DROP TRIGGER IF EXISTS jpos_updated_at ON public.jpos;
CREATE OR REPLACE FUNCTION public.jpos_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER jpos_updated_at
  BEFORE UPDATE ON public.jpos
  FOR EACH ROW EXECUTE FUNCTION public.jpos_set_updated_at();

-- ── 8. ecoles ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ecoles (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text        NOT NULL,
  type                text        NOT NULL DEFAULT 'autre',
  city                text        NOT NULL DEFAULT '',
  website             text,
  description         text,
  logo_url            text,
  type_etablissement  text,
  statut              text        DEFAULT 'public',
  region              text,
  code_postal         text,
  adresse             text,
  telephone           text,
  email               text,
  site_web            text,
  diplomes            text[]      DEFAULT '{}',
  slug                text,
  nombre_etudiants    integer,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz         DEFAULT now()
);

ALTER TABLE public.ecoles ADD COLUMN IF NOT EXISTS type_etablissement text;
ALTER TABLE public.ecoles ADD COLUMN IF NOT EXISTS statut             text DEFAULT 'public';
ALTER TABLE public.ecoles ADD COLUMN IF NOT EXISTS region             text;
ALTER TABLE public.ecoles ADD COLUMN IF NOT EXISTS code_postal        text;
ALTER TABLE public.ecoles ADD COLUMN IF NOT EXISTS adresse            text;
ALTER TABLE public.ecoles ADD COLUMN IF NOT EXISTS telephone          text;
ALTER TABLE public.ecoles ADD COLUMN IF NOT EXISTS email              text;
ALTER TABLE public.ecoles ADD COLUMN IF NOT EXISTS site_web           text;
ALTER TABLE public.ecoles ADD COLUMN IF NOT EXISTS diplomes           text[] DEFAULT '{}';
ALTER TABLE public.ecoles ADD COLUMN IF NOT EXISTS slug               text;
ALTER TABLE public.ecoles ADD COLUMN IF NOT EXISTS nombre_etudiants   integer;
ALTER TABLE public.ecoles ADD COLUMN IF NOT EXISTS updated_at         timestamptz DEFAULT now();

ALTER TABLE public.ecoles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ecoles_public_read"   ON public.ecoles;
DROP POLICY IF EXISTS "ecoles_service_write" ON public.ecoles;
CREATE POLICY "ecoles_public_read"   ON public.ecoles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "ecoles_service_write" ON public.ecoles FOR ALL    TO service_role        USING (true) WITH CHECK (true);

GRANT SELECT ON public.ecoles TO anon, authenticated;
GRANT ALL    ON public.ecoles TO service_role;

-- ── 9. subscriptions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id                text        NOT NULL,
  billing_period         text,
  status                 text        NOT NULL DEFAULT 'active',
  stripe_customer_id     text,
  stripe_subscription_id text        UNIQUE,
  stripe_session_id      text,
  current_period_end     timestamptz,
  canceled_at            timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan_id                text NOT NULL DEFAULT 'free';
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS billing_period         text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id     text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_session_id      text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS current_period_end     timestamptz;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS canceled_at            timestamptz;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at             timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_subs_user_id    ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_customer   ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subs_stripe_sub ON public.subscriptions(stripe_subscription_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subs_own_read"    ON public.subscriptions;
DROP POLICY IF EXISTS "subs_service_all" ON public.subscriptions;
CREATE POLICY "subs_own_read"    ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "subs_service_all" ON public.subscriptions FOR ALL    TO service_role  USING (true) WITH CHECK (true);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL    ON public.subscriptions TO service_role;

DROP TRIGGER IF EXISTS trg_subs_updated_at ON public.subscriptions;
CREATE OR REPLACE FUNCTION public.update_subscriptions_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_subs_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_subscriptions_updated_at();

-- ── 10. alertes_emploi ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alertes_emploi (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency  text        NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('daily','weekly')),
  sectors    text[]      NOT NULL DEFAULT '{}',
  types      text[]      NOT NULL DEFAULT '{}',
  active     boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.alertes_emploi ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "alertes_own_all" ON public.alertes_emploi;
CREATE POLICY "alertes_own_all" ON public.alertes_emploi FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.alertes_emploi TO authenticated;
GRANT ALL ON public.alertes_emploi TO service_role;

-- ── 11. profile_views ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profile_views (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_id  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "views_owner_read"   ON public.profile_views;
DROP POLICY IF EXISTS "views_anyone_insert" ON public.profile_views;
CREATE POLICY "views_owner_read"   ON public.profile_views FOR SELECT TO authenticated USING (auth.uid() = profile_id);
CREATE POLICY "views_anyone_insert" ON public.profile_views FOR INSERT TO authenticated WITH CHECK (true);

GRANT SELECT, INSERT ON public.profile_views TO authenticated;
GRANT ALL            ON public.profile_views TO service_role;

-- ── 12. avis_ecoles ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.avis_ecoles (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ecole_id   uuid        NOT NULL REFERENCES public.ecoles(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note       integer     NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ecole_id, user_id)
);

ALTER TABLE public.avis_ecoles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "avis_public_read"   ON public.avis_ecoles;
DROP POLICY IF EXISTS "avis_own_write"     ON public.avis_ecoles;
CREATE POLICY "avis_public_read" ON public.avis_ecoles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "avis_own_write"   ON public.avis_ecoles FOR ALL    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

GRANT SELECT ON public.avis_ecoles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.avis_ecoles TO authenticated;
GRANT ALL ON public.avis_ecoles TO service_role;

-- ════════════════════════════════════════════════════════════════
-- SEED DATA
-- ════════════════════════════════════════════════════════════════

-- ── Seed: mentors ────────────────────────────────────────────────────────────
INSERT INTO public.mentors (first_name, last_name, position, company, sector, city, bio, skills, availability, sessions, avatar_color)
VALUES
('Sophie',    'Marchand',  'Product Manager',          'Doctolib',       'Santé / Tech',         'Paris',     'Ex-McKinsey, maintenant PM chez Doctolib. Je partage mes retours d''expérience sur les entretiens, les transitions de carrière et la gestion de produit.', ARRAY['Product Management','Strategy','Leadership','Agile'], 'disponible',  12, 'from-violet/60 to-violet/20'),
('Thomas',    'Leroy',     'Ingénieur Logiciel',       'Criteo',         'Tech / AdTech',        'Paris',     'Développeur backend chez Criteo depuis 5 ans. Je coache des alternants et des jeunes devs qui veulent progresser en Python, Go et architecture distribuée.', ARRAY['Python','Go','Distributed Systems','Backend'], 'disponible',  8,  'from-blue-500/60 to-blue-500/20'),
('Camille',   'Dupont',    'Responsable RH',           'L''Oréal',       'Cosmétiques / RH',     'Clichy',    'RH senior chez L''Oréal. J''aide les étudiants à préparer leurs entretiens, leur CV et à comprendre ce que les grandes entreprises cherchent vraiment.', ARRAY['Recrutement','RH','CV','Entretiens'], 'disponible',  20, 'from-pink-500/60 to-pink-500/20'),
('Antoine',   'Bernard',   'Associate',                'Rothschild & Co','Finance / Banque',     'Paris',     'Banque d''investissement depuis 3 ans. Je peux t''aider à préparer les tests de culture financière, les études de cas et les entretiens en fintech/banque.', ARRAY['Finance','M&A','Modélisation financière','Excel'], 'sur_demande', 5,  'from-amber-400/60 to-amber-400/20'),
('Léa',       'Simon',     'UX Designer',              'Figma',          'Design / Tech',        'Paris',     'Designer chez Figma après un parcours en école de design. Je mentore des étudiants qui souhaitent se lancer dans l''UX/UI et construire leur portfolio.', ARRAY['UX Design','Figma','User Research','Prototypage'], 'disponible',  15, 'from-lime/60 to-lime/20'),
('Nicolas',   'Moreau',    'Data Scientist',           'BNP Paribas',    'Finance / Data',       'Paris',     'Data Science appliqué à la finance. Je partage mon expérience des projets ML en production et aide les étudiants à décrocher leur premier poste data.', ARRAY['Python','Machine Learning','SQL','Finance'], 'disponible',  10, 'from-emerald-500/60 to-emerald-500/20'),
('Emma',      'Fontaine',  'Chargée de Marketing',     'Airbnb',         'Travel / Marketing',   'Paris',     '3 ans chez Airbnb dans le growth marketing. Je coache les étudiants en marketing digital, personal branding et stratégie de contenu.', ARRAY['Growth Marketing','SEO','Analytics','Content'], 'sur_demande', 7,  'from-orange-500/60 to-orange-500/20'),
('Julien',    'Petit',     'Développeur Full-Stack',   'Alan',           'Insurtech / Tech',     'Paris',     'Fullstack chez Alan, une des startups les plus solides de France. Je peux t''aider sur React, Node, l''architecture de startups et les processus de recrutement tech.', ARRAY['React','Node.js','TypeScript','Architecture'], 'disponible',  18, 'from-cyan-400/60 to-cyan-400/20'),
('Claire',    'Roux',      'Avocate en Droit des Affaires', 'Freshfields','Juridique / Finance', 'Paris',     'Avocate en droit des affaires après Sciences Po et le barreau de Paris. Je guide les étudiants en droit/gestion qui visent les cabinets internationaux.', ARRAY['Droit des affaires','M&A','Négociation','Anglais juridique'], 'sur_demande', 3, 'from-rose-400/60 to-rose-400/20'),
('Marc',      'Lefebvre',  'Directeur Commercial',     'Salesforce',     'SaaS / Sales',         'Bordeaux',  'Sales Director chez Salesforce depuis 4 ans. J''aide les étudiants qui visent le commerce, le business development ou les métiers de la vente BtoB.', ARRAY['Sales','Négociation','CRM','Business Development'], 'disponible',  22, 'from-indigo-400/60 to-indigo-400/20')
ON CONFLICT DO NOTHING;

-- ── Seed: offres ─────────────────────────────────────────────────────────────
INSERT INTO public.offres (title, company, city, remote, type, sector, posted_at, tags, apply_url, description)
VALUES
('Stage Product Management – FinTech',      'Lydia',          'Paris',     false, 'stage',      'Finance / Tech',   current_date - 2, ARRAY['product','fintech','mobile'],                    'https://jobs.lydia-app.com',       'Stage de 6 mois en Product Management au sein de l''équipe Growth. Tu travailleras sur l''optimisation des funnels d''acquisition.'),
('Alternance Développeur Full-Stack React',  'Doctolib',       'Paris',     true,  'alternance', 'Santé / Tech',     current_date - 1, ARRAY['react','typescript','healthcare'],                'https://careers.doctolib.fr',      'Rejoins notre équipe Engineering en alternance (1 an). Stack : React, TypeScript, Ruby on Rails, PostgreSQL.'),
('Stage Marketing Digital & Growth',         'Back Market',    'Paris',     true,  'stage',      'E-commerce',       current_date - 3, ARRAY['growth','seo','analytics','marketing'],           'https://jobs.backmarket.com',      'Stage de 6 mois dans l''équipe Growth Marketing. Focus sur SEO, paid ads et email marketing. Analytics avancée requise.'),
('Alternance Analyste BI / Data',            'ENGIE',          'Paris',     false, 'alternance', 'Énergie / Data',   current_date,     ARRAY['sql','power-bi','data','energie'],                'https://recrutement.engie.com',    'Alternance 2 ans dans notre équipe BI. Maîtrise de SQL et Power BI requise. Secteur énergie renouvelable.'),
('Premier emploi – Consultant Junior',       'Capgemini',      'Lyon',      false, 'job',        'Conseil / Tech',   current_date - 5, ARRAY['conseil','it','transformation','management'],     'https://jobs.capgemini.com',       'Poste CDI ouvert aux jeunes diplômés (bac+5). Missions de transformation digitale chez nos clients grands comptes.'),
('Stage Droit des Affaires M&A',             'Hogan Lovells',  'Paris',     false, 'stage',      'Juridique',        current_date - 4, ARRAY['m&a','droit','juridique','anglais'],             'https://www.hoganlovells.com',     'Stage de 6 mois au sein de notre practice M&A. Niveau Master 2 Droit des Affaires requis. Anglais courant impératif.'),
('Alternance UX/UI Designer',                'Ubisoft',        'Paris',     true,  'alternance', 'Gaming / Design',  current_date - 2, ARRAY['figma','ux','ui','gaming','design'],              'https://jobs.ubisoft.com',         'Alternance 1 an dans notre équipe UX. Tu travailleras sur nos jeux mobile et PC. Portfolio requis.'),
('Stage Communication & Relations Presse',   'Publicis Groupe','Paris',     false, 'stage',      'Communication',    current_date - 1, ARRAY['communication','rp','presse','media'],            'https://jobs.publicisgroupe.com',  'Stage 4 à 6 mois dans notre département Communication. Rédaction, relations presse et production de contenus.'),
('Alternance Ingénieur DevOps',              'OVHcloud',       'Roubaix',   false, 'alternance', 'Cloud / Tech',     current_date - 6, ARRAY['devops','kubernetes','docker','cloud'],           'https://jobs.ovhcloud.com',        'Alternance 2 ans chez le leader européen du cloud. Stack : Kubernetes, Terraform, Ansible, CI/CD.'),
('Premier emploi – Data Analyst Junior',     'Dataiku',        'Paris',     true,  'job',        'Data / AI',        current_date - 3, ARRAY['python','sql','analytics','machine-learning'],    'https://jobs.dataiku.com',         'CDI ouvert aux jeunes diplômés. Tu rejoindras notre Customer Success Engineering team pour accompagner nos clients enterprise.')
ON CONFLICT DO NOTHING;

-- ── Seed: bons_plans ─────────────────────────────────────────────────────────
INSERT INTO public.bons_plans
  (titre, description, categorie, badge_texte, badge_couleur, lien_url, code_promo, valeur_reduction, ordre_affichage)
VALUES

-- TECH & LOGICIELS
('Apple Education — MacBook Air M3',
 'MacBook Air M3 à 1 099€ au lieu de 1 299€ (-200€) + AirPods Pro offerts. Valable avec une adresse email académique ou via l''Apple Store Éducation.',
 'tech', 'AirPods OFFERTS', 'amber', 'https://www.apple.com/fr-ens/store', NULL, '-200€ + AirPods', 1),

('Spotify Étudiant',
 '7,07€/mois au lieu de 11,99€ + 1 mois gratuit pour commencer. Accès à tout le catalogue Spotify Premium. Renouvellement annuel avec preuve d''inscription.',
 'tech', '-41%', 'amber', 'https://www.spotify.com/fr/student', NULL, '-41%', 2),

('Notion — Plan Pro Gratuit',
 'Toutes les fonctionnalités du plan Pro (IA incluse, blocs illimités) gratuitement pour les étudiants et enseignants.',
 'tech', 'GRATUIT', 'lime', 'https://www.notion.so/fr-fr/students', NULL, '100%', 3),

('Adobe Creative Cloud Étudiant',
 '-65% sur l''abonnement Creative Cloud complet : Photoshop, Illustrator, Premiere Pro, After Effects...',
 'tech', '-65%', 'amber', 'https://www.adobe.com/fr/creativecloud/buy/students.html', NULL, '-65%', 4),

('Microsoft 365 — Gratuit via ton école',
 'Word, Excel, PowerPoint, Teams, OneDrive 1 To... complètement gratuit pour les étudiants via leur adresse email académique.',
 'tech', 'GRATUIT', 'lime', 'https://www.microsoft.com/fr-fr/education', NULL, '100%', 5),

('Figma Pro — Gratuit Éducation',
 'Plan Pro gratuit pour les étudiants et professeurs. Vérification via email académique.',
 'tech', 'GRATUIT', 'lime', 'https://www.figma.com/education/', NULL, '100%', 6),

('GitHub Pro — Student Developer Pack',
 'GitHub Pro + 100€ de crédits cloud, noms de domaine, outils CI/CD... Le pack complet pour developers gratuit.',
 'tech', 'GRATUIT', 'lime', 'https://education.github.com', NULL, '100%', 7),

('Canva Pro — Gratuit Étudiant',
 'Accès à Canva Pro complet : millions de templates, suppression d''arrière-plan, exports illimités. 100% gratuit.',
 'tech', 'GRATUIT', 'lime', 'https://www.canva.com/education/', NULL, '100%', 8),

('JetBrains — Tous les IDE Gratuits',
 'IntelliJ IDEA, PyCharm, WebStorm, DataGrip... Tous les IDE JetBrains Professional gratuits pour les étudiants.',
 'tech', 'GRATUIT', 'lime', 'https://www.jetbrains.com/community/education/', NULL, '100%', 9),

('Apple Music Étudiant',
 '5,99€/mois au lieu de 11,99€. -50% sur l''abonnement individuel. 1 mois offert à l''inscription.',
 'tech', '-50%', 'amber', 'https://music.apple.com', NULL, '-50%', 10),

-- STREAMING
('Disney+ Étudiant — via MyUnidays',
 '-50% sur l''abonnement Disney+ via MyUnidays. Accès à Disney, Marvel, Star Wars, National Geographic.',
 'streaming', '-50%', 'amber', 'https://www.myunidays.com', NULL, '-50%', 1),

('YouTube Premium — 3 mois offerts',
 '3 mois d''essai gratuit puis tarif réduit étudiant. Sans pub, téléchargement hors ligne, YouTube Music inclus.',
 'streaming', '3 mois offerts', 'amber', 'https://www.youtube.com/premium', NULL, '3 mois gratuits', 2),

('Deezer Étudiant',
 '3 mois gratuits puis 5,99€/mois (au lieu de 10,99€). Qualité audio FLAC, écoute hors ligne.',
 'streaming', '3 mois GRATUITS', 'amber', 'https://www.deezer.com', NULL, '3 mois + -45%', 3),

('Duolingo Super Étudiant',
 '-50% sur Duolingo Super via UNiDAYS. Apprentissage sans publicité, mode hors ligne.',
 'streaming', '-50%', 'amber', 'https://www.duolingo.com', NULL, '-50%', 4),

-- LOGEMENT
('Lokaviz — CROUS',
 'Plateforme officielle du CROUS pour les annonces de logement étudiant vérifiées. Gratuit, sécurisé, partout en France.',
 'logement', 'Officiel CROUS', 'lime', 'https://www.lokaviz.fr', NULL, NULL, 1),

('Studapart — -10% code STUDENT10',
 'Location meublée, résidences étudiantes et colocations dans toute la France. -10% sur ta première réservation.',
 'logement', '-10%', 'violet', 'https://www.studapart.com', 'STUDENT10', '-10%', 2),

('Garantie Visale — Action Logement',
 'Caution locative gratuite garantie par l''État pour les moins de 30 ans. Remplace le garant physique.',
 'logement', 'GRATUIT', 'lime', 'https://www.visale.fr', NULL, NULL, 3),

('Roomlala — Colocation Étudiante',
 'Plateforme de colocation dédiée aux étudiants. Annonces vérifiées, bail mobilité compatible.',
 'logement', 'Coloc', 'amber', 'https://www.roomlala.com', NULL, NULL, 4),

-- MODE
('ASOS Étudiant — via UNiDAYS',
 '-10% sur toute la commande ASOS via UNiDAYS. Livraison gratuite au-delà d''un certain montant.',
 'mode', '-10%', 'amber', 'https://www.asos.com', NULL, '-10%', 1),

('Nike Étudiant — via UNiDAYS',
 '-10% sur nike.com via UNiDAYS. Sneakers, vêtements de sport et accessoires.',
 'mode', '-10%', 'amber', 'https://www.myunidays.com', NULL, '-10%', 2),

('Adidas Étudiant — via UNiDAYS',
 '-15% sur adidas.fr via UNiDAYS. Applicable sur les dernières sorties et les gammes Originals.',
 'mode', '-15%', 'amber', 'https://www.myunidays.com', NULL, '-15%', 3),

('IKEA — Carte IKEA Family Étudiant',
 '-10% supplémentaire sur les articles déjà en promotion avec la carte IKEA Family.',
 'mode', '-10%', 'amber', 'https://www.ikea.com/fr/fr/', NULL, '-10%', 4),

-- TRANSPORT
('Carte Avantage Jeune SNCF',
 '49€/an pour -30% garantis sur tous les TGV INOUI et INTERCITÉS en France. Pour les 12-27 ans.',
 'transport', '-30% train', 'amber', 'https://www.sncf-connect.com', NULL, '-30%', 1),

('MAX Jeune SNCF — Voyages Illimités',
 'Voyages TGV illimités en France pour les 16-27 ans. Abonnement mensuel ou annuel.',
 'transport', 'Illimité', 'amber', 'https://www.sncf-connect.com', NULL, 'Illimité', 2),

('BlaBlaCar Étudiant',
 '0% de commission sur tes trajets en covoiturage. Idéal pour les retours chez les parents.',
 'transport', '0% commission', 'lime', 'https://www.blablacar.fr', NULL, NULL, 3),

('Lime Étudiant — Vélo & Trottinette',
 '-50% sur l''abonnement mensuel Lime (vélos et trottinettes en libre-service) via UNiDAYS.',
 'transport', '-50%', 'amber', 'https://www.li.me', NULL, '-50%', 4),

('Uber Étudiant',
 '-15% sur ton premier mois de courses avec le code ETUDIANT. Disponible dans toutes les grandes villes.',
 'transport', '-15%', 'violet', 'https://www.uber.com', 'ETUDIANT', '-15%', 5),

-- VÉLO
('Prime Vélo Électrique Régionale',
 'De 100€ à 800€ d''aide selon ta ville ou ta région pour l''achat d''un vélo électrique. Cumulable avec aides nationales.',
 'velo', 'Jusqu''à 800€', 'amber', 'https://www.jeunes.gouv.fr', NULL, 'Jusqu''à 800€', 1),

('Forfait Mobilités Durables',
 'Jusqu''à 800€/an remboursés par ton employeur si tu vas en cours à vélo, trottinette ou covoiturage.',
 'velo', 'Jusqu''à 800€/an', 'blue', 'https://www.service-public.fr', NULL, 'Jusqu''à 800€/an', 2),

-- VOYAGE
('InterRail Pass Jeune — Europe',
 '-25% pour les moins de 28 ans sur le pass InterRail. Voyage en train dans 33 pays européens.',
 'voyage', '-25% Europe', 'amber', 'https://www.interrail.eu/fr', NULL, '-25%', 1),

('DiscoverEU — Pass InterRail Gratuit',
 'Programme de la Commission Européenne : tirage au sort pour gagner un pass InterRail GRATUIT à tes 18 ans.',
 'voyage', 'Pass GRATUIT', 'lime', 'https://agence.erasmusplus.fr', NULL, '100%', 2),

('Erasmus+ — Bourse Mobilité',
 'De 200€ à 700€/mois pour étudier ou faire un stage à l''étranger. Ouverte à tous les étudiants inscrits en France.',
 'voyage', 'Jusqu''à 700€/mois', 'blue', 'https://info.erasmusplus.fr', NULL, 'Jusqu''à 700€/mois', 3),

-- VACANCES
('Départ 18:25 — ANCV',
 'Jusqu''à 200€ d''aide pour partir en vacances en France ou en Europe. Réservé aux étudiants boursiers.',
 'vacances', '200€ d''aide', 'blue', 'https://www.ancv.com', NULL, 'Jusqu''à 200€', 1),

('1 000 Cafés — Séjours ruraux',
 'Séjours à la campagne à prix réduit dans des villages revitalisés. Découvrir la France autrement.',
 'vacances', 'Prix réduit', 'amber', 'https://1000cafes.org', NULL, NULL, 2),

-- BANQUE
('Revolut Étudiant',
 'Compte courant gratuit + carte bancaire. Virements instantanés, échange de devises sans frais.',
 'banque', 'Carte offerte', 'amber', 'https://www.revolut.com/fr-FR/', NULL, NULL, 1),

('Lydia — 5% Cashback',
 '5% de cashback sur tous tes achats pendant 3 mois à l''ouverture. Cagnotte partagée entre amis.',
 'banque', '5% cashback', 'amber', 'https://www.lydia-app.com', NULL, '5% pendant 3 mois', 2),

('Boursorama Étudiant',
 '80€ offerts à l''ouverture de ton premier compte Boursorama. Carte Visa gratuite, sans frais de tenue.',
 'banque', '80€ offerts', 'amber', 'https://www.boursorama.com', NULL, '80€', 3),

-- FOOD
('Deliveroo Plus Étudiant',
 '3 mois de livraison gratuite sans minimum de commande. Puis tarif réduit étudiant via UNiDAYS.',
 'food', '3 mois gratuits', 'amber', 'https://deliveroo.fr', NULL, '3 mois gratuits', 1),

('Uber Eats — Code Étudiant',
 '2€ offerts sur 3 commandes. Valable sur la première semaine avec le code promo.',
 'food', '2€ offerts', 'violet', 'https://www.ubereats.com', 'ETUDIANT2', '2€ x3', 2),

('Too Good To Go — Anti-Gaspi',
 'Repas complets de restaurants et boulangeries à partir de 3€. Invendus du soir à prix cassé.',
 'food', 'Repas à 3€', 'lime', 'https://www.toogoodtogo.com', NULL, 'Dès 3€', 3),

-- SANTÉ
('Alan — Mutuelle Étudiante',
 'Mutuelle santé 100% en ligne à partir de 9€/mois. Remboursements en 24h, médecin en ligne inclus.',
 'sante', 'Dès 9€/mois', 'amber', 'https://alan.com', NULL, 'Dès 9€/mois', 1),

('Livi — Téléconsultation',
 'Première téléconsultation médicale gratuite. Médecins généralistes disponibles 7j/7.',
 'sante', '1ère fois gratuite', 'lime', 'https://www.livi.fr', NULL, 'Gratuite', 2),

('Complémentaire Santé Solidaire',
 'Mutuelle quasi-gratuite ou entièrement gratuite sous conditions de ressources. Prend en charge ce que la Sécu ne rembourse pas.',
 'sante', 'Santé gratuite', 'lime', 'https://www.complementaire-sante-solidaire.gouv.fr', NULL, NULL, 3),

-- AIDES DE L'ÉTAT
('Bourse sur Critères Sociaux CROUS',
 'De 0 à 6 335€/an selon ton échelon (0 à 7). Dossier Social Étudiant à remplir avant le 31 mai.',
 'aides', 'Jusqu''à 6 335€/an', 'blue', 'https://www.messervices.etudiant.gouv.fr', NULL, 'Jusqu''à 6 335€/an', 1),

('APL — Aide Personnalisée au Logement',
 'Entre 100€ et 300€/mois déduits directement de ton loyer. Versée par la CAF selon tes revenus.',
 'aides', 'Jusqu''à 300€/mois', 'blue', 'https://www.caf.fr', NULL, 'Jusqu''à 300€/mois', 2),

('Pass Culture — 300€ Crédits',
 '300€ crédits culture offerts à tes 18 ans : concerts, cinéma, livres, musées, jeux vidéo...',
 'aides', '300€ offerts', 'blue', 'https://pass.culture.fr', NULL, '300€', 3),

('Prime d''Activité',
 'Complément de revenu si tu travailles et gagnes plus de 1 117€ nets/mois. Versé par la CAF.',
 'aides', 'Simuler mon droit', 'blue', 'https://www.caf.fr', NULL, NULL, 4),

('Aide au Mérite CROUS',
 '+900€/an pour les boursiers ayant obtenu la mention Très Bien au bac. Attribution automatique.',
 'aides', '+900€/an', 'blue', 'https://www.etudiant.gouv.fr', NULL, '+900€/an', 5),

('Aide à la Mobilité Parcoursup',
 '500€ versés si tu t''inscris dans une formation hors de ton académie de résidence via Parcoursup.',
 'aides', '500€', 'blue', 'https://www.etudiant.gouv.fr', NULL, '500€', 6),

('Mobili-Jeune — Action Logement',
 'De 10€ à 100€/mois d''aide au loyer pour les alternants de moins de 30 ans.',
 'aides', 'Jusqu''à 100€/mois', 'blue', 'https://mobilijeune.actionlogement.fr', NULL, 'Jusqu''à 100€/mois', 7),

('1 Repas à 1€ au CROUS',
 'Un repas complet au restaurant universitaire pour 1€ pour les boursiers et étudiants en difficulté.',
 'aides', '1€ le repas', 'blue', 'https://www.etudiant.gouv.fr', NULL, NULL, 8),

('Prêt Étudiant Garanti par l''État',
 'Jusqu''à 20 000€ de prêt sans caution, sans conditions de ressources. Remboursement après diplôme.',
 'aides', 'Sans caution', 'blue', 'https://www.etudiant.gouv.fr', NULL, 'Jusqu''à 20 000€', 9)

ON CONFLICT (titre, categorie) DO NOTHING;

-- ── Seed: jpos ───────────────────────────────────────────────────────────────
INSERT INTO public.jpos (nom_ecole, date, ville, region, type_ecole, lien_inscription, source_url) VALUES
-- Île-de-France
('HEC Paris',                          '2026-10-11', 'Jouy-en-Josas',    'Île-de-France',         'école de commerce', 'https://www.hec.edu/fr/programs/jpo',                       'seed'),
('ESSEC Business School',              '2026-10-18', 'Cergy',             'Île-de-France',         'école de commerce', 'https://www.essec.edu/fr/programmes/jpo',                    'seed'),
('Sciences Po Paris',                  '2026-11-08', 'Paris',             'Île-de-France',         'université',        'https://www.sciencespo.fr/admissions/fr/jpo',                'seed'),
('CentraleSupélec',                    '2026-11-15', 'Gif-sur-Yvette',   'Île-de-France',         'ingé',              'https://www.centralesupelec.fr/fr/jpo',                      'seed'),
('École Polytechnique',                '2026-11-22', 'Palaiseau',         'Île-de-France',         'ingé',              'https://www.polytechnique.edu/fr/jpo',                       'seed'),
('ESCP Business School',               '2026-12-06', 'Paris',             'Île-de-France',         'école de commerce', 'https://escp.eu/fr/programmes/jpo',                          'seed'),
('ENSAE Paris',                        '2026-12-13', 'Palaiseau',         'Île-de-France',         'ingé',              'https://www.ensae.fr/formation/jpo',                         'seed'),
('Université Paris-Saclay',            '2027-01-17', 'Orsay',             'Île-de-France',         'université',        'https://www.universite-paris-saclay.fr/actualites/jpo',      'seed'),
('EDHEC Business School Paris',        '2027-01-24', 'Paris',             'Île-de-France',         'école de commerce', 'https://www.edhec.edu/fr/jpo',                               'seed'),
('École Nationale des Ponts',          '2027-02-07', 'Champs-sur-Marne', 'Île-de-France',         'ingé',              'https://ecoledesponts.fr/jpo',                               'seed'),
('INSEAD Fontainebleau',               '2027-02-14', 'Fontainebleau',    'Île-de-France',         'école de commerce', 'https://www.insead.edu/fr/jpo',                              'seed'),
('Lycée Louis-le-Grand — CPGE',        '2026-10-04', 'Paris',             'Île-de-France',         'lycée',             NULL,                                                         'seed'),
('Lycée Henri IV — BTS et CPGE',       '2026-10-18', 'Paris',             'Île-de-France',         'lycée',             NULL,                                                         'seed'),
-- Auvergne-Rhône-Alpes
('emlyon business school',             '2026-10-24', 'Lyon',              'Auvergne-Rhône-Alpes',  'école de commerce', 'https://www.em-lyon.com/fr/programmes/jpo',                  'seed'),
('INSA Lyon',                          '2026-11-07', 'Villeurbanne',      'Auvergne-Rhône-Alpes',  'ingé',              'https://www.insa-lyon.fr/fr/journee-portes-ouvertes',        'seed'),
('Université Claude Bernard Lyon 1',   '2026-11-29', 'Lyon',              'Auvergne-Rhône-Alpes',  'université',        'https://www.univ-lyon1.fr/universite/jpo',                   'seed'),
('CPE Lyon',                           '2027-01-10', 'Villeurbanne',      'Auvergne-Rhône-Alpes',  'ingé',              'https://www.cpe.fr/fr/jpo',                                  'seed'),
('Grenoble Ecole de Management',       '2026-11-21', 'Grenoble',          'Auvergne-Rhône-Alpes',  'école de commerce', 'https://www.grenoble-em.com/fr/jpo',                         'seed'),
('INSA Roanne',                        '2027-01-30', 'Roanne',            'Auvergne-Rhône-Alpes',  'ingé',              'https://www.insa-roanne.fr/jpo',                             'seed'),
('Université Grenoble Alpes',          '2027-02-06', 'Grenoble',          'Auvergne-Rhône-Alpes',  'université',        'https://www.univ-grenoble-alpes.fr/jpo',                     'seed'),
-- Nouvelle-Aquitaine
('Kedge Business School Bordeaux',     '2026-10-17', 'Bordeaux',          'Nouvelle-Aquitaine',    'école de commerce', 'https://kedge.edu/fr/jpo',                                   'seed'),
('Université de Bordeaux',             '2027-01-31', 'Bordeaux',          'Nouvelle-Aquitaine',    'université',        'https://www.u-bordeaux.fr/universite/jpo',                   'seed'),
('ENSEIRB-MATMECA',                    '2026-12-05', 'Bordeaux',          'Nouvelle-Aquitaine',    'ingé',              'https://enseirb-matmeca.bordeaux-inp.fr/fr/jpo',              'seed'),
('IAE Bordeaux',                       '2027-02-06', 'Bordeaux',          'Nouvelle-Aquitaine',    'université',        'https://iae.u-bordeaux.fr/jpo',                              'seed'),
-- Occitanie
('TBS Education',                      '2026-11-14', 'Toulouse',          'Occitanie',             'école de commerce', 'https://www.tbs-education.fr/fr/jpo',                        'seed'),
('ISAE-SUPAERO',                       '2026-11-28', 'Toulouse',          'Occitanie',             'ingé',              'https://www.isae-supaero.fr/fr/jpo',                         'seed'),
('Université de Montpellier',          '2027-02-06', 'Montpellier',       'Occitanie',             'université',        'https://www.umontpellier.fr/jpo',                            'seed'),
('IMT Mines Alès',                     '2027-01-10', 'Alès',              'Occitanie',             'ingé',              'https://www.mines-ales.fr/jpo',                              'seed'),
('Montpellier Business School',        '2026-11-07', 'Montpellier',       'Occitanie',             'école de commerce', 'https://www.montpellier-bs.com/fr/jpo',                      'seed'),
-- Hauts-de-France
('EDHEC Business School Lille',        '2026-10-10', 'Roubaix',           'Hauts-de-France',       'école de commerce', 'https://www.edhec.edu/fr/jpo',                               'seed'),
('IMT Nord Europe',                    '2026-11-06', 'Douai',             'Hauts-de-France',       'ingé',              'https://www.imt-nord-europe.fr/fr/jpo',                      'seed'),
('Université de Lille',                '2027-01-23', 'Lille',             'Hauts-de-France',       'université',        'https://www.univ-lille.fr/jpo',                              'seed'),
('IESEG School of Management',         '2026-10-25', 'Lille',             'Hauts-de-France',       'école de commerce', 'https://www.ieseg.fr/fr/jpo',                                'seed'),
-- Provence-Alpes-Côte d'Azur
('Kedge Business School Marseille',    '2026-10-25', 'Marseille',         'Provence-Alpes-Côte d''Azur','école de commerce','https://kedge.edu/fr/jpo',                              'seed'),
('École Centrale Méditerranée',        '2026-11-21', 'Marseille',         'Provence-Alpes-Côte d''Azur','ingé',           'https://www.centrale-mediterranee.fr/fr/jpo',               'seed'),
('Université Aix-Marseille',           '2027-02-01', 'Aix-en-Provence',   'Provence-Alpes-Côte d''Azur','université',     'https://www.univ-amu.fr/jpo',                               'seed'),
-- Grand Est
('EM Strasbourg Business School',      '2026-11-07', 'Strasbourg',        'Grand Est',             'école de commerce', 'https://www.em-strasbourg.eu/fr/jpo',                        'seed'),
('INSA Strasbourg',                    '2027-01-16', 'Strasbourg',        'Grand Est',             'ingé',              'https://www.insa-strasbourg.fr/fr/jpo',                      'seed'),
('Université de Strasbourg',           '2027-01-30', 'Strasbourg',        'Grand Est',             'université',        'https://www.unistra.fr/universite/jpo',                      'seed'),
-- Pays de la Loire
('Audencia Business School',           '2026-11-28', 'Nantes',            'Pays de la Loire',      'école de commerce', 'https://www.audencia.com/fr/jpo',                            'seed'),
('École Centrale de Nantes',           '2027-02-01', 'Nantes',            'Pays de la Loire',      'ingé',              'https://www.ec-nantes.fr/formation/jpo',                     'seed'),
('Université de Nantes',               '2027-01-24', 'Nantes',            'Pays de la Loire',      'université',        'https://www.univ-nantes.fr/jpo',                             'seed'),
('ESSCA School of Management',         '2026-12-05', 'Angers',            'Pays de la Loire',      'école de commerce', 'https://www.essca.fr/fr/jpo',                                'seed'),
-- Bretagne
('Sciences Po Rennes',                 '2026-10-31', 'Rennes',            'Bretagne',              'université',        'https://www.sciencespo-rennes.fr/jpo',                       'seed'),
('IMT Atlantique',                     '2027-01-09', 'Brest',             'Bretagne',              'ingé',              'https://www.imt-atlantique.fr/fr/jpo',                       'seed'),
('Université Rennes 1',                '2027-02-01', 'Rennes',            'Bretagne',              'université',        'https://www.univ-rennes.fr/jpo',                             'seed'),
-- Normandie
('EM Normandie',                       '2026-10-17', 'Le Havre',          'Normandie',             'école de commerce', 'https://www.em-normandie.com/fr/jpo',                        'seed'),
('ENSICAEN',                           '2026-11-14', 'Caen',              'Normandie',             'ingé',              'https://www.ensicaen.fr/jpo',                                'seed'),
('Université de Caen Normandie',       '2027-01-16', 'Caen',              'Normandie',             'université',        'https://www.unicaen.fr/jpo',                                 'seed'),
-- BTS / lycées
('IUT Paris Rives de Seine — BTS',     '2026-10-03', 'Paris',             'Île-de-France',         'BTS',               NULL,                                                         'seed'),
('Lycée Jean Zay — BTS Commerce',      '2026-10-10', 'Paris',             'Île-de-France',         'BTS',               NULL,                                                         'seed'),
('IUT Lyon 1 — DUT/BUT Info',          '2026-11-07', 'Lyon',              'Auvergne-Rhône-Alpes',  'BTS',               NULL,                                                         'seed'),
('Lycée Hôtelier de Lyon',             '2026-10-17', 'Lyon',              'Auvergne-Rhône-Alpes',  'lycée',             NULL,                                                         'seed'),
('Lycée La Martinière Monplaisir',     '2026-11-14', 'Lyon',              'Auvergne-Rhône-Alpes',  'lycée',             NULL,                                                         'seed'),
('IUT de Bordeaux — BUT GEII',         '2026-11-21', 'Bordeaux',          'Nouvelle-Aquitaine',    'BTS',               NULL,                                                         'seed')
ON CONFLICT (nom_ecole, date) DO NOTHING;
