-- ─────────────────────────────────────────────
-- École Directory v2: extend ecoles + avis
-- ─────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS unaccent;

-- ── 1. Extend ecoles table ───────────────────
ALTER TABLE public.ecoles
  ADD COLUMN IF NOT EXISTS type_etablissement text,
  ADD COLUMN IF NOT EXISTS statut             text DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS region             text,
  ADD COLUMN IF NOT EXISTS code_postal        text,
  ADD COLUMN IF NOT EXISTS adresse            text,
  ADD COLUMN IF NOT EXISTS telephone          text,
  ADD COLUMN IF NOT EXISTS email              text,
  ADD COLUMN IF NOT EXISTS site_web           text,
  ADD COLUMN IF NOT EXISTS diplomes           text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS slug               text,
  ADD COLUMN IF NOT EXISTS nombre_etudiants   integer,
  ADD COLUMN IF NOT EXISTS updated_at         timestamptz DEFAULT now();

-- Generate slugs from name + city, handle duplicates via ROW_NUMBER
WITH numbered AS (
  SELECT id,
    trim(both '-' from regexp_replace(
      lower(unaccent(name || '-' || city)),
      '[^a-z0-9]+', '-', 'g'
    )) AS base_slug,
    ROW_NUMBER() OVER (
      PARTITION BY trim(both '-' from regexp_replace(
        lower(unaccent(name || '-' || city)),
        '[^a-z0-9]+', '-', 'g'
      ))
      ORDER BY created_at
    ) AS rn
  FROM public.ecoles WHERE slug IS NULL
)
UPDATE public.ecoles e
  SET slug = CASE WHEN n.rn = 1 THEN n.base_slug ELSE n.base_slug || '-' || n.rn END
  FROM numbered n WHERE e.id = n.id;

CREATE UNIQUE INDEX IF NOT EXISTS ecoles_slug_unique ON public.ecoles(slug) WHERE slug IS NOT NULL;

-- RLS
ALTER TABLE public.ecoles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ecoles_select_all" ON public.ecoles;
CREATE POLICY "ecoles_select_all" ON public.ecoles FOR SELECT USING (true);
DROP POLICY IF EXISTS "ecoles_admin_write" ON public.ecoles;
CREATE POLICY "ecoles_admin_write" ON public.ecoles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE OR REPLACE FUNCTION public.set_ecoles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS ecoles_set_updated_at ON public.ecoles;
CREATE TRIGGER ecoles_set_updated_at
  BEFORE UPDATE ON public.ecoles
  FOR EACH ROW EXECUTE FUNCTION public.set_ecoles_updated_at();

-- ── 2. Extend avis_ecoles table ─────────────
ALTER TABLE public.avis_ecoles
  ADD COLUMN IF NOT EXISTS rating_ambiance        integer CHECK (rating_ambiance BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS rating_enseignement    integer CHECK (rating_enseignement BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS rating_vie_etudiante   integer CHECK (rating_vie_etudiante BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS rating_insertion_pro   integer CHECK (rating_insertion_pro BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS rating_infrastructures integer CHECK (rating_infrastructures BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS updated_at             timestamptz DEFAULT now();

-- 1 avis per user per school (anti-spam)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'avis_ecoles_user_school_unique'
  ) THEN
    ALTER TABLE public.avis_ecoles
      ADD CONSTRAINT avis_ecoles_user_school_unique UNIQUE (user_id, ecole_id);
  END IF;
END $$;

ALTER TABLE public.avis_ecoles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "avis_select_all"  ON public.avis_ecoles;
DROP POLICY IF EXISTS "avis_insert_own"  ON public.avis_ecoles;
DROP POLICY IF EXISTS "avis_update_own"  ON public.avis_ecoles;
DROP POLICY IF EXISTS "avis_delete_own"  ON public.avis_ecoles;
CREATE POLICY "avis_select_all"  ON public.avis_ecoles FOR SELECT USING (true);
CREATE POLICY "avis_insert_own"  ON public.avis_ecoles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "avis_update_own"  ON public.avis_ecoles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "avis_delete_own"  ON public.avis_ecoles FOR DELETE USING (auth.uid() = user_id);

-- ── 3. Seed 30 major French institutions ────

INSERT INTO public.ecoles (name, type, city, type_etablissement, statut, region, description, site_web, nombre_etudiants, diplomes, slug) VALUES
-- Universités
('Université Paris 1 Panthéon-Sorbonne',    'Université',     'Paris',           'Université',                   'public',  'Île-de-France',            'Grande université pluridisciplinaire au cœur de Paris. Droit, économie, sciences humaines.', 'https://www.pantheonsorbonne.fr', 40000, ARRAY['Licence', 'Master', 'Doctorat', 'DUT'], 'universite-paris-1-pantheon-sorbonne-paris'),
('Sorbonne Université',                     'Université',     'Paris',           'Université',                   'public',  'Île-de-France',            'Sciences, médecine, lettres et arts. L''une des plus grandes universités françaises.', 'https://www.sorbonne-universite.fr', 55000, ARRAY['Licence', 'Master', 'Doctorat', 'PASS'], 'sorbonne-universite-paris'),
('Université Paris-Dauphine - PSL',         'Université',     'Paris',           'Université',                   'public',  'Île-de-France',            'Spécialisée en économie, gestion et droit. Membre de l''Université PSL.', 'https://www.dauphine.psl.eu', 11000, ARRAY['Licence', 'Master', 'MBA', 'Doctorat'], 'universite-paris-dauphine-psl-paris'),
('Sciences Po Paris',                       'Grande école',   'Paris',           'Institut d''études politiques', 'public',  'Île-de-France',            'Sciences politiques, droit, économie, journalisme. Rayonnement international.', 'https://www.sciencespo.fr', 14000, ARRAY['Licence', 'Master', 'Executive Master', 'Doctorat'], 'sciences-po-paris-paris'),
('Université de Bordeaux',                  'Université',     'Bordeaux',        'Université',                   'public',  'Nouvelle-Aquitaine',       'Université pluridisciplinaire, 2e plus grande en France. Sciences, médecine, droit, sciences humaines.', 'https://www.u-bordeaux.fr', 52000, ARRAY['Licence', 'Master', 'Doctorat', 'DUT', 'PASS'], 'universite-de-bordeaux-bordeaux'),
('Université Aix-Marseille',                'Université',     'Marseille',       'Université',                   'public',  'Provence-Alpes-Côte d''Azur','Plus grande université francophone. Sciences, médecine, droit, lettres.', 'https://www.univ-amu.fr', 80000, ARRAY['Licence', 'Master', 'Doctorat', 'PASS', 'DUT'], 'universite-aix-marseille-marseille'),
('Université de Lyon 1 Claude Bernard',     'Université',     'Lyon',            'Université',                   'public',  'Auvergne-Rhône-Alpes',     'Sciences, technologie, santé. Campus de La Doua à Villeurbanne.', 'https://www.univ-lyon1.fr', 46000, ARRAY['Licence', 'Master', 'Doctorat', 'PASS'], 'universite-de-lyon-1-claude-bernard-lyon'),
('Université de Strasbourg',                'Université',     'Strasbourg',      'Université',                   'public',  'Grand Est',                'Université pluridisciplinaire au cœur de l''Europe. 5 Prix Nobel parmi ses anciens.', 'https://www.unistra.fr', 54000, ARRAY['Licence', 'Master', 'Doctorat', 'DUT'], 'universite-de-strasbourg-strasbourg'),
('Université de Montpellier',               'Université',     'Montpellier',     'Université',                   'public',  'Occitanie',                'L''une des plus anciennes universités d''Europe. Sciences, médecine, droit.', 'https://www.umontpellier.fr', 52000, ARRAY['Licence', 'Master', 'Doctorat', 'PASS'], 'universite-de-montpellier-montpellier'),
('Université de Rennes 1',                  'Université',     'Rennes',          'Université',                   'public',  'Bretagne',                 'Droit, sciences économiques, sciences, médecine. Forte ouverture internationale.', 'https://www.univ-rennes.fr', 32000, ARRAY['Licence', 'Master', 'Doctorat'], 'universite-de-rennes-1-rennes'),

-- Grandes écoles commerce
('HEC Paris',                               'Grande école',   'Jouy-en-Josas',   'École de commerce et de gestion','public', 'Île-de-France',            'N°1 en Europe en management. Programme Grande École, MBA, Executive Education.', 'https://www.hec.edu', 4500, ARRAY['Grande École (M2)', 'MBA', 'Executive MBA', 'Doctorat'], 'hec-paris-jouy-en-josas'),
('ESSEC Business School',                   'Grande école',   'Cergy',           'École de commerce et de gestion','public', 'Île-de-France',            'Top 5 européen en management. Programme Grande École et Masters spécialisés.', 'https://www.essec.edu', 6500, ARRAY['Grande École (M2)', 'MSc', 'MBA', 'Executive MBA'], 'essec-business-school-cergy'),
('ESCP Business School',                    'Grande école',   'Paris',           'École de commerce et de gestion','privé',  'Île-de-France',            'Première business school au monde (1819). 6 campus européens.', 'https://www.escp.eu', 6000, ARRAY['Grande École (M2)', 'MSc', 'MBA', 'Executive MBA'], 'escp-business-school-paris'),
('EDHEC Business School',                   'Grande école',   'Lille',           'École de commerce et de gestion','privé',  'Hauts-de-France',          'Top européen en finance, management et entrepreneuriat. Campus Lille, Nice, Paris.', 'https://www.edhec.edu', 9500, ARRAY['Grande École (M2)', 'MSc', 'MBA', 'Executive MBA'], 'edhec-business-school-lille'),
('EM Lyon Business School',                 'Grande école',   'Lyon',            'École de commerce et de gestion','privé',  'Auvergne-Rhône-Alpes',    'Grande école de management fondée en 1872. Entrepreneuriat, innovation, management.', 'https://www.em-lyon.com', 9000, ARRAY['Grande École (M2)', 'MSc', 'MBA', 'Executive MBA'], 'em-lyon-business-school-lyon'),
('Grenoble École de Management',            'Grande école',   'Grenoble',        'École de commerce et de gestion','privé',  'Auvergne-Rhône-Alpes',    'Spécialisée en management de la technologie et de l''innovation.', 'https://www.grenoble-em.com', 9000, ARRAY['Grande École (M2)', 'MSc', 'MBA'], 'grenoble-ecole-de-management-grenoble'),
('Kedge Business School',                   'Grande école',   'Bordeaux',        'École de commerce et de gestion','privé',  'Nouvelle-Aquitaine',       'Fusion BEM et ESC Marseille. Campus Bordeaux, Marseille, Paris, Shanghai.', 'https://www.kedge.edu', 13000, ARRAY['Grande École (M2)', 'MSc', 'MBA', 'BBA'], 'kedge-business-school-bordeaux'),
('SKEMA Business School',                   'Grande école',   'Sophia Antipolis','École de commerce et de gestion','privé',  'Provence-Alpes-Côte d''Azur','Campus mondiaux : France, USA, Chine, Brésil, Afrique du Sud. Top international.', 'https://www.skema.edu', 10000, ARRAY['Grande École (M2)', 'MSc', 'MBA', 'BBA'], 'skema-business-school-sophia-antipolis'),

-- Grandes écoles ingénieurs
('École Polytechnique',                     'Grande école',   'Palaiseau',       'École d''ingénieurs',           'public',  'Île-de-France',            'La plus prestigieuse école d''ingénieurs française. Sciences, technologie, humanités.', 'https://www.polytechnique.edu', 3000, ARRAY['Cycle ingénieur (M2)', 'Master', 'MBA', 'Doctorat'], 'ecole-polytechnique-palaiseau'),
('CentraleSupélec',                         'Grande école',   'Gif-sur-Yvette',  'École d''ingénieurs',           'public',  'Île-de-France',            'Formation d''ingénieurs de haut niveau. Sciences, numérique, énergie.', 'https://www.centralesupelec.fr', 4500, ARRAY['Cycle ingénieur (M2)', 'Master', 'Doctorat'], 'centralesupelec-gif-sur-yvette'),
('École Normale Supérieure',                'Grande école',   'Paris',           'École normale supérieure',      'public',  'Île-de-France',            'Élite académique française. Sciences, lettres, humanités. Voie de la recherche.', 'https://www.ens.psl.eu', 2500, ARRAY['Licence', 'Master', 'Doctorat', 'Agrégation'], 'ecole-normale-superieure-paris'),
('INSA Lyon',                               'Grande école',   'Lyon',            'École d''ingénieurs',           'public',  'Auvergne-Rhône-Alpes',    'Ingénieur en 5 ans recrutement post-bac. Génie civil, mécanique, informatique.', 'https://www.insa-lyon.fr', 5900, ARRAY['Cycle ingénieur (M2)', 'Master', 'Doctorat'], 'insa-lyon-lyon'),
('Arts et Métiers ParisTech',               'Grande école',   'Paris',           'École d''ingénieurs',           'public',  'Île-de-France',            'Ingénierie mécanique, procédés, énergie. 8 campus en France.', 'https://www.ensam.eu', 6000, ARRAY['Cycle ingénieur (M2)', 'Master', 'Doctorat'], 'arts-et-metiers-paristech-paris'),
('INSEAD',                                  'Grande école',   'Fontainebleau',   'École de commerce et de gestion','privé',  'Île-de-France',            'Top 1 mondial MBA. Campus Fontainebleau, Singapour, Abu Dhabi.', 'https://www.insead.edu', 1500, ARRAY['MBA', 'Executive MBA', 'EMFIN', 'PhD'], 'insead-fontainebleau'),

-- IUT / Lycées post-bac
('IUT de Paris - Rives de Seine',           'IUT',            'Paris',           'Institut universitaire de technologie','public','Île-de-France',          'IUT pluridisciplinaire de l''Université Paris Cité. 10 spécialités.', 'https://iutparis-seine.u-paris.fr', 3500, ARRAY['BUT (Bac+3)', 'Licence pro'], 'iut-de-paris-rives-de-seine-paris'),
('IUT Lyon 1',                              'IUT',            'Lyon',            'Institut universitaire de technologie','public','Auvergne-Rhône-Alpes',  'IUT rattaché à l''Université Claude Bernard Lyon 1. 14 départements.', 'https://iut.univ-lyon1.fr', 4200, ARRAY['BUT (Bac+3)', 'Licence pro'], 'iut-lyon-1-lyon'),
('IUT de Bordeaux',                         'IUT',            'Bordeaux',        'Institut universitaire de technologie','public','Nouvelle-Aquitaine',    '8 départements sur 4 campus en Gironde. Recrutement post-bac.', 'https://www.iut.u-bordeaux.fr', 4800, ARRAY['BUT (Bac+3)', 'Licence pro'], 'iut-de-bordeaux-bordeaux'),

-- Lycées CPGE
('Lycée Louis-le-Grand',                    'Lycée',          'Paris',           'Lycée général et technologique', 'public', 'Île-de-France',            'Lycée d''excellence parisien. Classes préparatoires MP*, MPSI, PSI*, PCSI, ECG, Lettres.', 'https://www.louislegrand.fr', 2500, ARRAY['Baccalauréat', 'CPGE', 'BTS'], 'lycee-louis-le-grand-paris'),
('Lycée Henri-IV',                          'Lycée',          'Paris',           'Lycée général et technologique', 'public', 'Île-de-France',            'L''un des meilleurs lycées français. CPGE scientifiques et littéraires de très haut niveau.', 'https://lycee-henryiv.fr', 2200, ARRAY['Baccalauréat', 'CPGE', 'BTS'], 'lycee-henri-iv-paris'),
('Lycée Janson de Sailly',                  'Lycée',          'Paris',           'Lycée général et technologique', 'public', 'Île-de-France',            'Grand lycée parisien du XVIe. Classes préparatoires ECG, MPSI, HEC, B/L.', NULL, 3000, ARRAY['Baccalauréat', 'CPGE'], 'lycee-janson-de-sailly-paris'),
('Lycée Kléber',                            'Lycée',          'Strasbourg',      'Lycée général et technologique', 'public', 'Grand Est',                'L''un des meilleurs lycées CPGE hors Île-de-France. MP, PC, PSI, ECG, B/L.', 'https://www.lycee-kleber.com.fr', 1800, ARRAY['Baccalauréat', 'CPGE'], 'lycee-kleber-strasbourg')
ON CONFLICT DO NOTHING;

-- Sync site_web → website for backward compat
UPDATE public.ecoles SET website = site_web WHERE site_web IS NOT NULL AND (website IS NULL OR website = '');
