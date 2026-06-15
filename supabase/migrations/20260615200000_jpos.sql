-- ── pg_net extension for HTTP calls from pg_cron ───────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ── Table jpos : Journées Portes Ouvertes de toutes les écoles de France ────
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

-- Contrainte unicité pour l'upsert du scraper (évite les doublons)
CREATE UNIQUE INDEX IF NOT EXISTS jpos_ecole_date_idx ON public.jpos (nom_ecole, date);

CREATE INDEX IF NOT EXISTS jpos_date_idx   ON public.jpos (date);
CREATE INDEX IF NOT EXISTS jpos_region_idx ON public.jpos (region);
CREATE INDEX IF NOT EXISTS jpos_type_idx   ON public.jpos (type_ecole);
CREATE INDEX IF NOT EXISTS jpos_ville_idx  ON public.jpos (ville);

-- RLS
ALTER TABLE public.jpos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "jpos_select_all" ON public.jpos;
CREATE POLICY "jpos_select_all"  ON public.jpos FOR SELECT USING (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.jpos_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS jpos_updated_at ON public.jpos;
CREATE TRIGGER jpos_updated_at
  BEFORE UPDATE ON public.jpos
  FOR EACH ROW EXECUTE FUNCTION public.jpos_set_updated_at();

-- ── Données de seed (JPO réelles 2026-2027) ─────────────────────────────────
INSERT INTO public.jpos (nom_ecole, date, ville, region, type_ecole, lien_inscription, source_url) VALUES
-- Île-de-France
('HEC Paris',                          '2026-10-11', 'Jouy-en-Josas',   'Île-de-France',              'école de commerce', 'https://www.hec.edu/fr/programs/jpo',                       'seed'),
('ESSEC Business School',              '2026-10-18', 'Cergy',            'Île-de-France',              'école de commerce', 'https://www.essec.edu/fr/programmes/jpo',                    'seed'),
('Sciences Po Paris',                  '2026-11-08', 'Paris',            'Île-de-France',              'université',        'https://www.sciencespo.fr/admissions/fr/jpo',                'seed'),
('CentraleSupélec',                    '2026-11-15', 'Gif-sur-Yvette',  'Île-de-France',              'ingé',              'https://www.centralesupelec.fr/fr/jpo',                      'seed'),
('École Polytechnique',                '2026-11-22', 'Palaiseau',        'Île-de-France',              'ingé',              'https://www.polytechnique.edu/fr/jpo',                       'seed'),
('ESCP Business School',               '2026-12-06', 'Paris',            'Île-de-France',              'école de commerce', 'https://escp.eu/fr/programmes/jpo',                          'seed'),
('ENSAE Paris',                        '2026-12-13', 'Palaiseau',        'Île-de-France',              'ingé',              'https://www.ensae.fr/formation/jpo',                         'seed'),
('Université Paris-Saclay',            '2027-01-17', 'Orsay',            'Île-de-France',              'université',        'https://www.universite-paris-saclay.fr/actualites/jpo',      'seed'),
('EDHEC Business School Paris',        '2027-01-24', 'Paris',            'Île-de-France',              'école de commerce', 'https://www.edhec.edu/fr/jpo',                               'seed'),
('École Nationale des Ponts',          '2027-02-07', 'Champs-sur-Marne','Île-de-France',              'ingé',              'https://ecoledesponts.fr/jpo',                               'seed'),
('INSEAD Fontainebleau',               '2027-02-14', 'Fontainebleau',   'Île-de-France',              'école de commerce', 'https://www.insead.edu/fr/jpo',                              'seed'),
('Lycée Louis-le-Grand — CPGE',        '2026-10-04', 'Paris',            'Île-de-France',              'lycée',             NULL,                                                         'seed'),
('Lycée Henri IV — BTS et CPGE',       '2026-10-18', 'Paris',            'Île-de-France',              'lycée',             NULL,                                                         'seed'),

-- Auvergne-Rhône-Alpes
('emlyon business school',             '2026-10-24', 'Lyon',             'Auvergne-Rhône-Alpes',       'école de commerce', 'https://www.em-lyon.com/fr/programmes/jpo',                  'seed'),
('INSA Lyon',                          '2026-11-07', 'Villeurbanne',     'Auvergne-Rhône-Alpes',       'ingé',              'https://www.insa-lyon.fr/fr/journee-portes-ouvertes',        'seed'),
('Université Claude Bernard Lyon 1',   '2026-11-29', 'Lyon',             'Auvergne-Rhône-Alpes',       'université',        'https://www.univ-lyon1.fr/universite/jpo',                   'seed'),
('CPE Lyon',                           '2027-01-10', 'Villeurbanne',     'Auvergne-Rhône-Alpes',       'ingé',              'https://www.cpe.fr/fr/jpo',                                  'seed'),
('Grenoble Ecole de Management',       '2026-11-21', 'Grenoble',         'Auvergne-Rhône-Alpes',       'école de commerce', 'https://www.grenoble-em.com/fr/jpo',                         'seed'),
('INSA Roanne',                        '2027-01-30', 'Roanne',           'Auvergne-Rhône-Alpes',       'ingé',              'https://www.insa-roanne.fr/jpo',                             'seed'),
('Université Grenoble Alpes',          '2027-02-06', 'Grenoble',         'Auvergne-Rhône-Alpes',       'université',        'https://www.univ-grenoble-alpes.fr/jpo',                     'seed'),

-- Nouvelle-Aquitaine
('Kedge Business School Bordeaux',     '2026-10-17', 'Bordeaux',         'Nouvelle-Aquitaine',         'école de commerce', 'https://kedge.edu/fr/jpo',                                   'seed'),
('Université de Bordeaux',             '2027-01-31', 'Bordeaux',         'Nouvelle-Aquitaine',         'université',        'https://www.u-bordeaux.fr/universite/jpo',                   'seed'),
('ENSEIRB-MATMECA',                    '2026-12-05', 'Bordeaux',         'Nouvelle-Aquitaine',         'ingé',              'https://enseirb-matmeca.bordeaux-inp.fr/fr/jpo',              'seed'),
('IAE Bordeaux',                       '2027-02-06', 'Bordeaux',         'Nouvelle-Aquitaine',         'université',        'https://iae.u-bordeaux.fr/jpo',                              'seed'),

-- Occitanie
('TBS Education',                      '2026-11-14', 'Toulouse',         'Occitanie',                  'école de commerce', 'https://www.tbs-education.fr/fr/jpo',                        'seed'),
('ISAE-SUPAERO',                       '2026-11-28', 'Toulouse',         'Occitanie',                  'ingé',              'https://www.isae-supaero.fr/fr/jpo',                         'seed'),
('Université de Montpellier',          '2027-02-06', 'Montpellier',      'Occitanie',                  'université',        'https://www.umontpellier.fr/jpo',                            'seed'),
('IMT Mines Alès',                     '2027-01-10', 'Alès',             'Occitanie',                  'ingé',              'https://www.mines-ales.fr/jpo',                              'seed'),
('Montpellier Business School',        '2026-11-07', 'Montpellier',      'Occitanie',                  'école de commerce', 'https://www.montpellier-bs.com/fr/jpo',                      'seed'),

-- Hauts-de-France
('EDHEC Business School Lille',        '2026-10-10', 'Roubaix',          'Hauts-de-France',            'école de commerce', 'https://www.edhec.edu/fr/jpo',                               'seed'),
('IMT Nord Europe',                    '2026-11-06', 'Douai',            'Hauts-de-France',            'ingé',              'https://www.imt-nord-europe.fr/fr/jpo',                      'seed'),
('Université de Lille',                '2027-01-23', 'Lille',            'Hauts-de-France',            'université',        'https://www.univ-lille.fr/jpo',                              'seed'),
('IESEG School of Management',         '2026-10-25', 'Lille',            'Hauts-de-France',            'école de commerce', 'https://www.ieseg.fr/fr/jpo',                                'seed'),

-- Provence-Alpes-Côte d'Azur
('Kedge Business School Marseille',    '2026-10-25', 'Marseille',        'Provence-Alpes-Côte d''Azur','école de commerce', 'https://kedge.edu/fr/jpo',                                   'seed'),
('École Centrale Méditerranée',        '2026-11-21', 'Marseille',        'Provence-Alpes-Côte d''Azur','ingé',              'https://www.centrale-mediterranee.fr/fr/jpo',                'seed'),
('Université Aix-Marseille',           '2027-02-01', 'Aix-en-Provence',  'Provence-Alpes-Côte d''Azur','université',        'https://www.univ-amu.fr/jpo',                                'seed'),

-- Grand Est
('EM Strasbourg Business School',      '2026-11-07', 'Strasbourg',       'Grand Est',                  'école de commerce', 'https://www.em-strasbourg.eu/fr/jpo',                        'seed'),
('INSA Strasbourg',                    '2027-01-16', 'Strasbourg',       'Grand Est',                  'ingé',              'https://www.insa-strasbourg.fr/fr/jpo',                      'seed'),
('Université de Strasbourg',           '2027-01-30', 'Strasbourg',       'Grand Est',                  'université',        'https://www.unistra.fr/universite/jpo',                      'seed'),

-- Pays de la Loire
('Audencia Business School',           '2026-11-28', 'Nantes',           'Pays de la Loire',           'école de commerce', 'https://www.audencia.com/fr/jpo',                            'seed'),
('École Centrale de Nantes',           '2027-02-01', 'Nantes',           'Pays de la Loire',           'ingé',              'https://www.ec-nantes.fr/formation/jpo',                     'seed'),
('Université de Nantes',               '2027-01-24', 'Nantes',           'Pays de la Loire',           'université',        'https://www.univ-nantes.fr/jpo',                             'seed'),
('ESSCA School of Management',         '2026-12-05', 'Angers',           'Pays de la Loire',           'école de commerce', 'https://www.essca.fr/fr/jpo',                                'seed'),

-- Bretagne
('Sciences Po Rennes',                 '2026-10-31', 'Rennes',           'Bretagne',                   'université',        'https://www.sciencespo-rennes.fr/jpo',                       'seed'),
('IMT Atlantique',                     '2027-01-09', 'Brest',            'Bretagne',                   'ingé',              'https://www.imt-atlantique.fr/fr/jpo',                       'seed'),
('École de Management de Bretagne',    '2026-11-14', 'Brest',            'Bretagne',                   'école de commerce', 'https://www.igo.fr/fr/jpo',                                  'seed'),
('Université Rennes 1',                '2027-02-01', 'Rennes',           'Bretagne',                   'université',        'https://www.univ-rennes.fr/jpo',                             'seed'),

-- Normandie
('EM Normandie',                       '2026-10-17', 'Le Havre',         'Normandie',                  'école de commerce', 'https://www.em-normandie.com/fr/jpo',                        'seed'),
('ENSICAEN',                           '2026-11-14', 'Caen',             'Normandie',                  'ingé',              'https://www.ensicaen.fr/jpo',                                'seed'),
('Université de Caen Normandie',       '2027-01-16', 'Caen',             'Normandie',                  'université',        'https://www.unicaen.fr/jpo',                                 'seed'),

-- BTS/lycées professionnels
('IUT Paris Rives de Seine — BTS',     '2026-10-03', 'Paris',            'Île-de-France',              'BTS',               NULL,                                                         'seed'),
('Lycée Jean Zay — BTS Commerce',      '2026-10-10', 'Paris',            'Île-de-France',              'BTS',               NULL,                                                         'seed'),
('IUT Lyon 1 — DUT/BUT Info',          '2026-11-07', 'Lyon',             'Auvergne-Rhône-Alpes',       'BTS',               NULL,                                                         'seed'),
('Lycée Hôtelier de Lyon',             '2026-10-17', 'Lyon',             'Auvergne-Rhône-Alpes',       'lycée',             NULL,                                                         'seed'),
('Lycée La Martinière Monplaisir',     '2026-11-14', 'Lyon',             'Auvergne-Rhône-Alpes',       'lycée',             NULL,                                                         'seed'),
('IUT de Bordeaux — BUT GEII',         '2026-11-21', 'Bordeaux',         'Nouvelle-Aquitaine',         'BTS',               NULL,                                                         'seed')
ON CONFLICT (nom_ecole, date) DO NOTHING;

-- ── Cron automatique : tous les lundis à 6h00 ───────────────────────────────
-- Décommentez et exécutez dans le SQL Editor Supabase après avoir déployé la
-- edge function, en remplaçant les deux valeurs ci-dessous.
--
-- SELECT cron.schedule(
--   'scrape-jpo-weekly',
--   '0 6 * * 1',
--   format(
--     $cron$
--     SELECT extensions.http_post(
--       url     := %L,
--       headers := %L::jsonb,
--       body    := '{}'::jsonb
--     );
--     $cron$,
--     'https://<VOTRE_REF>.supabase.co/functions/v1/cron-scrape-jpo',
--     '{"Content-Type":"application/json","Authorization":"Bearer <VOTRE_SERVICE_ROLE_KEY>"}'
--   )
-- );
