-- ── Refonte table bons_plans ────────────────────────────────────────────────
-- Drop de l'ancienne version (schema différent)
DROP TABLE IF EXISTS public.bons_plans;

CREATE TABLE public.bons_plans (
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

CREATE INDEX bons_plans_categorie_idx  ON public.bons_plans (categorie);
CREATE INDEX bons_plans_actif_idx      ON public.bons_plans (actif);
CREATE INDEX bons_plans_ordre_idx      ON public.bons_plans (categorie, ordre_affichage);

ALTER TABLE public.bons_plans ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les bons plans actifs
DROP POLICY IF EXISTS "bp_select_active" ON public.bons_plans;
CREATE POLICY "bp_select_active" ON public.bons_plans
  FOR SELECT USING (
    actif = true
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Seuls les admins peuvent écrire
DROP POLICY IF EXISTS "bp_admin_write" ON public.bons_plans;
CREATE POLICY "bp_admin_write" ON public.bons_plans
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.bp_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS bp_updated_at ON public.bons_plans;
CREATE TRIGGER bp_updated_at
  BEFORE UPDATE ON public.bons_plans
  FOR EACH ROW EXECUTE FUNCTION public.bp_set_updated_at();

-- ── Pour créer un administrateur, exécutez dans le SQL Editor Supabase : ────
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('UUID_DU_USER', 'admin')
-- ON CONFLICT DO NOTHING;

-- ── Seed — 58 bons plans réels ───────────────────────────────────────────────
INSERT INTO public.bons_plans
  (titre, description, categorie, badge_texte, badge_couleur, lien_url, code_promo, valeur_reduction, ordre_affichage)
VALUES

-- ── TECH & LOGICIELS ─────────────────────────────────────────────────────────
('Apple Education — MacBook Air M3',
 'MacBook Air M3 à 1 099€ au lieu de 1 299€ (-200€) + AirPods Pro offerts. Valable avec une adresse email académique ou via l''Apple Store Éducation.',
 'tech', 'AirPods OFFERTS', 'amber', 'https://www.apple.com/fr-ens/store', NULL, '-200€ + AirPods', 1),

('Spotify Étudiant',
 '7,07€/mois au lieu de 11,99€ + 1 mois gratuit pour commencer. Accès à tout le catalogue Spotify Premium. Renouvellement annuel avec preuve d''inscription.',
 'tech', '-41%', 'amber', 'https://www.spotify.com/fr/student', NULL, '-41%', 2),

('Apple Music Étudiant',
 '5,99€/mois au lieu de 11,99€. -50% sur l''abonnement individuel. Compatible avec toutes les plateformes Apple. 1 mois offert à l''inscription.',
 'tech', '-50%', 'amber', 'https://music.apple.com', NULL, '-50%', 3),

('Notion — Plan Pro Gratuit',
 'Toutes les fonctionnalités du plan Pro (IA incluse, blocs illimités, pages illimitées) gratuitement pour les étudiants et enseignants.',
 'tech', 'GRATUIT', 'lime', 'https://www.notion.so/fr-fr/students', NULL, '100%', 4),

('Adobe Creative Cloud Étudiant',
 '-65% sur l''abonnement Creative Cloud complet : Photoshop, Illustrator, Premiere Pro, After Effects... +20 applications disponibles.',
 'tech', '-65%', 'amber', 'https://www.adobe.com/fr/creativecloud/buy/students.html', NULL, '-65%', 5),

('Microsoft 365 — Gratuit via ton école',
 'Word, Excel, PowerPoint, Teams, OneDrive 1 To... complètement gratuit pour les étudiants via leur adresse email académique.',
 'tech', 'GRATUIT', 'lime', 'https://www.microsoft.com/fr-fr/education', NULL, '100%', 6),

('Figma Pro — Gratuit Éducation',
 'Plan Pro (équipes, composants, dev mode, auto-layout avancé) gratuit pour les étudiants et professeurs. Vérification via email académique.',
 'tech', 'GRATUIT', 'lime', 'https://www.figma.com/education/', NULL, '100%', 7),

('GitHub Pro — Student Developer Pack',
 'GitHub Pro + 100€ de crédits cloud, noms de domaine, outils CI/CD... Le pack complet pour developers gratuit via GitHub Education.',
 'tech', 'GRATUIT', 'lime', 'https://education.github.com', NULL, '100%', 8),

('Canva Pro — Gratuit Étudiant',
 'Accès à Canva Pro complet : millions de templates, suppression d''arrière-plan, kit de marque, exports illimités. 100% gratuit.',
 'tech', 'GRATUIT', 'lime', 'https://www.canva.com/education/', NULL, '100%', 9),

('JetBrains — Tous les IDE Gratuits',
 'IntelliJ IDEA, PyCharm, WebStorm, DataGrip, CLion... Tous les IDE JetBrains Professional gratuits pour les étudiants et enseignants.',
 'tech', 'GRATUIT', 'lime', 'https://www.jetbrains.com/community/education/', NULL, '100%', 10),

('NordVPN Étudiant — via MyUnidays',
 '-68% sur l''abonnement NordVPN via la plateforme MyUnidays. Protection de ta connexion sur tous tes appareils, streaming sans restrictions.',
 'tech', '-68%', 'amber', 'https://www.myunidays.com', NULL, '-68%', 11),

-- ── STREAMING & DIVERTISSEMENT ───────────────────────────────────────────────
('Disney+ Étudiant — via MyUnidays',
 '-50% sur l''abonnement Disney+ (Standard ou Premium) via MyUnidays. Accès à Disney, Marvel, Star Wars, National Geographic, Star.',
 'streaming', '-50%', 'amber', 'https://www.myunidays.com', NULL, '-50%', 1),

('YouTube Premium — 3 mois offerts',
 '3 mois d''essai gratuit puis tarif réduit étudiant. Sans pub, téléchargement hors ligne, YouTube Music inclus, lecture en arrière-plan.',
 'streaming', '3 mois offerts', 'amber', 'https://www.youtube.com/premium', NULL, '3 mois gratuits', 2),

('Deezer Étudiant',
 '3 mois gratuits puis 5,99€/mois (au lieu de 10,99€). Qualité audio FLAC, écoute hors ligne, paroles synchronisées.',
 'streaming', '3 mois GRATUITS', 'amber', 'https://www.deezer.com', NULL, '3 mois + -45%', 3),

('Duolingo Super Étudiant',
 '-50% sur Duolingo Super via UNiDAYS. Apprentissage sans publicité, mode hors ligne, progression illimitée, toutes les langues disponibles.',
 'streaming', '-50%', 'amber', 'https://www.duolingo.com', NULL, '-50%', 4),

-- ── LOGEMENT ─────────────────────────────────────────────────────────────────
('Lokaviz — CROUS',
 'Plateforme officielle du CROUS pour les annonces de logement étudiant vérifiées. Gratuit, sécurisé, partout en France.',
 'logement', 'Officiel CROUS', 'lime', 'https://www.lokaviz.fr', NULL, NULL, 1),

('Studapart — -10% code STUDENT10',
 'Location meublée, résidences étudiantes et colocations dans toute la France et l''Europe. -10% sur ta première réservation avec le code promo.',
 'logement', '-10%', 'violet', 'https://www.studapart.com', 'STUDENT10', '-10%', 2),

('Garantie Visale — Action Logement',
 'Caution locative gratuite garantie par l''État pour les moins de 30 ans ou les alternants. Remplace le garant physique. 100% gratuit.',
 'logement', 'GRATUIT', 'lime', 'https://www.visale.fr', NULL, NULL, 3),

('Roomlala — Colocation Étudiante',
 'Plateforme de colocation dédiée aux étudiants. Annonces vérifiées, bail mobilité compatible, chambres chez l''habitant ou entre étudiants.',
 'logement', 'Coloc', 'amber', 'https://www.roomlala.com', NULL, NULL, 4),

-- ── MODE & LIFESTYLE ─────────────────────────────────────────────────────────
('ASOS Étudiant — via UNiDAYS',
 '-10% sur toute la commande ASOS via UNiDAYS. Livraison gratuite au-delà d''un certain montant. Applicable sur les nouvelles collections.',
 'mode', '-10%', 'amber', 'https://www.asos.com', NULL, '-10%', 1),

('Nike Étudiant — via UNiDAYS',
 '-10% sur nike.com via UNiDAYS. Sneakers, vêtements de sport et accessoires. Code à usage unique, cumulable avec les soldes.',
 'mode', '-10%', 'amber', 'https://www.myunidays.com', NULL, '-10%', 2),

('Adidas Étudiant — via UNiDAYS',
 '-15% sur adidas.fr via UNiDAYS. Applicable sur les dernières sorties, les collaborations et les gammes Originals.',
 'mode', '-15%', 'amber', 'https://www.myunidays.com', NULL, '-15%', 3),

('IKEA — Carte IKEA Family Étudiant',
 '-10% supplémentaire sur les articles déjà en promotion avec la carte IKEA Family. Café gratuit en magasin, assurance casse incluse.',
 'mode', '-10%', 'amber', 'https://www.ikea.com/fr/fr/', NULL, '-10%', 4),

-- ── TRANSPORT ────────────────────────────────────────────────────────────────
('Carte Avantage Jeune SNCF',
 '49€/an pour -30% garantis sur tous les TGV INOUI et INTERCITÉS en France. Pour les 12-27 ans. Économies possibles dès le premier trajet.',
 'transport', '-30% train', 'amber', 'https://www.sncf-connect.com', NULL, '-30%', 1),

('MAX Jeune SNCF — Voyages Illimités',
 'Voyages TGV illimités en France pour les 16-27 ans. Abonnement mensuel ou annuel. Réservation à la dernière minute, modifiable gratuitement.',
 'transport', 'Illimité', 'amber', 'https://www.sncf-connect.com', NULL, 'Illimité', 2),

('BlaBlaCar Étudiant',
 '0% de commission sur tes trajets en covoiturage. Propose ou réserve un trajet sans frais de service. Idéal pour les retours chez les parents.',
 'transport', '0% commission', 'lime', 'https://www.blablacar.fr', NULL, NULL, 3),

('Lime Étudiant — Vélo & Trottinette',
 '-50% sur l''abonnement mensuel Lime (vélos et trottinettes en libre-service). Offre vérifiable via UNiDAYS dans les villes couvertes.',
 'transport', '-50%', 'amber', 'https://www.li.me', NULL, '-50%', 4),

('Uber Étudiant',
 '-15% sur ton premier mois de courses avec le code ETUDIANT. Disponible dans toutes les grandes villes françaises desservies par Uber.',
 'transport', '-15%', 'violet', 'https://www.uber.com', 'ETUDIANT', '-15%', 5),

-- ── VÉLO & MOBILITÉ DOUCE ────────────────────────────────────────────────────
('Prime Vélo Électrique Régionale',
 'De 100€ à 800€ d''aide selon ta ville ou ta région pour l''achat d''un vélo électrique. Cumulable avec les aides nationales. Étendue jusqu''en 2027.',
 'velo', 'Jusqu''à 800€', 'amber', 'https://www.jeunes.gouv.fr/achat-d-un-velo-les-aides-nationales-sont-etendues-jusqu-en-2027-2085', NULL, 'Jusqu''à 800€', 1),

('Forfait Mobilités Durables',
 'Jusqu''à 800€/an remboursés par ton employeur ou ton école si tu vas en cours/au travail à vélo, trottinette, covoiturage ou transports en commun.',
 'velo', 'Jusqu''à 800€/an', 'blue', 'https://www.service-public.fr', NULL, 'Jusqu''à 800€/an', 2),

-- ── VOYAGE ───────────────────────────────────────────────────────────────────
('InterRail Pass Jeune — Europe',
 '-25% pour les moins de 28 ans sur le pass InterRail. Voyage illimité en train dans 33 pays européens pendant 1 mois, 2 semaines ou 10 jours.',
 'voyage', '-25% Europe', 'amber', 'https://www.interrail.eu/fr', NULL, '-25%', 1),

('DiscoverEU — Pass InterRail Gratuit',
 'Programme de la Commission Européenne : tirage au sort pour gagner un pass InterRail GRATUIT l''année de tes 18 ans. Voyage solo ou en groupe de 5.',
 'voyage', 'Pass GRATUIT', 'lime', 'https://agence.erasmusplus.fr', NULL, '100%', 2),

('Carte Jeune Européenne (Euro<26)',
 'Réductions dans toute l''Europe : culture, transports, hébergements, restaurants. Valable dans 40 pays, pour les moins de 26 ans.',
 'voyage', 'Europe', 'amber', 'https://www.euro26.org', NULL, NULL, 3),

('Erasmus+ — Bourse Mobilité',
 'Bourse européenne pour étudier ou faire un stage à l''étranger : de 200€ à 700€/mois selon le pays de destination. Ouverte à tous les étudiants inscrits en France.',
 'voyage', 'Jusqu''à 700€/mois', 'blue', 'https://info.erasmusplus.fr', NULL, 'Jusqu''à 700€/mois', 4),

-- ── VACANCES ─────────────────────────────────────────────────────────────────
('Départ 18:25 — ANCV',
 'Jusqu''à 200€ d''aide pour partir en vacances en France ou en Europe. Réservé aux étudiants boursiers et alternants. Dossier à déposer avant ta partance.',
 'vacances', '200€ d''aide', 'blue', 'https://www.ancv.com', NULL, 'Jusqu''à 200€', 1),

('Séjours CROUS × ANCV',
 'Séjours organisés (montagne, mer, city trips...) à tarif réduit via le partenariat CROUS et l''ANCV. Places limitées, réservation en ligne.',
 'vacances', 'Prix réduit', 'amber', 'https://www.lescrous.fr/partenaire/ancv/', NULL, NULL, 2),

('Chèques Vacances ANCV',
 'Jusqu''à 250€ de chèques vacances pour les moins de 30 ans en situation de précarité. Utilisables dans les hôtels, campings, restaurants, parcs de loisirs.',
 'vacances', 'Jusqu''à 250€', 'blue', 'https://www.ancv.com', NULL, 'Jusqu''à 250€', 3),

('Paris Jeunes Vacances',
 'Aide de la Ville de Paris pour partir en séjour à tarif réduit : montagne, mer, découverte culturelle. Pour les Parisiens de 18 à 25 ans.',
 'vacances', 'Île-de-France', 'blue', 'https://www.paris.fr/pages/paris-jeunes-vacances-7490', NULL, NULL, 4),

-- ── BANQUE & FINANCE ─────────────────────────────────────────────────────────
('Revolut Étudiant',
 'Compte courant gratuit + carte bancaire (standard ou métal offerte 3 mois). Virements instantanés, échange de devises sans frais, cashback.',
 'banque', 'Carte offerte', 'amber', 'https://www.revolut.com/fr-FR/', NULL, NULL, 1),

('Lydia — 5% Cashback',
 '5% de cashback sur tous tes achats pendant 3 mois à l''ouverture. Cagnotte partagée, remboursements entre amis, carte virtuelle instantanée.',
 'banque', '5% cashback', 'amber', 'https://www.lydia-app.com', NULL, '5% pendant 3 mois', 2),

('Boursorama Étudiant',
 '80€ offerts à l''ouverture de ton premier compte Boursorama. Carte Visa gratuite, sans frais de tenue de compte, application mobile complète.',
 'banque', '80€ offerts', 'amber', 'https://www.boursorama.com', NULL, '80€', 3),

-- ── FOOD & RESTO ─────────────────────────────────────────────────────────────
('Deliveroo Plus Étudiant',
 '3 mois de livraison gratuite sans minimum de commande avec Deliveroo Plus. Puis tarif réduit étudiant via UNiDAYS. Annulable à tout moment.',
 'food', '3 mois gratuits', 'amber', 'https://deliveroo.fr', NULL, '3 mois gratuits', 1),

('Uber Eats — Code Étudiant',
 '2€ offerts sur 3 commandes avec le code ETUDIANT2. Cumulable avec les offres restaurants partenaires. Valable sur la première semaine.',
 'food', '2€ offerts', 'violet', 'https://www.ubereats.com', 'ETUDIANT2', '2€ x3', 2),

('Too Good To Go — Anti-Gaspi',
 'Repas complets de restaurants et boulangeries à partir de 3€. Récupère les invendus du soir à prix cassé. Disponible dans toutes les grandes villes.',
 'food', 'Repas à 3€', 'lime', 'https://www.toogoodtogo.com', NULL, 'Dès 3€', 3),

-- ── SANTÉ ────────────────────────────────────────────────────────────────────
('Alan — Mutuelle Étudiante',
 'Mutuelle santé 100% en ligne à partir de 9€/mois. Remboursements en 24h, carte vitale dématérialisée, médecin en ligne inclus.',
 'sante', 'Dès 9€/mois', 'amber', 'https://alan.com', NULL, 'Dès 9€/mois', 1),

('Livi — Téléconsultation',
 'Première téléconsultation médicale gratuite. Médecins généralistes disponibles 7j/7, ordonnances électroniques, arrêts de travail.',
 'sante', '1ère fois gratuite', 'lime', 'https://www.livi.fr', NULL, 'Gratuite', 2),

('Complémentaire Santé Solidaire',
 'Mutuelle complémentaire quasi-gratuite (moins de 1€/jour) ou entièrement gratuite sous conditions de ressources. Prend en charge ce que la Sécu ne rembourse pas.',
 'sante', 'Santé gratuite', 'lime', 'https://www.complementaire-sante-solidaire.gouv.fr', NULL, NULL, 3),

-- ── AIDES DE L'ÉTAT ──────────────────────────────────────────────────────────
('Bourse sur Critères Sociaux CROUS',
 'De 0 à 6 335€/an selon ton échelon (0 à 7) calculé sur les revenus de tes parents. Dossier Social Étudiant à remplir avant le 31 mai chaque année.',
 'aides', 'Jusqu''à 6 335€/an', 'blue', 'https://www.messervices.etudiant.gouv.fr', NULL, 'Jusqu''à 6 335€/an', 1),

('APL — Aide Personnalisée au Logement',
 'Entre 100€ et 300€/mois déduits directement de ton loyer. Versée par la CAF selon tes revenus et ta situation. Fais la simulation sur caf.fr.',
 'aides', 'Jusqu''à 300€/mois', 'blue', 'https://www.caf.fr', NULL, 'Jusqu''à 300€/mois', 2),

('Pass Culture — 300€ Crédits',
 '300€ crédits culture offerts à tes 18 ans : concerts, cinéma, livres, musées, jeux vidéo, cours de musique... Application disponible sur iOS et Android.',
 'aides', '300€ offerts', 'blue', 'https://pass.culture.fr', NULL, '300€', 3),

('Prime d''Activité',
 'Complément de revenu si tu travailles et gagnes plus de 1 117€ nets/mois. Versé par la CAF, cumulable avec les bourses. Fais la simulation en ligne.',
 'aides', 'Simuler mon droit', 'blue', 'https://www.caf.fr', NULL, NULL, 4),

('Aide au Mérite CROUS',
 '+900€/an supplémentaires pour les boursiers ayant obtenu la mention Très Bien au bac. Attribution automatique dès la première année d''études supérieures.',
 'aides', '+900€/an', 'blue', 'https://www.etudiant.gouv.fr', NULL, '+900€/an', 5),

('Aide à la Mobilité Parcoursup',
 '500€ versés si tu t''inscris dans une formation hors de ton académie de résidence via Parcoursup. Aide unique, versée en début d''année universitaire.',
 'aides', '500€', 'blue', 'https://www.etudiant.gouv.fr', NULL, '500€', 6),

('Mobili-Jeune — Action Logement',
 'De 10€ à 100€/mois d''aide au loyer pour les alternants (apprentis et contrats de professionnalisation) de moins de 30 ans. Demande en ligne simple.',
 'aides', 'Jusqu''à 100€/mois', 'blue', 'https://mobilijeune.actionlogement.fr', NULL, 'Jusqu''à 100€/mois', 7),

('Aide Spécifique Ponctuelle CROUS',
 'Jusqu''à 3 500€ en cas de difficultés financières imprévues (rupture familiale, maladie, accident...). Dossier à déposer au CROUS de ton académie.',
 'aides', 'Urgence', 'blue', 'https://www.etudiant.gouv.fr', NULL, 'Jusqu''à 3 500€', 8),

('1 Repas à 1€ au CROUS',
 'Un repas complet au restaurant universitaire pour 1€ pour les boursiers et étudiants en difficulté. Disponible dans tous les RU de France.',
 'aides', '1€ le repas', 'blue', 'https://www.etudiant.gouv.fr', NULL, NULL, 9),

('Prêt Étudiant Garanti par l''État',
 'Jusqu''à 20 000€ de prêt sans caution, sans conditions de ressources et sans garant. Garanti par l''État, remboursement après diplôme. Taux avantageux.',
 'aides', 'Sans caution', 'blue', 'https://www.etudiant.gouv.fr', NULL, 'Jusqu''à 20 000€', 10),

('Aide au Permis de Conduire — Apprentis',
 '500€ pour financer ton permis de conduire (permis B) si tu es en contrat d''apprentissage. Versée par le fonds d''assurance formation de ton secteur.',
 'aides', '500€', 'blue', 'https://www.securite-routiere.gouv.fr', NULL, '500€', 11);
