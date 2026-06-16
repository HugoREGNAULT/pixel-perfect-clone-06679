#!/usr/bin/env bash
set -e

TOKEN="${SUPABASE_MGMT_TOKEN:?SUPABASE_MGMT_TOKEN env var required}"
PROJECT="ujjpfcdcyvdliofvadul"

sql() {
  local query="$1"
  local result
  result=$(curl -s -X POST "https://api.supabase.com/v1/projects/$PROJECT/database/query" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    --data-binary "{\"query\": $(echo "$query" | jq -Rs .)}" )
  echo "$result"
}

echo "=== Batch 1 : Universités Île-de-France ==="
sql "INSERT INTO ecoles (name, type_etablissement, city, region, statut, site_web, slug) VALUES
('Université Panthéon-Assas (Paris 2)', 'Université', 'Paris', 'Île-de-France', 'public', 'https://www.u-paris2.fr', 'universite-pantheon-assas'),
('Université Sorbonne Nouvelle (Paris 3)', 'Université', 'Paris', 'Île-de-France', 'public', 'https://www.sorbonne-nouvelle.fr', 'universite-sorbonne-nouvelle'),
('Université Paris Cité', 'Université', 'Paris', 'Île-de-France', 'public', 'https://www.u-paris.fr', 'universite-paris-cite'),
('Université Paris 8 Vincennes-Saint-Denis', 'Université', 'Saint-Denis', 'Île-de-France', 'public', 'https://www.univ-paris8.fr', 'universite-paris-8'),
('Université Paris Nanterre', 'Université', 'Nanterre', 'Île-de-France', 'public', 'https://www.parisnanterre.fr', 'universite-paris-nanterre'),
('Université Paris-Saclay', 'Université', 'Gif-sur-Yvette', 'Île-de-France', 'public', 'https://www.universite-paris-saclay.fr', 'universite-paris-saclay'),
('Sorbonne Paris Nord (Paris 13)', 'Université', 'Villetaneuse', 'Île-de-France', 'public', 'https://www.univ-spn.fr', 'sorbonne-paris-nord'),
('CY Cergy Paris Université', 'Université', 'Cergy', 'Île-de-France', 'public', 'https://www.cyu.fr', 'cy-cergy-paris-universite'),
('Université Gustave Eiffel', 'Université', 'Marne-la-Vallée', 'Île-de-France', 'public', 'https://www.univ-gustave-eiffel.fr', 'universite-gustave-eiffel'),
('Université d'\''Évry Val d'\''Essonne', 'Université', 'Évry', 'Île-de-France', 'public', 'https://www.univ-evry.fr', 'universite-evry'),
('Université de Versailles Saint-Quentin-en-Yvelines', 'Université', 'Versailles', 'Île-de-France', 'public', 'https://www.uvsq.fr', 'universite-versailles-saint-quentin'),
('Université Paris-Est Créteil (UPEC)', 'Université', 'Créteil', 'Île-de-France', 'public', 'https://www.u-pec.fr', 'universite-paris-est-creteil')
ON CONFLICT (slug) DO NOTHING;"

echo "=== Batch 2 : Universités Auvergne-Rhône-Alpes ==="
sql "INSERT INTO ecoles (name, type_etablissement, city, region, statut, site_web, slug) VALUES
('Université Lumière Lyon 2', 'Université', 'Lyon', 'Auvergne-Rhône-Alpes', 'public', 'https://www.univ-lyon2.fr', 'universite-lumiere-lyon-2'),
('Université Jean Moulin Lyon 3', 'Université', 'Lyon', 'Auvergne-Rhône-Alpes', 'public', 'https://www.univ-lyon3.fr', 'universite-jean-moulin-lyon-3'),
('Université Jean Monnet Saint-Étienne', 'Université', 'Saint-Étienne', 'Auvergne-Rhône-Alpes', 'public', 'https://www.univ-st-etienne.fr', 'universite-jean-monnet-saint-etienne'),
('Université Savoie Mont Blanc', 'Université', 'Chambéry', 'Auvergne-Rhône-Alpes', 'public', 'https://www.univ-smb.fr', 'universite-savoie-mont-blanc'),
('Université Grenoble Alpes', 'Université', 'Grenoble', 'Auvergne-Rhône-Alpes', 'public', 'https://www.univ-grenoble-alpes.fr', 'universite-grenoble-alpes'),
('Université Clermont Auvergne', 'Université', 'Clermont-Ferrand', 'Auvergne-Rhône-Alpes', 'public', 'https://www.uca.fr', 'universite-clermont-auvergne')
ON CONFLICT (slug) DO NOTHING;"

echo "=== Batch 3 : Universités Normandie + Bretagne + Pays de la Loire ==="
sql "INSERT INTO ecoles (name, type_etablissement, city, region, statut, site_web, slug) VALUES
('Université de Caen Normandie', 'Université', 'Caen', 'Normandie', 'public', 'https://www.unicaen.fr', 'universite-caen-normandie'),
('Université de Rouen Normandie', 'Université', 'Rouen', 'Normandie', 'public', 'https://www.univ-rouen.fr', 'universite-rouen-normandie'),
('Université Le Havre Normandie', 'Université', 'Le Havre', 'Normandie', 'public', 'https://www.univ-lehavre.fr', 'universite-le-havre-normandie'),
('Université Rennes 2', 'Université', 'Rennes', 'Bretagne', 'public', 'https://www.univ-rennes2.fr', 'universite-rennes-2'),
('Université de Bretagne Occidentale', 'Université', 'Brest', 'Bretagne', 'public', 'https://www.univ-brest.fr', 'universite-bretagne-occidentale'),
('Université Bretagne Sud', 'Université', 'Lorient', 'Bretagne', 'public', 'https://www.univ-ubs.fr', 'universite-bretagne-sud'),
('Université de Nantes', 'Université', 'Nantes', 'Pays de la Loire', 'public', 'https://www.univ-nantes.fr', 'universite-nantes'),
('Le Mans Université', 'Université', 'Le Mans', 'Pays de la Loire', 'public', 'https://www.univ-lemans.fr', 'universite-le-mans'),
('Université d'\''Angers', 'Université', 'Angers', 'Pays de la Loire', 'public', 'https://www.univ-angers.fr', 'universite-angers')
ON CONFLICT (slug) DO NOTHING;"

echo "=== Batch 4 : Universités Nouvelle-Aquitaine + Occitanie ==="
sql "INSERT INTO ecoles (name, type_etablissement, city, region, statut, site_web, slug) VALUES
('Université Bordeaux Montaigne', 'Université', 'Bordeaux', 'Nouvelle-Aquitaine', 'public', 'https://www.u-bordeaux-montaigne.fr', 'universite-bordeaux-montaigne'),
('Université de Pau et des Pays de l'\''Adour', 'Université', 'Pau', 'Nouvelle-Aquitaine', 'public', 'https://www.univ-pau.fr', 'universite-pau-pays-adour'),
('Université de Poitiers', 'Université', 'Poitiers', 'Nouvelle-Aquitaine', 'public', 'https://www.univ-poitiers.fr', 'universite-poitiers'),
('Université de La Rochelle', 'Université', 'La Rochelle', 'Nouvelle-Aquitaine', 'public', 'https://www.univ-larochelle.fr', 'universite-la-rochelle'),
('Université de Limoges', 'Université', 'Limoges', 'Nouvelle-Aquitaine', 'public', 'https://www.unilim.fr', 'universite-limoges'),
('Université Paul-Valéry Montpellier 3', 'Université', 'Montpellier', 'Occitanie', 'public', 'https://www.univ-montp3.fr', 'universite-paul-valery-montpellier-3'),
('Université de Perpignan Via Domitia', 'Université', 'Perpignan', 'Occitanie', 'public', 'https://www.univ-perp.fr', 'universite-perpignan'),
('Université Toulouse 1 Capitole', 'Université', 'Toulouse', 'Occitanie', 'public', 'https://www.ut-capitole.fr', 'universite-toulouse-1-capitole'),
('Université Toulouse 2 Jean Jaurès', 'Université', 'Toulouse', 'Occitanie', 'public', 'https://www.univ-tlse2.fr', 'universite-toulouse-2-jean-jaures'),
('Université Toulouse 3 Paul Sabatier', 'Université', 'Toulouse', 'Occitanie', 'public', 'https://www.univ-tlse3.fr', 'universite-toulouse-3-paul-sabatier'),
('Université de Nîmes', 'Université', 'Nîmes', 'Occitanie', 'public', 'https://www.unimes.fr', 'universite-nimes')
ON CONFLICT (slug) DO NOTHING;"

echo "=== Batch 5 : Universités PACA + Grand Est + Hauts-de-France ==="
sql "INSERT INTO ecoles (name, type_etablissement, city, region, statut, site_web, slug) VALUES
('Université de Toulon', 'Université', 'Toulon', 'Provence-Alpes-Côte d'\''Azur', 'public', 'https://www.univ-tln.fr', 'universite-toulon'),
('Université Côte d'\''Azur', 'Université', 'Nice', 'Provence-Alpes-Côte d'\''Azur', 'public', 'https://univ-cotedazur.fr', 'universite-cote-azur'),
('Université d'\''Avignon', 'Université', 'Avignon', 'Provence-Alpes-Côte d'\''Azur', 'public', 'https://www.univ-avignon.fr', 'universite-avignon'),
('Université de Haute-Alsace', 'Université', 'Mulhouse', 'Grand Est', 'public', 'https://www.uha.fr', 'universite-haute-alsace'),
('Université de Lorraine', 'Université', 'Nancy', 'Grand Est', 'public', 'https://www.univ-lorraine.fr', 'universite-lorraine'),
('Université de Reims Champagne-Ardenne', 'Université', 'Reims', 'Grand Est', 'public', 'https://www.univ-reims.fr', 'universite-reims-champagne-ardenne'),
('Université de Lille', 'Université', 'Lille', 'Hauts-de-France', 'public', 'https://www.univ-lille.fr', 'universite-lille'),
('Université du Littoral Côte d'\''Opale', 'Université', 'Dunkerque', 'Hauts-de-France', 'public', 'https://www.univ-littoral.fr', 'universite-littoral-cote-opale'),
('Université d'\''Artois', 'Université', 'Arras', 'Hauts-de-France', 'public', 'https://www.univ-artois.fr', 'universite-artois'),
('Université Polytechnique Hauts-de-France', 'Université', 'Valenciennes', 'Hauts-de-France', 'public', 'https://www.uphf.fr', 'universite-polytechnique-hauts-de-france'),
('Université de Picardie Jules Verne', 'Université', 'Amiens', 'Hauts-de-France', 'public', 'https://www.u-picardie.fr', 'universite-picardie-jules-verne')
ON CONFLICT (slug) DO NOTHING;"

echo "=== Batch 6 : Universités Bourgogne + Centre + DOM-TOM + Corse ==="
sql "INSERT INTO ecoles (name, type_etablissement, city, region, statut, site_web, slug) VALUES
('Université de Bourgogne', 'Université', 'Dijon', 'Bourgogne-Franche-Comté', 'public', 'https://www.u-bourgogne.fr', 'universite-bourgogne'),
('Université de Franche-Comté', 'Université', 'Besançon', 'Bourgogne-Franche-Comté', 'public', 'https://www.univ-fcomte.fr', 'universite-franche-comte'),
('Université de Tours', 'Université', 'Tours', 'Centre-Val de Loire', 'public', 'https://www.univ-tours.fr', 'universite-tours'),
('Université d'\''Orléans', 'Université', 'Orléans', 'Centre-Val de Loire', 'public', 'https://www.univ-orleans.fr', 'universite-orleans'),
('Université des Antilles', 'Université', 'Pointe-à-Pitre', 'Guadeloupe', 'public', 'https://www.univ-antilles.fr', 'universite-antilles'),
('Université de La Réunion', 'Université', 'Saint-Denis', 'La Réunion', 'public', 'https://www.univ-reunion.fr', 'universite-reunion'),
('Université de la Guyane', 'Université', 'Cayenne', 'Guyane', 'public', 'https://www.univ-guyane.fr', 'universite-guyane'),
('Université de Corse Pasquale Paoli', 'Université', 'Corte', 'Corse', 'public', 'https://www.universita.corsica', 'universite-corse')
ON CONFLICT (slug) DO NOTHING;"

echo "=== Batch 7 : Grandes écoles d'\''ingénieurs — top tier ==="
sql "INSERT INTO ecoles (name, type_etablissement, city, region, statut, site_web, slug) VALUES
('MINES ParisTech — PSL', 'École d'\''ingénieurs', 'Paris', 'Île-de-France', 'public', 'https://www.minesparis.psl.eu', 'mines-paristech'),
('École des Ponts ParisTech', 'École d'\''ingénieurs', 'Marne-la-Vallée', 'Île-de-France', 'public', 'https://www.ecoledesponts.fr', 'ecole-ponts-paristech'),
('ENSTA Paris', 'École d'\''ingénieurs', 'Palaiseau', 'Île-de-France', 'public', 'https://www.ensta-paris.fr', 'ensta-paris'),
('Télécom Paris', 'École d'\''ingénieurs', 'Palaiseau', 'Île-de-France', 'public', 'https://www.telecom-paris.fr', 'telecom-paris'),
('Télécom SudParis', 'École d'\''ingénieurs', 'Évry', 'Île-de-France', 'public', 'https://www.telecom-sudparis.eu', 'telecom-sudparis'),
('AgroParisTech', 'École d'\''ingénieurs', 'Palaiseau', 'Île-de-France', 'public', 'https://www.agroparistech.fr', 'agroparistech'),
('ENSAE Paris', 'École d'\''ingénieurs', 'Palaiseau', 'Île-de-France', 'public', 'https://www.ensae.fr', 'ensae-paris'),
('ISAE-SUPAERO', 'École d'\''ingénieurs', 'Toulouse', 'Occitanie', 'public', 'https://www.isae-supaero.fr', 'isae-supaero'),
('École Centrale de Lyon', 'École d'\''ingénieurs', 'Écully', 'Auvergne-Rhône-Alpes', 'public', 'https://www.ec-lyon.fr', 'ecole-centrale-lyon'),
('École Centrale de Nantes', 'École d'\''ingénieurs', 'Nantes', 'Pays de la Loire', 'public', 'https://www.ec-nantes.fr', 'ecole-centrale-nantes'),
('Centrale Lille Institut', 'École d'\''ingénieurs', 'Villeneuve-d'\''Ascq', 'Hauts-de-France', 'public', 'https://centralelille.fr', 'centrale-lille'),
('Centrale Méditerranée', 'École d'\''ingénieurs', 'Marseille', 'Provence-Alpes-Côte d'\''Azur', 'public', 'https://www.centrale-mediterranee.fr', 'centrale-mediterranee'),
('IMT Atlantique', 'École d'\''ingénieurs', 'Brest', 'Bretagne', 'public', 'https://www.imt-atlantique.fr', 'imt-atlantique')
ON CONFLICT (slug) DO NOTHING;"

echo "=== Batch 8 : Grandes écoles d'\''ingénieurs — INSA + INP ==="
sql "INSERT INTO ecoles (name, type_etablissement, city, region, statut, site_web, slug) VALUES
('INSA Toulouse', 'École d'\''ingénieurs', 'Toulouse', 'Occitanie', 'public', 'https://www.insa-toulouse.fr', 'insa-toulouse'),
('INSA Rennes', 'École d'\''ingénieurs', 'Rennes', 'Bretagne', 'public', 'https://www.insa-rennes.fr', 'insa-rennes'),
('INSA Rouen Normandie', 'École d'\''ingénieurs', 'Saint-Étienne-du-Rouvray', 'Normandie', 'public', 'https://www.insa-rouen.fr', 'insa-rouen'),
('INSA Strasbourg', 'École d'\''ingénieurs', 'Strasbourg', 'Grand Est', 'public', 'https://www.insa-strasbourg.fr', 'insa-strasbourg'),
('INSA Centre Val de Loire', 'École d'\''ingénieurs', 'Bourges', 'Centre-Val de Loire', 'public', 'https://www.insa-centrevaldeloire.fr', 'insa-centre-val-de-loire'),
('Grenoble INP - UGA', 'École d'\''ingénieurs', 'Grenoble', 'Auvergne-Rhône-Alpes', 'public', 'https://www.grenoble-inp.fr', 'grenoble-inp'),
('Bordeaux INP', 'École d'\''ingénieurs', 'Bordeaux', 'Nouvelle-Aquitaine', 'public', 'https://www.bordeaux-inp.fr', 'bordeaux-inp'),
('INP Toulouse', 'École d'\''ingénieurs', 'Toulouse', 'Occitanie', 'public', 'https://www.inp-toulouse.fr', 'inp-toulouse'),
('Université de Technologie de Troyes (UTT)', 'École d'\''ingénieurs', 'Troyes', 'Grand Est', 'public', 'https://www.utt.fr', 'utt-troyes'),
('Université de Technologie de Compiègne (UTC)', 'École d'\''ingénieurs', 'Compiègne', 'Hauts-de-France', 'public', 'https://www.utc.fr', 'utc-compiegne'),
('Université de Technologie de Belfort-Montbéliard (UTBM)', 'École d'\''ingénieurs', 'Belfort', 'Bourgogne-Franche-Comté', 'public', 'https://www.utbm.fr', 'utbm-belfort'),
('Mines Saint-Étienne', 'École d'\''ingénieurs', 'Saint-Étienne', 'Auvergne-Rhône-Alpes', 'public', 'https://www.mines-stetienne.fr', 'mines-saint-etienne'),
('Mines Nancy', 'École d'\''ingénieurs', 'Nancy', 'Grand Est', 'public', 'https://mines-nancy.univ-lorraine.fr', 'mines-nancy'),
('IMT Nord Europe', 'École d'\''ingénieurs', 'Douai', 'Hauts-de-France', 'public', 'https://imt-nord-europe.fr', 'imt-nord-europe'),
('IMT Mines Albi', 'École d'\''ingénieurs', 'Albi', 'Occitanie', 'public', 'https://www.imt-mines-albi.fr', 'imt-mines-albi'),
('IMT Mines Alès', 'École d'\''ingénieurs', 'Alès', 'Occitanie', 'public', 'https://www.mines-ales.fr', 'imt-mines-ales'),
('ENSTA Bretagne', 'École d'\''ingénieurs', 'Brest', 'Bretagne', 'public', 'https://www.ensta-bretagne.fr', 'ensta-bretagne')
ON CONFLICT (slug) DO NOTHING;"

echo "=== Batch 9 : Grandes écoles d'\''ingénieurs — privées et généralistes ==="
sql "INSERT INTO ecoles (name, type_etablissement, city, region, statut, site_web, slug) VALUES
('EPITA', 'École d'\''ingénieurs', 'Le Kremlin-Bicêtre', 'Île-de-France', 'privé', 'https://www.epita.fr', 'epita'),
('ECE Paris', 'École d'\''ingénieurs', 'Paris', 'Île-de-France', 'privé', 'https://www.ece.fr', 'ece-paris'),
('EFREI Paris', 'École d'\''ingénieurs', 'Villejuif', 'Île-de-France', 'privé', 'https://www.efrei.fr', 'efrei-paris'),
('ESIEE Paris', 'École d'\''ingénieurs', 'Noisy-le-Grand', 'Île-de-France', 'public', 'https://www.esiee.fr', 'esiee-paris'),
('ISEP', 'École d'\''ingénieurs', 'Paris', 'Île-de-France', 'privé', 'https://www.isep.fr', 'isep-paris'),
('EPF École d'\''Ingénieurs', 'École d'\''ingénieurs', 'Cachan', 'Île-de-France', 'privé', 'https://www.epf.fr', 'epf-ecole-ingenieurs'),
('ESTP Paris', 'École d'\''ingénieurs', 'Cachan', 'Île-de-France', 'privé', 'https://www.estp.fr', 'estp-paris'),
('CY Tech', 'École d'\''ingénieurs', 'Cergy', 'Île-de-France', 'privé', 'https://www.cytech.cyu.fr', 'cy-tech'),
('ENIB', 'École d'\''ingénieurs', 'Brest', 'Bretagne', 'public', 'https://www.enib.fr', 'enib-brest'),
('CNAM', 'École d'\''ingénieurs', 'Paris', 'Île-de-France', 'public', 'https://www.cnam.fr', 'cnam'),
('RUBIKA', 'École d'\''ingénieurs', 'Valenciennes', 'Hauts-de-France', 'privé', 'https://www.rubika.fr', 'rubika'),
('Polytech Lyon', 'École d'\''ingénieurs', 'Villeurbanne', 'Auvergne-Rhône-Alpes', 'public', 'https://polytech.univ-lyon1.fr', 'polytech-lyon'),
('Polytech Nice Sophia', 'École d'\''ingénieurs', 'Nice', 'Provence-Alpes-Côte d'\''Azur', 'public', 'https://polytech.unice.fr', 'polytech-nice'),
('Polytech Montpellier', 'École d'\''ingénieurs', 'Montpellier', 'Occitanie', 'public', 'https://www.polytech.umontpellier.fr', 'polytech-montpellier'),
('Polytech Clermont', 'École d'\''ingénieurs', 'Clermont-Ferrand', 'Auvergne-Rhône-Alpes', 'public', 'https://polytech.uca.fr', 'polytech-clermont'),
('Polytech Nantes', 'École d'\''ingénieurs', 'Nantes', 'Pays de la Loire', 'public', 'https://polytech.univ-nantes.fr', 'polytech-nantes'),
('Polytech Bordeaux', 'École d'\''ingénieurs', 'Talence', 'Nouvelle-Aquitaine', 'public', 'https://www.polytech-bordeaux.fr', 'polytech-bordeaux'),
('Polytech Grenoble', 'École d'\''ingénieurs', 'Grenoble', 'Auvergne-Rhône-Alpes', 'public', 'https://www.polytech-grenoble.fr', 'polytech-grenoble'),
('Polytech Tours', 'École d'\''ingénieurs', 'Tours', 'Centre-Val de Loire', 'public', 'https://polytech.univ-tours.fr', 'polytech-tours'),
('Polytech Annecy-Chambéry', 'École d'\''ingénieurs', 'Annecy', 'Auvergne-Rhône-Alpes', 'public', 'https://www.polytech.univ-smb.fr', 'polytech-annecy-chambery')
ON CONFLICT (slug) DO NOTHING;"

echo "=== Batch 10 : Grandes écoles de commerce ==="
sql "INSERT INTO ecoles (name, type_etablissement, city, region, statut, site_web, slug) VALUES
('NEOMA Business School', 'École de commerce et de gestion', 'Reims', 'Grand Est', 'privé', 'https://www.neoma-bs.fr', 'neoma-business-school'),
('Audencia Nantes', 'École de commerce et de gestion', 'Nantes', 'Pays de la Loire', 'privé', 'https://www.audencia.com', 'audencia-nantes'),
('ICN Business School', 'École de commerce et de gestion', 'Nancy', 'Grand Est', 'privé', 'https://www.icn-artem.com', 'icn-business-school'),
('IESEG School of Management', 'École de commerce et de gestion', 'Lille', 'Hauts-de-France', 'privé', 'https://www.ieseg.fr', 'ieseg-school-of-management'),
('BSB Burgundy School of Business', 'École de commerce et de gestion', 'Dijon', 'Bourgogne-Franche-Comté', 'privé', 'https://www.bsb-education.com', 'bsb-burgundy-school-of-business'),
('Montpellier Business School', 'École de commerce et de gestion', 'Montpellier', 'Occitanie', 'privé', 'https://www.montpellier-bs.com', 'montpellier-business-school'),
('TBS Education', 'École de commerce et de gestion', 'Toulouse', 'Occitanie', 'privé', 'https://www.tbs-education.fr', 'tbs-education'),
('Excelia Group', 'École de commerce et de gestion', 'La Rochelle', 'Nouvelle-Aquitaine', 'privé', 'https://www.excelia-group.com', 'excelia-group'),
('IPAG Business School', 'École de commerce et de gestion', 'Paris', 'Île-de-France', 'privé', 'https://www.ipag.fr', 'ipag-business-school'),
('ISC Paris', 'École de commerce et de gestion', 'Paris', 'Île-de-France', 'privé', 'https://www.iscparis.com', 'isc-paris'),
('Paris School of Business', 'École de commerce et de gestion', 'Paris', 'Île-de-France', 'privé', 'https://www.psbedu.paris', 'paris-school-of-business'),
('EBS Paris', 'École de commerce et de gestion', 'Paris', 'Île-de-France', 'privé', 'https://www.ebs-paris.com', 'ebs-paris'),
('ESG Management School', 'École de commerce et de gestion', 'Paris', 'Île-de-France', 'privé', 'https://www.esgms.fr', 'esg-management-school'),
('INSEEC Grande École', 'École de commerce et de gestion', 'Paris', 'Île-de-France', 'privé', 'https://www.inseec.com', 'inseec-grande-ecole'),
('ESDES Lyon', 'École de commerce et de gestion', 'Lyon', 'Auvergne-Rhône-Alpes', 'privé', 'https://www.esdes.fr', 'esdes-lyon')
ON CONFLICT (slug) DO NOTHING;"

echo "=== Batch 11 : IEP / Sciences Po régionaux ==="
sql "INSERT INTO ecoles (name, type_etablissement, city, region, statut, site_web, slug) VALUES
('Sciences Po Bordeaux', 'Institut d'\''études politiques', 'Bordeaux', 'Nouvelle-Aquitaine', 'public', 'https://www.sciencespobordeaux.fr', 'sciences-po-bordeaux'),
('Sciences Po Grenoble', 'Institut d'\''études politiques', 'Grenoble', 'Auvergne-Rhône-Alpes', 'public', 'https://www.sciencespo-grenoble.fr', 'sciences-po-grenoble'),
('Sciences Po Lyon', 'Institut d'\''études politiques', 'Lyon', 'Auvergne-Rhône-Alpes', 'public', 'https://www.sciencespo-lyon.fr', 'sciences-po-lyon'),
('Sciences Po Rennes', 'Institut d'\''études politiques', 'Rennes', 'Bretagne', 'public', 'https://www.sciencespo-rennes.fr', 'sciences-po-rennes'),
('Sciences Po Toulouse', 'Institut d'\''études politiques', 'Toulouse', 'Occitanie', 'public', 'https://www.sciencespo-toulouse.fr', 'sciences-po-toulouse'),
('Sciences Po Aix', 'Institut d'\''études politiques', 'Aix-en-Provence', 'Provence-Alpes-Côte d'\''Azur', 'public', 'https://www.sciencespo-aix.fr', 'sciences-po-aix'),
('Sciences Po Lille', 'Institut d'\''études politiques', 'Lille', 'Hauts-de-France', 'public', 'https://www.sciencespo-lille.eu', 'sciences-po-lille'),
('Sciences Po Strasbourg', 'Institut d'\''études politiques', 'Strasbourg', 'Grand Est', 'public', 'https://www.iep-strasbourg.fr', 'sciences-po-strasbourg'),
('Sciences Po Saint-Germain-en-Laye', 'Institut d'\''études politiques', 'Saint-Germain-en-Laye', 'Île-de-France', 'public', 'https://www.sciencespo-saintgermainenlaye.fr', 'sciences-po-saint-germain')
ON CONFLICT (slug) DO NOTHING;"

echo "=== Batch 12 : ENS + grandes écoles spécialisées ==="
sql "INSERT INTO ecoles (name, type_etablissement, city, region, statut, site_web, slug) VALUES
('ENS Paris-Saclay', 'École normale supérieure', 'Gif-sur-Yvette', 'Île-de-France', 'public', 'https://ens-paris-saclay.fr', 'ens-paris-saclay'),
('ENS de Lyon', 'École normale supérieure', 'Lyon', 'Auvergne-Rhône-Alpes', 'public', 'https://www.ens-lyon.fr', 'ens-lyon'),
('ENS Rennes', 'École normale supérieure', 'Rennes', 'Bretagne', 'public', 'https://www.ens-rennes.fr', 'ens-rennes'),
('INSP (Institut National du Service Public)', 'Établissement spécialisé', 'Strasbourg', 'Grand Est', 'public', 'https://www.insp.gouv.fr', 'insp-institut-national-service-public'),
('INET (Institut national des études territoriales)', 'Établissement spécialisé', 'Strasbourg', 'Grand Est', 'public', 'https://www.inet.cnfpt.fr', 'inet-etudes-territoriales'),
('Sciences Po Paris — Collège universitaire', 'Institut d'\''études politiques', 'Reims', 'Grand Est', 'public', 'https://www.sciencespo.fr', 'sciences-po-paris-reims'),
('Université Paris Panthéon-Assas (droit)', 'Université', 'Paris', 'Île-de-France', 'public', 'https://www.u-paris2.fr', 'universite-paris-2-assas-droit')
ON CONFLICT (slug) DO NOTHING;"

echo "=== Batch 13 : Écoles d'\''art et de design ==="
sql "INSERT INTO ecoles (name, type_etablissement, city, region, statut, site_web, slug) VALUES
('École nationale supérieure des Beaux-Arts (ENSBA)', 'École d'\''art et de design', 'Paris', 'Île-de-France', 'public', 'https://www.beauxartsparis.fr', 'ensba-paris'),
('École nationale supérieure des Arts Décoratifs (ENSAD)', 'École d'\''art et de design', 'Paris', 'Île-de-France', 'public', 'https://www.ensad.fr', 'ensad-paris'),
('Gobelins — l'\''école de l'\''image', 'École d'\''art et de design', 'Paris', 'Île-de-France', 'public', 'https://www.gobelins.fr', 'gobelins'),
('École Duperré', 'École d'\''art et de design', 'Paris', 'Île-de-France', 'public', 'https://www.ecole-duperre.fr', 'ecole-duperre'),
('École Estienne', 'École d'\''art et de design', 'Paris', 'Île-de-France', 'public', 'https://www.ecole-estienne.paris', 'ecole-estienne'),
('École Boulle', 'École d'\''art et de design', 'Paris', 'Île-de-France', 'public', 'https://www.ecole-boulle.org', 'ecole-boulle'),
('Penninghen', 'École d'\''art et de design', 'Paris', 'Île-de-France', 'privé', 'https://www.penninghen.fr', 'penninghen'),
('HEAR — Haute École des Arts du Rhin', 'École d'\''art et de design', 'Strasbourg', 'Grand Est', 'public', 'https://www.hear.fr', 'hear-strasbourg'),
('ESAD Reims', 'École d'\''art et de design', 'Reims', 'Grand Est', 'public', 'https://www.esad-reims.fr', 'esad-reims'),
('EBABX — École des Beaux-Arts de Bordeaux', 'École d'\''art et de design', 'Bordeaux', 'Nouvelle-Aquitaine', 'public', 'https://www.ebabx.fr', 'ebabx-bordeaux'),
('ISBA Besançon', 'École d'\''art et de design', 'Besançon', 'Bourgogne-Franche-Comté', 'public', 'https://www.isba-besancon.fr', 'isba-besancon'),
('École supérieure d'\''art d'\''Aix-en-Provence', 'École d'\''art et de design', 'Aix-en-Provence', 'Provence-Alpes-Côte d'\''Azur', 'public', 'https://www.esaaix.fr', 'esa-aix-en-provence'),
('ESMOD Paris', 'École d'\''art et de design', 'Paris', 'Île-de-France', 'privé', 'https://www.esmod.com', 'esmod-paris'),
('LISAA Paris', 'École d'\''art et de design', 'Paris', 'Île-de-France', 'privé', 'https://www.lisaa.com', 'lisaa-paris'),
('ICAN — Creative Digital Arts', 'École d'\''art et de design', 'Paris', 'Île-de-France', 'privé', 'https://www.ican.fr', 'ican-paris')
ON CONFLICT (slug) DO NOTHING;"

echo "=== Batch 14 : Écoles nationales supérieures d'\''architecture ==="
sql "INSERT INTO ecoles (name, type_etablissement, city, region, statut, site_web, slug) VALUES
('ENSA Paris-Belleville', 'École d'\''architecture', 'Paris', 'Île-de-France', 'public', 'https://www.paris-belleville.archi.fr', 'ensa-paris-belleville'),
('ENSA Paris La Villette', 'École d'\''architecture', 'Paris', 'Île-de-France', 'public', 'https://www.paris-lavillette.archi.fr', 'ensa-paris-lavillette'),
('ENSA Paris Val de Seine', 'École d'\''architecture', 'Paris', 'Île-de-France', 'public', 'https://www.paris-valdeseine.archi.fr', 'ensa-paris-val-de-seine'),
('ENSA Paris-Malaquais', 'École d'\''architecture', 'Paris', 'Île-de-France', 'public', 'https://www.paris-malaquais.archi.fr', 'ensa-paris-malaquais'),
('ENSA Versailles', 'École d'\''architecture', 'Versailles', 'Île-de-France', 'public', 'https://www.versailles.archi.fr', 'ensa-versailles'),
('ENSA Lyon', 'École d'\''architecture', 'Lyon', 'Auvergne-Rhône-Alpes', 'public', 'https://www.lyon.archi.fr', 'ensa-lyon'),
('ENSA Bordeaux', 'École d'\''architecture', 'Bordeaux', 'Nouvelle-Aquitaine', 'public', 'https://www.bordeaux.archi.fr', 'ensa-bordeaux'),
('ENSA Nantes', 'École d'\''architecture', 'Nantes', 'Pays de la Loire', 'public', 'https://www.nantes.archi.fr', 'ensa-nantes'),
('ENSA Marseille', 'École d'\''architecture', 'Marseille', 'Provence-Alpes-Côte d'\''Azur', 'public', 'https://www.marseille.archi.fr', 'ensa-marseille'),
('ENSA Toulouse', 'École d'\''architecture', 'Toulouse', 'Occitanie', 'public', 'https://www.toulouse.archi.fr', 'ensa-toulouse'),
('ENSA Grenoble', 'École d'\''architecture', 'Grenoble', 'Auvergne-Rhône-Alpes', 'public', 'https://www.grenoble.archi.fr', 'ensa-grenoble'),
('ENSA Strasbourg', 'École d'\''architecture', 'Strasbourg', 'Grand Est', 'public', 'https://www.strasbourg.archi.fr', 'ensa-strasbourg'),
('ENSA Lille', 'École d'\''architecture', 'Villeneuve-d'\''Ascq', 'Hauts-de-France', 'public', 'https://www.lille.archi.fr', 'ensa-lille'),
('ENSA Clermont-Ferrand', 'École d'\''architecture', 'Clermont-Ferrand', 'Auvergne-Rhône-Alpes', 'public', 'https://www.clermont-ferrand.archi.fr', 'ensa-clermont-ferrand'),
('ENSA Nancy', 'École d'\''architecture', 'Nancy', 'Grand Est', 'public', 'https://www.nancy.archi.fr', 'ensa-nancy'),
('ENSA Bretagne', 'École d'\''architecture', 'Rennes', 'Bretagne', 'public', 'https://www.rennes.archi.fr', 'ensa-bretagne'),
('ENSA Montpellier', 'École d'\''architecture', 'Montpellier', 'Occitanie', 'public', 'https://www.montpellier.archi.fr', 'ensa-montpellier'),
('ENSA Nice', 'École d'\''architecture', 'Nice', 'Provence-Alpes-Côte d'\''Azur', 'public', 'https://www.nice.archi.fr', 'ensa-nice'),
('ENSA Normandie', 'École d'\''architecture', 'Darnétal', 'Normandie', 'public', 'https://www.rouen.archi.fr', 'ensa-normandie'),
('ENSA Saint-Étienne', 'École d'\''architecture', 'Saint-Étienne', 'Auvergne-Rhône-Alpes', 'public', 'https://www.saint-etienne.archi.fr', 'ensa-saint-etienne')
ON CONFLICT (slug) DO NOTHING;"

echo "=== Batch 15 : Lycées CPGE (prépa) ==="
sql "INSERT INTO ecoles (name, type_etablissement, city, region, statut, site_web, slug) VALUES
('Lycée Louis-le-Grand (CPGE)', 'Classe préparatoire', 'Paris', 'Île-de-France', 'public', 'https://www.louislegrand.fr', 'lycee-louis-le-grand-cpge'),
('Lycée Henri-IV (CPGE)', 'Classe préparatoire', 'Paris', 'Île-de-France', 'public', 'https://www.lyceehenri4.fr', 'lycee-henri-iv-cpge'),
('Lycée Sainte-Geneviève (Ginette)', 'Classe préparatoire', 'Versailles', 'Île-de-France', 'privé', 'https://www.bginette.com', 'lycee-sainte-genevieve-ginette'),
('Lycée Stanislas Paris (CPGE)', 'Classe préparatoire', 'Paris', 'Île-de-France', 'privé', 'https://www.stanislas.fr', 'lycee-stanislas-paris-cpge'),
('Lycée du Parc Lyon (CPGE)', 'Classe préparatoire', 'Lyon', 'Auvergne-Rhône-Alpes', 'public', 'https://www.lyceeduparc.fr', 'lycee-du-parc-lyon'),
('Lycée Pierre de Fermat (CPGE)', 'Classe préparatoire', 'Toulouse', 'Occitanie', 'public', 'https://www.fermat.fr', 'lycee-pierre-de-fermat'),
('Lycée Chaptal (CPGE)', 'Classe préparatoire', 'Paris', 'Île-de-France', 'public', 'https://www.lycee-chaptal.fr', 'lycee-chaptal'),
('Lycée Hoche Versailles (CPGE)', 'Classe préparatoire', 'Versailles', 'Île-de-France', 'public', 'https://www.lyceehoche.fr', 'lycee-hoche-versailles'),
('Lycée Faidherbe Lille (CPGE)', 'Classe préparatoire', 'Lille', 'Hauts-de-France', 'public', 'https://www.lycee-faidherbe.fr', 'lycee-faidherbe-lille'),
('Lycée Thiers Marseille (CPGE)', 'Classe préparatoire', 'Marseille', 'Provence-Alpes-Côte d'\''Azur', 'public', 'https://www.lycee-thiers.fr', 'lycee-thiers-marseille')
ON CONFLICT (slug) DO NOTHING;"

echo "=== Batch 16 : Établissements de santé et spécialisés ==="
sql "INSERT INTO ecoles (name, type_etablissement, city, region, statut, site_web, slug) VALUES
('EHESP — École des hautes études en santé publique', 'Établissement spécialisé', 'Rennes', 'Bretagne', 'public', 'https://www.ehesp.fr', 'ehesp'),
('Institut Pasteur', 'Établissement spécialisé', 'Paris', 'Île-de-France', 'public', 'https://www.pasteur.fr', 'institut-pasteur'),
('École nationale vétérinaire d'\''Alfort (EnvA)', 'Établissement spécialisé', 'Maisons-Alfort', 'Île-de-France', 'public', 'https://www.vet-alfort.fr', 'enva-alfort'),
('VetAgro Sup', 'Établissement spécialisé', 'Marcy-l'\''Étoile', 'Auvergne-Rhône-Alpes', 'public', 'https://www.vetagro-sup.fr', 'vetagro-sup'),
('ONIRIS — École nationale vétérinaire Nantes', 'Établissement spécialisé', 'Nantes', 'Pays de la Loire', 'public', 'https://www.oniris-nantes.fr', 'oniris-nantes'),
('ENVT — École nationale vétérinaire de Toulouse', 'Établissement spécialisé', 'Toulouse', 'Occitanie', 'public', 'https://www.envt.fr', 'envt-toulouse'),
('IFSI AP-HP (soins infirmiers)', 'Établissement spécialisé', 'Paris', 'Île-de-France', 'public', 'https://www.aphp.fr', 'ifsi-aphp'),
('Conservatoire national supérieur d'\''art dramatique (CNSAD)', 'Établissement spécialisé', 'Paris', 'Île-de-France', 'public', 'https://www.cnsad.fr', 'cnsad-paris'),
('Conservatoire national supérieur de musique et de danse de Paris (CNSMDP)', 'Établissement spécialisé', 'Paris', 'Île-de-France', 'public', 'https://www.conservatoiredeparis.fr', 'cnsmdp-paris'),
('Conservatoire national supérieur de musique et de danse de Lyon (CNSMDL)', 'Établissement spécialisé', 'Lyon', 'Auvergne-Rhône-Alpes', 'public', 'https://www.cnsmd-lyon.fr', 'cnsmdl-lyon'),
('La Fémis — École nationale supérieure des métiers de l'\''image et du son', 'Établissement spécialisé', 'Paris', 'Île-de-France', 'public', 'https://www.femis.fr', 'la-femis'),
('INSEP — Institut national du sport', 'Établissement spécialisé', 'Paris', 'Île-de-France', 'public', 'https://www.insep.fr', 'insep'),
('Strate — École de Design', 'École d'\''art et de design', 'Sèvres', 'Île-de-France', 'privé', 'https://www.strate.design', 'strate-ecole-design'),
('ECV — École de Communication Visuelle', 'École d'\''art et de design', 'Paris', 'Île-de-France', 'privé', 'https://www.ecv.fr', 'ecv-paris')
ON CONFLICT (slug) DO NOTHING;"

echo ""
echo "=== Résultat final ==="
curl -s -X POST "https://api.supabase.com/v1/projects/$PROJECT/database/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT type_etablissement, COUNT(*) as total FROM ecoles GROUP BY type_etablissement ORDER BY total DESC;"}' | jq -r '.[] | "\(.total)\t\(.type_etablissement)"'
