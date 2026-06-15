-- ============================================================
-- Springr – tables de données principales
-- ============================================================

-- ------------------------------------------------------------------ offres
CREATE TABLE public.offres (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  company     text        NOT NULL,
  city        text        NOT NULL,
  remote      boolean     NOT NULL DEFAULT false,
  type        text        NOT NULL CHECK (type IN ('stage','alternance','job')),
  sector      text        NOT NULL,
  posted_at   date        NOT NULL DEFAULT current_date,
  tags        text[]      NOT NULL DEFAULT '{}',
  apply_url   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.offres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "offres_public_read"  ON public.offres FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "offres_service_write" ON public.offres FOR ALL TO service_role USING (true) WITH CHECK (true);

GRANT SELECT ON public.offres TO anon, authenticated;
GRANT ALL    ON public.offres TO service_role;

-- ------------------------------------------------------------------ candidatures
CREATE TABLE public.candidatures (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offre_id    uuid        NOT NULL REFERENCES public.offres(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, offre_id)
);

ALTER TABLE public.candidatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "candidatures_own_read"   ON public.candidatures FOR SELECT    TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "candidatures_own_insert" ON public.candidatures FOR INSERT    TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "candidatures_own_delete" ON public.candidatures FOR DELETE    TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON public.candidatures TO authenticated;
GRANT ALL                    ON public.candidatures TO service_role;

-- ------------------------------------------------------------------ mentors
CREATE TABLE public.mentors (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    text        NOT NULL,
  last_name     text        NOT NULL,
  position      text        NOT NULL,
  company       text        NOT NULL,
  sector        text        NOT NULL,
  city          text        NOT NULL,
  bio           text,
  skills        text[]      NOT NULL DEFAULT '{}',
  availability  text        NOT NULL DEFAULT 'disponible' CHECK (availability IN ('disponible','sur_demande','occupe')),
  sessions      integer     NOT NULL DEFAULT 0,
  avatar_color  text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mentors_public_read"   ON public.mentors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "mentors_service_write" ON public.mentors FOR ALL    TO service_role USING (true) WITH CHECK (true);

GRANT SELECT ON public.mentors TO anon, authenticated;
GRANT ALL    ON public.mentors TO service_role;

-- ------------------------------------------------------------------ evenements
CREATE TABLE public.evenements (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  organizer   text        NOT NULL,
  date        date        NOT NULL,
  city        text        NOT NULL,
  type        text        NOT NULL CHECK (type IN ('JPO','Forum','Salon','Soirée')),
  description text,
  url         text,
  featured    boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.evenements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "evenements_public_read"   ON public.evenements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "evenements_service_write" ON public.evenements FOR ALL    TO service_role USING (true) WITH CHECK (true);

GRANT SELECT ON public.evenements TO anon, authenticated;
GRANT ALL    ON public.evenements TO service_role;

-- ------------------------------------------------------------------ bons_plans
CREATE TABLE public.bons_plans (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  description text,
  category    text        NOT NULL CHECK (category IN ('Logement','Réductions','Codes promo','Restos')),
  badge       text,
  url         text,
  highlight   boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bons_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bons_plans_public_read"   ON public.bons_plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "bons_plans_service_write" ON public.bons_plans FOR ALL    TO service_role USING (true) WITH CHECK (true);

GRANT SELECT ON public.bons_plans TO anon, authenticated;
GRANT ALL    ON public.bons_plans TO service_role;

-- ------------------------------------------------------------------ ecoles
CREATE TABLE public.ecoles (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  type        text        NOT NULL,
  city        text        NOT NULL,
  website     text,
  description text,
  logo_url    text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ecoles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ecoles_public_read"   ON public.ecoles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "ecoles_service_write" ON public.ecoles FOR ALL    TO service_role USING (true) WITH CHECK (true);

GRANT SELECT ON public.ecoles TO anon, authenticated;
GRANT ALL    ON public.ecoles TO service_role;

-- ------------------------------------------------------------------ avis_ecoles
CREATE TABLE public.avis_ecoles (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ecole_id    uuid        NOT NULL REFERENCES public.ecoles(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  rating      integer     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ecole_id, user_id)
);

ALTER TABLE public.avis_ecoles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "avis_ecoles_public_read"   ON public.avis_ecoles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "avis_ecoles_own_insert"    ON public.avis_ecoles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "avis_ecoles_own_update"    ON public.avis_ecoles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

GRANT SELECT ON public.avis_ecoles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.avis_ecoles TO authenticated;
GRANT ALL    ON public.avis_ecoles TO service_role;

-- ------------------------------------------------------------------ conversations
CREATE TABLE public.conversations (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2 uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (participant_1, participant_2)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversations_participant_read" ON public.conversations FOR SELECT TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "conversations_participant_insert" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

GRANT SELECT, INSERT ON public.conversations TO authenticated;
GRANT ALL            ON public.conversations TO service_role;

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------ messages
CREATE TABLE public.messages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content         text        NOT NULL,
  read_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_conversation_read" ON public.messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );
CREATE POLICY "messages_own_insert" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL            ON public.messages TO service_role;

-- ================================================================== SEED DATA

-- ------------------------------------------------------------------ offres (24)
INSERT INTO public.offres (title, company, city, remote, type, sector, posted_at, tags) VALUES
('UX Designer',              'Notion',                   'Paris',    true,  'stage',      'Tech',       '2026-06-13', ARRAY['Figma','User research']),
('Développeur·se React',      'Alan',                     'Paris',    true,  'alternance', 'Tech',       '2026-06-12', ARRAY['React','TypeScript']),
('Chef de projet Marketing',  'Doctolib',                 'Paris',    false, 'stage',      'Marketing',  '2026-06-10', ARRAY['SEO','Analytics']),
('Data Analyst',              'BlaBlaCar',                'Paris',    true,  'stage',      'Tech',       '2026-06-08', ARRAY['SQL','Python']),
('Chargé·e de Communication', 'Mano Mano',                'Bordeaux', false, 'alternance', 'Marketing',  '2026-06-11', ARRAY['Réseaux sociaux','Canva']),
('Business Developer',        'Pennylane',                'Lyon',     false, 'job',        'Finance',    '2026-06-09', ARRAY['B2B','SaaS']),
('Product Manager Junior',    'Swile',                    'Paris',    true,  'job',        'Tech',       '2026-06-07', ARRAY['Agile','Roadmap']),
('Graphiste Motion Design',   'Brut.',                    'Paris',    false, 'stage',      'Médias',     '2026-06-14', ARRAY['After Effects','Premiere']),
('Développeur·se Full Stack', 'Qonto',                    'Paris',    true,  'alternance', 'Tech',       '2026-06-06', ARRAY['Ruby','Vue.js']),
('Analyste Financier·ère',    'BNP Paribas',              'Paris',    false, 'stage',      'Finance',    '2026-06-05', ARRAY['Excel','Modélisation']),
('Consultant·e Junior',       'McKinsey',                 'Paris',    false, 'job',        'Conseil',    '2026-06-04', ARRAY['Stratégie','PowerPoint']),
('Brand Content Manager',     'LVMH',                     'Paris',    false, 'alternance', 'Marketing',  '2026-06-03', ARRAY['Rédaction','Luxe']),
('Ingénieur·e DevOps',        'OVHcloud',                 'Lille',    true,  'job',        'Tech',       '2026-06-02', ARRAY['Kubernetes','CI/CD']),
('Chargé·e RH',               'Decathlon',                'Lille',    false, 'alternance', 'RH',         '2026-06-01', ARRAY['Recrutement','SIRH']),
('Designer Produit',          'Contentsquare',            'Lyon',     true,  'stage',      'Tech',       '2026-05-30', ARRAY['Figma','Prototypage']),
('Développeur·se Mobile',     'Lydia',                    'Paris',    true,  'alternance', 'Tech',       '2026-05-29', ARRAY['Flutter','Kotlin']),
('Growth Hacker',             'Payfit',                   'Bordeaux', true,  'stage',      'Marketing',  '2026-05-28', ARRAY['A/B testing','CRM']),
('Ingénieur·e Data Science',  'Enedis',                   'Lyon',     false, 'job',        'Énergie',    '2026-05-27', ARRAY['Python','Machine Learning']),
('Responsable E-commerce',    'Cdiscount',                'Bordeaux', false, 'job',        'E-commerce', '2026-05-26', ARRAY['Shopify','Analytics']),
('Coordinateur·rice Projets', 'Médecins Sans Frontières', 'Paris',    false, 'stage',      'Éducation',  '2026-06-15', ARRAY['Gestion de projet','ONG']),
('Ingénieur·e Logiciel',      'Withings',                 'Nantes',   true,  'job',        'Tech',       '2026-06-14', ARRAY['C++','Embedded']),
('Chargé·e SEO & Content',    'Leboncoin',                'Paris',    true,  'alternance', 'Marketing',  '2026-06-13', ARRAY['SEO','WordPress']),
('Avocat·e Junior',           'Peugeot',                  'Paris',    false, 'stage',      'Conseil',    '2026-06-11', ARRAY['Droit des affaires']),
('UI Designer',               'Deezer',                   'Paris',    true,  'stage',      'Médias',     '2026-06-10', ARRAY['Figma','Design System']);

-- ------------------------------------------------------------------ mentors (18)
INSERT INTO public.mentors (first_name, last_name, position, company, sector, city, bio, skills, availability, sessions, avatar_color) VALUES
('Sophie',   'Bernard',   'Engineering Manager',       'Stripe',              'Tech',      'Paris',     '8 ans en ingénierie produit, je t''aide à naviguer ta carrière dev et à décrocher ton premier poste tech.',                         ARRAY['Career path','Code review','System design'],         'disponible',   47, 'from-violet to-violet/40'),
('Karim',    'Messaoudi', 'Senior Product Designer',   'Figma',               'Design',    'Remote',    'Portfolio critique, UX case studies et préparation aux entretiens design — je réponds à tout.',                                     ARRAY['Portfolio review','UX research','Design system'],     'disponible',   31, 'from-blue-500 to-blue-500/40'),
('Lucie',    'Fontaine',  'Growth Lead',               'Doctolib',            'Marketing', 'Paris',     'Ex-agence, maintenant côté produit. Je mentore sur le growth hacking, l''acquisition et les premières expériences marketing.',       ARRAY['Growth','SEO','Paid acquisition'],                     'sur_demande',  22, 'from-pink-500 to-pink-500/40'),
('Thomas',   'Girard',    'CTO & Co-fondateur',        'Pennylane',           'Tech',      'Paris',     'J''accompagne les devs qui veulent comprendre la dimension business et ceux qui aspirent à des rôles de lead.',                      ARRAY['Leadership tech','Architecture','Startup'],           'sur_demande',  18, 'from-amber-400 to-amber-400/40'),
('Amina',    'Koné',      'Analyste M&A',              'BNP Paribas CIB',     'Finance',   'Paris',     'Grands groupes, prépas commerciales, stages IBD — je démystifie le monde de la banque d''affaires.',                               ARRAY['IBD','Modélisation','Networking'],                     'disponible',   56, 'from-emerald-500 to-emerald-500/40'),
('Hugo',     'Descamps',  'Senior Consultant',         'McKinsey & Company',  'Conseil',   'Paris',     'Cabinets de conseil, case interviews, life in consulting — je partage tout sans filtre.',                                           ARRAY['Case interview','Strategy','Présentation'],           'disponible',   63, 'from-cyan-500 to-cyan-500/40'),
('Inès',     'Morel',     'Rédactrice en chef',        'Le Monde',            'Médias',    'Paris',     'Journalisme, pige, écriture web — je conseille les étudiants en communication et info.',                                            ARRAY['Journalisme','Rédaction','Pige'],                      'sur_demande',  14, 'from-rose-500 to-rose-500/40'),
('Mehdi',    'Oualid',    'Staff Engineer',            'Datadog',             'Tech',      'Remote',    'Backend, infra, interviews techniques big tech — je t''aide à te préparer pour les FAANG et scale-ups.',                            ARRAY['Algo & DS','System design','Go / Python'],             'disponible',   89, 'from-lime/80 to-lime/30'),
('Clara',    'Petit',     'Brand Manager',             'L''Oréal',            'Marketing', 'Paris',     'Branding, stage grands groupes, FMCG — je t''aide à décrocher et à performer en marketing beauté.',                                ARRAY['Brand strategy','FMCG','Grands groupes'],              'occupe',       28, 'from-pink-500 to-pink-500/40'),
('Nicolas',  'Roux',      'VC Analyst',                'Partech',             'Finance',   'Paris',     'Startups, pitch decks, monde du VC — je réponds à tes questions sur l''écosystème tech et l''investissement.',                     ARRAY['Venture Capital','Startup','Due diligence'],           'disponible',   35, 'from-amber-400 to-amber-400/40'),
('Yasmine',  'Hadj',      'UX Lead',                   'Publicis Sapient',    'Design',    'Lyon',      'Design thinking, research utilisateur, agences vs produit — j''aide les designers juniors à se positionner.',                      ARRAY['UX research','Workshop','Agence'],                     'disponible',   41, 'from-blue-500 to-blue-500/40'),
('Romain',   'Lecomte',   'DRH',                       'Decathlon',           'RH',        'Lille',     'Recrutement, carrières RH, entretiens — tout ce que tu veux savoir côté RH d''un grand groupe.',                                  ARRAY['Entretien','GPEC','Recrutement'],                      'sur_demande',  19, 'from-cyan-500 to-cyan-500/40'),
('Jade',     'Marchand',  'Product Manager',           'Blablacar',           'Tech',      'Paris',     'Transition dev → PM, discovery, priorisation backlog — je partage ma méthode sans jargon.',                                        ARRAY['Product discovery','Priorisation','OKR'],              'disponible',   52, 'from-violet to-violet/40'),
('Antoine',  'Mercier',   'Ingénieur Énergie',         'TotalEnergies',       'Énergie',   'Toulouse',  'Transition énergétique, grandes écoles d''ingé, stage industrie — je t''aide à te repérer dans ce secteur.',                      ARRAY['EnR','Industrie','Grandes écoles'],                    'sur_demande',  11, 'from-emerald-500 to-emerald-500/40'),
('Léa',      'Simon',     'Frontend Engineer',         'Alan',                'Tech',      'Paris',     'React, accessibilité, impact social en startup — je mentore les devs front qui veulent travailler dans la healthtech.',             ARRAY['React','Accessibilité','Healthtech'],                  'disponible',   38, 'from-lime/80 to-lime/30'),
('Valentin', 'Dubois',    'Directeur Conseil',         'Boston Consulting Group','Conseil', 'Paris',     'Grandes écoles, consulting stratégie, reconversions — je partage l''envers du décor sans langue de bois.',                        ARRAY['Recrutement BCG','Stratégie','Leadership'],            'occupe',       74, 'from-rose-500 to-rose-500/40'),
('Océane',   'Blanchard',  'Social Media Manager',     'Brut.',               'Médias',    'Paris',     'Création de contenu, UGC, stratégie réseaux — je t''aide à percer dans le marketing digital des médias.',                         ARRAY['TikTok','Instagram','Contenu vidéo'],                  'disponible',   26, 'from-pink-500 to-pink-500/40'),
('Pierre',   'Laurent',   'Head of Data',              'Leboncoin',           'Tech',      'Remote',    'Data engineering, ML en prod, analytics — je mentore data analysts et data scientists qui veulent aller plus loin.',               ARRAY['Python','SQL','MLOps'],                                'disponible',   44, 'from-blue-500 to-blue-500/40');

-- ------------------------------------------------------------------ evenements (20)
INSERT INTO public.evenements (title, organizer, date, city, type, description, url, featured) VALUES
('Journée Portes Ouvertes — Sciences Po Paris',    'Sciences Po',         '2027-01-22', 'Paris',        'JPO',    'Découvrez les formations, rencontrez des étudiants et assistez à des conférences avec les équipes pédagogiques.',                        '#', true),
('Journée Découverte — HEC Paris',                 'HEC Paris',           '2027-02-05', 'Jouy-en-Josas','JPO',    'Campus ouvert, présentations des grandes voies et rencontres avec alumni et professeurs.',                                               '#', false),
('JPO CentraleSupélec',                            'CentraleSupélec',     '2027-02-15', 'Paris',        'JPO',    'Portes ouvertes de l''une des meilleures écoles d''ingénieurs françaises. Visites, ateliers et demos labo.',                            '#', false),
('JPO ESCP Business School',                       'ESCP',                '2027-03-08', 'Paris',        'JPO',    'Rencontrez les équipes d''admission et des étudiants des programmes Bachelor, Master et MBA.',                                           '#', false),
('JPO KEDGE Business School',                      'KEDGE BS',            '2027-01-30', 'Bordeaux',     'JPO',    'Journée portes ouvertes du campus de Bordeaux avec mini-cours et rencontre avec les responsables de filières.',                          '#', false),
('JPO emlyon business school',                     'emlyon',              '2027-02-20', 'Lyon',         'JPO',    'Présentation des formations, de la vie campus et des opportunités d''entrepreneuriat de l''école.',                                       '#', false),
('Forum Entreprises Polytechnique',                'Binet Entreprises',   '2026-11-15', 'Paris',        'Forum',  'Le plus grand forum étudiant de France : 200 entreprises, networking intensif et remise de CV.',                                         '#', true),
('Forum ESSEC Entreprises',                        'ESSEC',               '2026-10-20', 'Cergy',        'Forum',  'Forum de recrutement avec les plus grands employeurs : cabinets de conseil, banques, startups tech.',                                      '#', false),
('Forum Jeunes Talents HEC',                       'HEC Carrières',       '2026-11-10', 'Jouy-en-Josas','Forum',  'Rencontres entre étudiants et recruteurs dans un format speed-dating professionnel.',                                                    '#', false),
('Forum Horizon Carrières',                        'Université de Lyon',  '2026-11-25', 'Lyon',         'Forum',  'Forum pluridisciplinaire ouvert à tous les étudiants lyonnais. Stages, alternances et premiers emplois.',                                 '#', false),
('Salon de l''Étudiant — Paris',                   'L''Étudiant',         '2027-01-25', 'Paris',        'Salon',  'Le salon de référence pour s''informer sur les études supérieures. 300 stands, conférences et tests d''orientation.',                    '#', true),
('Salon Alternance & Apprentissage',               'Reed Expositions',    '2026-11-05', 'Paris',        'Salon',  'Le seul salon 100% dédié à l''alternance avec 250 entreprises à la recherche d''alternants.',                                            '#', false),
('Futur.e.s in Tech — Diversité & Numérique',      'HubHouse',            '2026-12-10', 'Paris',        'Salon',  'Festival dédié à la diversité dans la tech. Talks, ateliers et rencontres avec des pros engagés.',                                        '#', false),
('Welcome to the Jungle Campus Tour',              'WTTJ',                '2026-10-30', 'Bordeaux',     'Salon',  'Le salon de l''emploi nouvelle génération en tournée dans les grandes villes. Rencontrez les entreprises cool.',                          '#', false),
('Go Entrepreneurs — Salon de l''Entrepreneuriat', 'CCI Paris',           '2026-11-20', 'Paris',        'Salon',  'Le salon incontournable pour les entrepreneurs et ceux qui veulent se lancer. Conférences et pitchs.',                                    '#', false),
('Springr Before Carrière — Paris',                'Springr',             '2026-10-30', 'Paris',        'Soirée', 'Notre propre soirée networking pour connecter étudiants, mentors et recruteurs dans une ambiance détendue.',                              '#', true),
('Meetup UX/Design Paris',                         'UX Collective',       '2026-12-08', 'Paris',        'Soirée', 'Soirée portfolio reviews et talks lightning par des designers seniors. Pizza + drinks offerts.',                                          '#', false),
('FinTech Networking Lyon',                        'Lyon FinTech',        '2026-11-15', 'Lyon',         'Soirée', 'Soirée de networking dédiée à l''écosystème FinTech lyonnais. Startups, banques et étudiants se retrouvent.',                            '#', false),
('Before Jobs Tech — Bordeaux',                    'Bordeaux Tech',       '2026-11-22', 'Bordeaux',     'Soirée', 'Rencontres informelles entre profils tech et entreprises locales. Format afterwork, entrée libre.',                                       '#', false),
('Startup Weekend Nantes',                         'Techstars',           '2026-12-05', 'Nantes',       'Soirée', '54 heures pour créer une startup de zéro. Ouvert aux étudiants, développeurs, designers et bizdevs.',                                    '#', false);

-- ------------------------------------------------------------------ bons_plans (21)
INSERT INTO public.bons_plans (title, description, category, badge, url, highlight) VALUES
('CROUS — Résidences universitaires',   'Logements étudiants subventionnés à partir de 150€/mois. Dossier via Mon Dossier CROUS.',                                    'Logement',    'À partir de 150€/mois',    '#', true),
('Garantme — Garant en ligne',          'Obtiens un garant certifié instantanément, sans CDI ni parent co-signataire.',                                                'Logement',    'Gratuit à l''inscription',  '#', false),
('Action Logement — LOCA-PASS',         'Avance gratuite du dépôt de garantie et garantie loyer impayé pour les alternants.',                                          'Logement',    '0€ d''intérêt',             '#', false),
('Studapart — Logements vérifiés',      'Plateforme de colocations et studios entre étudiants, avec contrats sécurisés.',                                              'Logement',    'Sans frais d''agence',      '#', false),
('Visale — Caution CAF',                'Caution locative gratuite accordée par Action Logement pour les moins de 30 ans.',                                            'Logement',    'Gratuit',                   '#', false),
('Carte ISIC — Réductions mondiales',   'La carte étudiante internationale valable dans 130 pays pour des milliers de réductions.',                                    'Réductions',  '-10% à -50%',               '#', true),
('UNiDAYS — Mode & Tech',              'Réductions exclusives chez Nike, Apple, Samsung, ASOS et 800+ marques partenaires.',                                          'Réductions',  'Gratuit',                   '#', false),
('Spotify Premium Étudiant',            'Spotify + Hulu à moitié prix. Éligible avec ton adresse email universitaire.',                                               'Réductions',  '5,99€/mois',                '#', false),
('Apple Education',                     'MacBook, iPad et AirPods à prix réduit avec justificatif étudiant sur l''Apple Store.',                                       'Réductions',  'Jusqu''à -200€',            '#', false),
('SNCF Carte Avantage Jeune',          'Voyages en TGV et Intercités réduits jusqu''à 60% pour les 12-27 ans.',                                                      'Réductions',  '49€/an',                    '#', false),
('Carte Musées Nationaux',             'Accès gratuit aux collections permanentes pour tous les moins de 26 ans ressortissants UE.',                                  'Réductions',  'Gratuit -26 ans UE',        '#', false),
('GitHub Student Developer Pack',      'Accès gratuit à 100+ outils dev : GitHub Pro, Copilot, AWS, Figma, Notion et plus.',                                         'Codes promo', '100% gratuit',              '#', true),
('Notion — Plan Plus gratuit 1 an',    'Notion Plan Plus offert 1 an pour les étudiants avec email universitaire vérifié.',                                           'Codes promo', '0€ pendant 1 an',           '#', false),
('Adobe Creative Cloud Étudiant',      'Accès à toutes les apps Adobe (Photoshop, Premiere, Illustrator…) à prix étudiant.',                                         'Codes promo', '-65% vs tarif normal',      '#', false),
('Canva Pro — Gratuit',                'Canva Pro offert à vie avec email étudiant. Templates, backgrounds et assets premium.',                                        'Codes promo', 'Gratuit',                   '#', false),
('Microsoft 365 Éducation',            'Word, Excel, PowerPoint, Teams et 1 To OneDrive gratuits avec email académique.',                                             'Codes promo', 'Gratuit',                   '#', false),
('Restaurants Universitaires CROUS',   'Repas complet à 1€ pour les boursiers, 3,30€ pour tous les étudiants. 800 restos en France.',                                'Restos',      'Dès 1€/repas',              '#', true),
('Too Good To Go — Anti-gaspi',        'Récupère des paniers-surprises de restaurants et boulangeries à partir de 2,99€.',                                            'Restos',      'À partir de 2,99€',         '#', false),
('Deliveroo — 50% le premier mois',   'Deliveroo Plus offert 1 mois à l''inscription : livraison gratuite sur toutes tes commandes.',                                 'Restos',      'Livraison offerte',         '#', false),
('Lunchr / Swile — Titre-restaurant', 'Si ton employeur le propose, le titre-restaurant couvre 50-60% de tes repas du midi.',                                        'Restos',      'Jusqu''à 13,09€/jour',      '#', false),
('Youzful — Resto à -50%',            'Plateforme qui négocie des deals restos pour les étudiants : midi à moitié prix.',                                             'Restos',      '-50% le midi',              '#', false);
