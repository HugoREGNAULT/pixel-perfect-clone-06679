#!/usr/bin/env python3
import json, urllib.request, sys

import os
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
if not SERVICE_KEY:
    print("Error: missing SUPABASE_SERVICE_KEY env var", file=sys.stderr); sys.exit(1)
PROJECT = "ujjpfcdcyvdliofvadul"
BASE_URL = f"https://{PROJECT}.supabase.co/rest/v1"

def run_sql(query):
    """Run SQL via Management API for SELECT queries."""
    mgmt_token = os.environ.get("SUPABASE_MGMT_TOKEN", "")
    data = json.dumps({"query": query}).encode()
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{PROJECT}/database/query",
        data=data,
        headers={"Authorization": f"Bearer {mgmt_token}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except Exception as e:
        return []

TYPE_MAP = {
    "Université": "Université",
    "Classe préparatoire": "Lycée",
}

def broad_type(type_etab):
    return TYPE_MAP.get(type_etab, "Grande école")

def insert_batch(rows):
    """Insert rows via PostgREST REST API."""
    payload = []
    for r in rows:
        payload.append({
            "name": r["name"],
            "type": broad_type(r["type"]),
            "type_etablissement": r["type"],
            "city": r["city"],
            "region": r["region"],
            "statut": r["statut"],
            "site_web": r.get("site_web", ""),
            "slug": r["slug"],
        })
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"{BASE_URL}/ecoles",
        data=data,
        headers={
            "Authorization": f"Bearer {SERVICE_KEY}",
            "apikey": SERVICE_KEY,
            "Content-Type": "application/json",
            "Prefer": "resolution=ignore-duplicates,return=minimal",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as r:
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  ERROR {e.code}: {body}", file=sys.stderr)
        return False

# ──────────────────────────────────────────────
# DATA
# ──────────────────────────────────────────────

ECOLES = [
    # ── Universités Île-de-France ──
    {"name":"Université Panthéon-Assas (Paris 2)","type":"Université","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.u-paris2.fr","slug":"universite-pantheon-assas"},
    {"name":"Université Sorbonne Nouvelle (Paris 3)","type":"Université","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.sorbonne-nouvelle.fr","slug":"universite-sorbonne-nouvelle"},
    {"name":"Université Paris Cité","type":"Université","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.u-paris.fr","slug":"universite-paris-cite"},
    {"name":"Université Paris 8 Vincennes-Saint-Denis","type":"Université","city":"Saint-Denis","region":"Île-de-France","statut":"public","site_web":"https://www.univ-paris8.fr","slug":"universite-paris-8"},
    {"name":"Université Paris Nanterre","type":"Université","city":"Nanterre","region":"Île-de-France","statut":"public","site_web":"https://www.parisnanterre.fr","slug":"universite-paris-nanterre"},
    {"name":"Université Paris-Saclay","type":"Université","city":"Gif-sur-Yvette","region":"Île-de-France","statut":"public","site_web":"https://www.universite-paris-saclay.fr","slug":"universite-paris-saclay"},
    {"name":"Sorbonne Paris Nord (Paris 13)","type":"Université","city":"Villetaneuse","region":"Île-de-France","statut":"public","site_web":"https://www.univ-spn.fr","slug":"sorbonne-paris-nord"},
    {"name":"CY Cergy Paris Université","type":"Université","city":"Cergy","region":"Île-de-France","statut":"public","site_web":"https://www.cyu.fr","slug":"cy-cergy-paris-universite"},
    {"name":"Université Gustave Eiffel","type":"Université","city":"Marne-la-Vallée","region":"Île-de-France","statut":"public","site_web":"https://www.univ-gustave-eiffel.fr","slug":"universite-gustave-eiffel"},
    {"name":"Université d'Évry Val d'Essonne","type":"Université","city":"Évry","region":"Île-de-France","statut":"public","site_web":"https://www.univ-evry.fr","slug":"universite-evry"},
    {"name":"Université de Versailles Saint-Quentin-en-Yvelines","type":"Université","city":"Versailles","region":"Île-de-France","statut":"public","site_web":"https://www.uvsq.fr","slug":"universite-versailles-saint-quentin"},
    {"name":"Université Paris-Est Créteil (UPEC)","type":"Université","city":"Créteil","region":"Île-de-France","statut":"public","site_web":"https://www.u-pec.fr","slug":"universite-paris-est-creteil"},

    # ── Universités Auvergne-Rhône-Alpes ──
    {"name":"Université Lumière Lyon 2","type":"Université","city":"Lyon","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.univ-lyon2.fr","slug":"universite-lumiere-lyon-2"},
    {"name":"Université Jean Moulin Lyon 3","type":"Université","city":"Lyon","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.univ-lyon3.fr","slug":"universite-jean-moulin-lyon-3"},
    {"name":"Université Jean Monnet Saint-Étienne","type":"Université","city":"Saint-Étienne","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.univ-st-etienne.fr","slug":"universite-jean-monnet-saint-etienne"},
    {"name":"Université Savoie Mont Blanc","type":"Université","city":"Chambéry","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.univ-smb.fr","slug":"universite-savoie-mont-blanc"},
    {"name":"Université Grenoble Alpes","type":"Université","city":"Grenoble","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.univ-grenoble-alpes.fr","slug":"universite-grenoble-alpes"},
    {"name":"Université Clermont Auvergne","type":"Université","city":"Clermont-Ferrand","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.uca.fr","slug":"universite-clermont-auvergne"},

    # ── Universités Normandie ──
    {"name":"Université de Caen Normandie","type":"Université","city":"Caen","region":"Normandie","statut":"public","site_web":"https://www.unicaen.fr","slug":"universite-caen-normandie"},
    {"name":"Université de Rouen Normandie","type":"Université","city":"Rouen","region":"Normandie","statut":"public","site_web":"https://www.univ-rouen.fr","slug":"universite-rouen-normandie"},
    {"name":"Université Le Havre Normandie","type":"Université","city":"Le Havre","region":"Normandie","statut":"public","site_web":"https://www.univ-lehavre.fr","slug":"universite-le-havre-normandie"},

    # ── Universités Bretagne + Pays de la Loire ──
    {"name":"Université Rennes 2","type":"Université","city":"Rennes","region":"Bretagne","statut":"public","site_web":"https://www.univ-rennes2.fr","slug":"universite-rennes-2"},
    {"name":"Université de Bretagne Occidentale","type":"Université","city":"Brest","region":"Bretagne","statut":"public","site_web":"https://www.univ-brest.fr","slug":"universite-bretagne-occidentale"},
    {"name":"Université Bretagne Sud","type":"Université","city":"Lorient","region":"Bretagne","statut":"public","site_web":"https://www.univ-ubs.fr","slug":"universite-bretagne-sud"},
    {"name":"Université de Nantes","type":"Université","city":"Nantes","region":"Pays de la Loire","statut":"public","site_web":"https://www.univ-nantes.fr","slug":"universite-nantes"},
    {"name":"Le Mans Université","type":"Université","city":"Le Mans","region":"Pays de la Loire","statut":"public","site_web":"https://www.univ-lemans.fr","slug":"universite-le-mans"},
    {"name":"Université d'Angers","type":"Université","city":"Angers","region":"Pays de la Loire","statut":"public","site_web":"https://www.univ-angers.fr","slug":"universite-angers"},

    # ── Universités Nouvelle-Aquitaine ──
    {"name":"Université Bordeaux Montaigne","type":"Université","city":"Bordeaux","region":"Nouvelle-Aquitaine","statut":"public","site_web":"https://www.u-bordeaux-montaigne.fr","slug":"universite-bordeaux-montaigne"},
    {"name":"Université de Pau et des Pays de l'Adour","type":"Université","city":"Pau","region":"Nouvelle-Aquitaine","statut":"public","site_web":"https://www.univ-pau.fr","slug":"universite-pau-pays-adour"},
    {"name":"Université de Poitiers","type":"Université","city":"Poitiers","region":"Nouvelle-Aquitaine","statut":"public","site_web":"https://www.univ-poitiers.fr","slug":"universite-poitiers"},
    {"name":"Université de La Rochelle","type":"Université","city":"La Rochelle","region":"Nouvelle-Aquitaine","statut":"public","site_web":"https://www.univ-larochelle.fr","slug":"universite-la-rochelle"},
    {"name":"Université de Limoges","type":"Université","city":"Limoges","region":"Nouvelle-Aquitaine","statut":"public","site_web":"https://www.unilim.fr","slug":"universite-limoges"},

    # ── Universités Occitanie ──
    {"name":"Université Paul-Valéry Montpellier 3","type":"Université","city":"Montpellier","region":"Occitanie","statut":"public","site_web":"https://www.univ-montp3.fr","slug":"universite-paul-valery-montpellier-3"},
    {"name":"Université de Perpignan Via Domitia","type":"Université","city":"Perpignan","region":"Occitanie","statut":"public","site_web":"https://www.univ-perp.fr","slug":"universite-perpignan"},
    {"name":"Université Toulouse 1 Capitole","type":"Université","city":"Toulouse","region":"Occitanie","statut":"public","site_web":"https://www.ut-capitole.fr","slug":"universite-toulouse-1-capitole"},
    {"name":"Université Toulouse 2 Jean Jaurès","type":"Université","city":"Toulouse","region":"Occitanie","statut":"public","site_web":"https://www.univ-tlse2.fr","slug":"universite-toulouse-2-jean-jaures"},
    {"name":"Université Toulouse 3 Paul Sabatier","type":"Université","city":"Toulouse","region":"Occitanie","statut":"public","site_web":"https://www.univ-tlse3.fr","slug":"universite-toulouse-3-paul-sabatier"},
    {"name":"Université de Nîmes","type":"Université","city":"Nîmes","region":"Occitanie","statut":"public","site_web":"https://www.unimes.fr","slug":"universite-nimes"},

    # ── Universités PACA ──
    {"name":"Université de Toulon","type":"Université","city":"Toulon","region":"Provence-Alpes-Côte d'Azur","statut":"public","site_web":"https://www.univ-tln.fr","slug":"universite-toulon"},
    {"name":"Université Côte d'Azur","type":"Université","city":"Nice","region":"Provence-Alpes-Côte d'Azur","statut":"public","site_web":"https://univ-cotedazur.fr","slug":"universite-cote-azur"},
    {"name":"Université d'Avignon","type":"Université","city":"Avignon","region":"Provence-Alpes-Côte d'Azur","statut":"public","site_web":"https://www.univ-avignon.fr","slug":"universite-avignon"},

    # ── Universités Grand Est ──
    {"name":"Université de Haute-Alsace","type":"Université","city":"Mulhouse","region":"Grand Est","statut":"public","site_web":"https://www.uha.fr","slug":"universite-haute-alsace"},
    {"name":"Université de Lorraine","type":"Université","city":"Nancy","region":"Grand Est","statut":"public","site_web":"https://www.univ-lorraine.fr","slug":"universite-lorraine"},
    {"name":"Université de Reims Champagne-Ardenne","type":"Université","city":"Reims","region":"Grand Est","statut":"public","site_web":"https://www.univ-reims.fr","slug":"universite-reims-champagne-ardenne"},

    # ── Universités Hauts-de-France ──
    {"name":"Université de Lille","type":"Université","city":"Lille","region":"Hauts-de-France","statut":"public","site_web":"https://www.univ-lille.fr","slug":"universite-lille"},
    {"name":"Université du Littoral Côte d'Opale","type":"Université","city":"Dunkerque","region":"Hauts-de-France","statut":"public","site_web":"https://www.univ-littoral.fr","slug":"universite-littoral-cote-opale"},
    {"name":"Université d'Artois","type":"Université","city":"Arras","region":"Hauts-de-France","statut":"public","site_web":"https://www.univ-artois.fr","slug":"universite-artois"},
    {"name":"Université Polytechnique Hauts-de-France","type":"Université","city":"Valenciennes","region":"Hauts-de-France","statut":"public","site_web":"https://www.uphf.fr","slug":"universite-polytechnique-hauts-de-france"},
    {"name":"Université de Picardie Jules Verne","type":"Université","city":"Amiens","region":"Hauts-de-France","statut":"public","site_web":"https://www.u-picardie.fr","slug":"universite-picardie-jules-verne"},

    # ── Universités Bourgogne-Franche-Comté ──
    {"name":"Université de Bourgogne","type":"Université","city":"Dijon","region":"Bourgogne-Franche-Comté","statut":"public","site_web":"https://www.u-bourgogne.fr","slug":"universite-bourgogne"},
    {"name":"Université de Franche-Comté","type":"Université","city":"Besançon","region":"Bourgogne-Franche-Comté","statut":"public","site_web":"https://www.univ-fcomte.fr","slug":"universite-franche-comte"},

    # ── Universités Centre-Val de Loire ──
    {"name":"Université de Tours","type":"Université","city":"Tours","region":"Centre-Val de Loire","statut":"public","site_web":"https://www.univ-tours.fr","slug":"universite-tours"},
    {"name":"Université d'Orléans","type":"Université","city":"Orléans","region":"Centre-Val de Loire","statut":"public","site_web":"https://www.univ-orleans.fr","slug":"universite-orleans"},

    # ── Universités DOM-TOM + Corse ──
    {"name":"Université des Antilles","type":"Université","city":"Pointe-à-Pitre","region":"Guadeloupe","statut":"public","site_web":"https://www.univ-antilles.fr","slug":"universite-antilles"},
    {"name":"Université de La Réunion","type":"Université","city":"Saint-Denis","region":"La Réunion","statut":"public","site_web":"https://www.univ-reunion.fr","slug":"universite-reunion"},
    {"name":"Université de la Guyane","type":"Université","city":"Cayenne","region":"Guyane","statut":"public","site_web":"https://www.univ-guyane.fr","slug":"universite-guyane"},
    {"name":"Université de Corse Pasquale Paoli","type":"Université","city":"Corte","region":"Corse","statut":"public","site_web":"https://www.universita.corsica","slug":"universite-corse"},

    # ── Grandes écoles d'ingénieurs — top tier ──
    {"name":"MINES ParisTech — PSL","type":"École d'ingénieurs","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.minesparis.psl.eu","slug":"mines-paristech"},
    {"name":"École des Ponts ParisTech","type":"École d'ingénieurs","city":"Marne-la-Vallée","region":"Île-de-France","statut":"public","site_web":"https://www.ecoledesponts.fr","slug":"ecole-ponts-paristech"},
    {"name":"ENSTA Paris","type":"École d'ingénieurs","city":"Palaiseau","region":"Île-de-France","statut":"public","site_web":"https://www.ensta-paris.fr","slug":"ensta-paris"},
    {"name":"Télécom Paris","type":"École d'ingénieurs","city":"Palaiseau","region":"Île-de-France","statut":"public","site_web":"https://www.telecom-paris.fr","slug":"telecom-paris"},
    {"name":"Télécom SudParis","type":"École d'ingénieurs","city":"Évry","region":"Île-de-France","statut":"public","site_web":"https://www.telecom-sudparis.eu","slug":"telecom-sudparis"},
    {"name":"AgroParisTech","type":"École d'ingénieurs","city":"Palaiseau","region":"Île-de-France","statut":"public","site_web":"https://www.agroparistech.fr","slug":"agroparistech"},
    {"name":"ENSAE Paris","type":"École d'ingénieurs","city":"Palaiseau","region":"Île-de-France","statut":"public","site_web":"https://www.ensae.fr","slug":"ensae-paris"},
    {"name":"ISAE-SUPAERO","type":"École d'ingénieurs","city":"Toulouse","region":"Occitanie","statut":"public","site_web":"https://www.isae-supaero.fr","slug":"isae-supaero"},
    {"name":"École Centrale de Lyon","type":"École d'ingénieurs","city":"Écully","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.ec-lyon.fr","slug":"ecole-centrale-lyon"},
    {"name":"École Centrale de Nantes","type":"École d'ingénieurs","city":"Nantes","region":"Pays de la Loire","statut":"public","site_web":"https://www.ec-nantes.fr","slug":"ecole-centrale-nantes"},
    {"name":"Centrale Lille Institut","type":"École d'ingénieurs","city":"Villeneuve-d'Ascq","region":"Hauts-de-France","statut":"public","site_web":"https://centralelille.fr","slug":"centrale-lille"},
    {"name":"Centrale Méditerranée","type":"École d'ingénieurs","city":"Marseille","region":"Provence-Alpes-Côte d'Azur","statut":"public","site_web":"https://www.centrale-mediterranee.fr","slug":"centrale-mediterranee"},
    {"name":"IMT Atlantique","type":"École d'ingénieurs","city":"Brest","region":"Bretagne","statut":"public","site_web":"https://www.imt-atlantique.fr","slug":"imt-atlantique"},
    {"name":"ENSTA Bretagne","type":"École d'ingénieurs","city":"Brest","region":"Bretagne","statut":"public","site_web":"https://www.ensta-bretagne.fr","slug":"ensta-bretagne"},

    # ── INSA ──
    {"name":"INSA Toulouse","type":"École d'ingénieurs","city":"Toulouse","region":"Occitanie","statut":"public","site_web":"https://www.insa-toulouse.fr","slug":"insa-toulouse"},
    {"name":"INSA Rennes","type":"École d'ingénieurs","city":"Rennes","region":"Bretagne","statut":"public","site_web":"https://www.insa-rennes.fr","slug":"insa-rennes"},
    {"name":"INSA Rouen Normandie","type":"École d'ingénieurs","city":"Saint-Étienne-du-Rouvray","region":"Normandie","statut":"public","site_web":"https://www.insa-rouen.fr","slug":"insa-rouen"},
    {"name":"INSA Strasbourg","type":"École d'ingénieurs","city":"Strasbourg","region":"Grand Est","statut":"public","site_web":"https://www.insa-strasbourg.fr","slug":"insa-strasbourg"},
    {"name":"INSA Centre Val de Loire","type":"École d'ingénieurs","city":"Bourges","region":"Centre-Val de Loire","statut":"public","site_web":"https://www.insa-centrevaldeloire.fr","slug":"insa-centre-val-de-loire"},

    # ── INP + UT ──
    {"name":"Grenoble INP - UGA","type":"École d'ingénieurs","city":"Grenoble","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.grenoble-inp.fr","slug":"grenoble-inp"},
    {"name":"Bordeaux INP","type":"École d'ingénieurs","city":"Bordeaux","region":"Nouvelle-Aquitaine","statut":"public","site_web":"https://www.bordeaux-inp.fr","slug":"bordeaux-inp"},
    {"name":"INP Toulouse","type":"École d'ingénieurs","city":"Toulouse","region":"Occitanie","statut":"public","site_web":"https://www.inp-toulouse.fr","slug":"inp-toulouse"},
    {"name":"Université de Technologie de Troyes (UTT)","type":"École d'ingénieurs","city":"Troyes","region":"Grand Est","statut":"public","site_web":"https://www.utt.fr","slug":"utt-troyes"},
    {"name":"Université de Technologie de Compiègne (UTC)","type":"École d'ingénieurs","city":"Compiègne","region":"Hauts-de-France","statut":"public","site_web":"https://www.utc.fr","slug":"utc-compiegne"},
    {"name":"Université de Technologie de Belfort-Montbéliard (UTBM)","type":"École d'ingénieurs","city":"Belfort","region":"Bourgogne-Franche-Comté","statut":"public","site_web":"https://www.utbm.fr","slug":"utbm-belfort"},

    # ── Mines ──
    {"name":"Mines Saint-Étienne","type":"École d'ingénieurs","city":"Saint-Étienne","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.mines-stetienne.fr","slug":"mines-saint-etienne"},
    {"name":"Mines Nancy","type":"École d'ingénieurs","city":"Nancy","region":"Grand Est","statut":"public","site_web":"https://mines-nancy.univ-lorraine.fr","slug":"mines-nancy"},
    {"name":"IMT Nord Europe","type":"École d'ingénieurs","city":"Douai","region":"Hauts-de-France","statut":"public","site_web":"https://imt-nord-europe.fr","slug":"imt-nord-europe"},
    {"name":"IMT Mines Albi","type":"École d'ingénieurs","city":"Albi","region":"Occitanie","statut":"public","site_web":"https://www.imt-mines-albi.fr","slug":"imt-mines-albi"},
    {"name":"IMT Mines Alès","type":"École d'ingénieurs","city":"Alès","region":"Occitanie","statut":"public","site_web":"https://www.mines-ales.fr","slug":"imt-mines-ales"},

    # ── Ingénieurs privées / spécialisées ──
    {"name":"EPITA","type":"École d'ingénieurs","city":"Le Kremlin-Bicêtre","region":"Île-de-France","statut":"privé","site_web":"https://www.epita.fr","slug":"epita"},
    {"name":"ECE Paris","type":"École d'ingénieurs","city":"Paris","region":"Île-de-France","statut":"privé","site_web":"https://www.ece.fr","slug":"ece-paris"},
    {"name":"EFREI Paris","type":"École d'ingénieurs","city":"Villejuif","region":"Île-de-France","statut":"privé","site_web":"https://www.efrei.fr","slug":"efrei-paris"},
    {"name":"ESIEE Paris","type":"École d'ingénieurs","city":"Noisy-le-Grand","region":"Île-de-France","statut":"public","site_web":"https://www.esiee.fr","slug":"esiee-paris"},
    {"name":"ISEP","type":"École d'ingénieurs","city":"Paris","region":"Île-de-France","statut":"privé","site_web":"https://www.isep.fr","slug":"isep-paris"},
    {"name":"EPF École d'Ingénieurs","type":"École d'ingénieurs","city":"Cachan","region":"Île-de-France","statut":"privé","site_web":"https://www.epf.fr","slug":"epf-ecole-ingenieurs"},
    {"name":"ESTP Paris","type":"École d'ingénieurs","city":"Cachan","region":"Île-de-France","statut":"privé","site_web":"https://www.estp.fr","slug":"estp-paris"},
    {"name":"CY Tech","type":"École d'ingénieurs","city":"Cergy","region":"Île-de-France","statut":"privé","site_web":"https://www.cytech.cyu.fr","slug":"cy-tech"},
    {"name":"ENIB","type":"École d'ingénieurs","city":"Brest","region":"Bretagne","statut":"public","site_web":"https://www.enib.fr","slug":"enib-brest"},
    {"name":"CNAM","type":"École d'ingénieurs","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.cnam.fr","slug":"cnam"},
    {"name":"RUBIKA","type":"École d'ingénieurs","city":"Valenciennes","region":"Hauts-de-France","statut":"privé","site_web":"https://www.rubika.fr","slug":"rubika"},

    # ── Polytech ──
    {"name":"Polytech Lyon","type":"École d'ingénieurs","city":"Villeurbanne","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://polytech.univ-lyon1.fr","slug":"polytech-lyon"},
    {"name":"Polytech Nice Sophia","type":"École d'ingénieurs","city":"Nice","region":"Provence-Alpes-Côte d'Azur","statut":"public","site_web":"https://polytech.unice.fr","slug":"polytech-nice"},
    {"name":"Polytech Montpellier","type":"École d'ingénieurs","city":"Montpellier","region":"Occitanie","statut":"public","site_web":"https://www.polytech.umontpellier.fr","slug":"polytech-montpellier"},
    {"name":"Polytech Clermont","type":"École d'ingénieurs","city":"Clermont-Ferrand","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://polytech.uca.fr","slug":"polytech-clermont"},
    {"name":"Polytech Nantes","type":"École d'ingénieurs","city":"Nantes","region":"Pays de la Loire","statut":"public","site_web":"https://polytech.univ-nantes.fr","slug":"polytech-nantes"},
    {"name":"Polytech Bordeaux","type":"École d'ingénieurs","city":"Talence","region":"Nouvelle-Aquitaine","statut":"public","site_web":"https://www.polytech-bordeaux.fr","slug":"polytech-bordeaux"},
    {"name":"Polytech Grenoble","type":"École d'ingénieurs","city":"Grenoble","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.polytech-grenoble.fr","slug":"polytech-grenoble"},
    {"name":"Polytech Tours","type":"École d'ingénieurs","city":"Tours","region":"Centre-Val de Loire","statut":"public","site_web":"https://polytech.univ-tours.fr","slug":"polytech-tours"},
    {"name":"Polytech Annecy-Chambéry","type":"École d'ingénieurs","city":"Annecy","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.polytech.univ-smb.fr","slug":"polytech-annecy-chambery"},
    {"name":"Polytech Paris-Saclay","type":"École d'ingénieurs","city":"Gif-sur-Yvette","region":"Île-de-France","statut":"public","site_web":"https://www.polytech.universite-paris-saclay.fr","slug":"polytech-paris-saclay"},
    {"name":"Polytech Lille","type":"École d'ingénieurs","city":"Villeneuve-d'Ascq","region":"Hauts-de-France","statut":"public","site_web":"https://www.polytech-lille.fr","slug":"polytech-lille"},
    {"name":"Polytech Sorbonne","type":"École d'ingénieurs","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.polytech.sorbonne-universite.fr","slug":"polytech-sorbonne"},

    # ── Écoles de commerce ──
    {"name":"NEOMA Business School","type":"École de commerce et de gestion","city":"Reims","region":"Grand Est","statut":"privé","site_web":"https://www.neoma-bs.fr","slug":"neoma-business-school"},
    {"name":"Audencia Nantes","type":"École de commerce et de gestion","city":"Nantes","region":"Pays de la Loire","statut":"privé","site_web":"https://www.audencia.com","slug":"audencia-nantes"},
    {"name":"ICN Business School","type":"École de commerce et de gestion","city":"Nancy","region":"Grand Est","statut":"privé","site_web":"https://www.icn-artem.com","slug":"icn-business-school"},
    {"name":"IESEG School of Management","type":"École de commerce et de gestion","city":"Lille","region":"Hauts-de-France","statut":"privé","site_web":"https://www.ieseg.fr","slug":"ieseg-school-of-management"},
    {"name":"BSB Burgundy School of Business","type":"École de commerce et de gestion","city":"Dijon","region":"Bourgogne-Franche-Comté","statut":"privé","site_web":"https://www.bsb-education.com","slug":"bsb-burgundy-school-of-business"},
    {"name":"Montpellier Business School","type":"École de commerce et de gestion","city":"Montpellier","region":"Occitanie","statut":"privé","site_web":"https://www.montpellier-bs.com","slug":"montpellier-business-school"},
    {"name":"TBS Education","type":"École de commerce et de gestion","city":"Toulouse","region":"Occitanie","statut":"privé","site_web":"https://www.tbs-education.fr","slug":"tbs-education"},
    {"name":"Excelia Group","type":"École de commerce et de gestion","city":"La Rochelle","region":"Nouvelle-Aquitaine","statut":"privé","site_web":"https://www.excelia-group.com","slug":"excelia-group"},
    {"name":"IPAG Business School","type":"École de commerce et de gestion","city":"Paris","region":"Île-de-France","statut":"privé","site_web":"https://www.ipag.fr","slug":"ipag-business-school"},
    {"name":"ISC Paris","type":"École de commerce et de gestion","city":"Paris","region":"Île-de-France","statut":"privé","site_web":"https://www.iscparis.com","slug":"isc-paris"},
    {"name":"Paris School of Business","type":"École de commerce et de gestion","city":"Paris","region":"Île-de-France","statut":"privé","site_web":"https://www.psbedu.paris","slug":"paris-school-of-business"},
    {"name":"EBS Paris","type":"École de commerce et de gestion","city":"Paris","region":"Île-de-France","statut":"privé","site_web":"https://www.ebs-paris.com","slug":"ebs-paris"},
    {"name":"ESG Management School","type":"École de commerce et de gestion","city":"Paris","region":"Île-de-France","statut":"privé","site_web":"https://www.esgms.fr","slug":"esg-management-school"},
    {"name":"INSEEC Grande École","type":"École de commerce et de gestion","city":"Paris","region":"Île-de-France","statut":"privé","site_web":"https://www.inseec.com","slug":"inseec-grande-ecole"},
    {"name":"ESDES Lyon","type":"École de commerce et de gestion","city":"Lyon","region":"Auvergne-Rhône-Alpes","statut":"privé","site_web":"https://www.esdes.fr","slug":"esdes-lyon"},
    {"name":"ESSCA École de Management","type":"École de commerce et de gestion","city":"Angers","region":"Pays de la Loire","statut":"privé","site_web":"https://www.essca.fr","slug":"essca-ecole-management"},
    {"name":"Rennes School of Business","type":"École de commerce et de gestion","city":"Rennes","region":"Bretagne","statut":"privé","site_web":"https://www.rennes-sb.com","slug":"rennes-school-of-business"},
    {"name":"Brest Business School","type":"École de commerce et de gestion","city":"Brest","region":"Bretagne","statut":"privé","site_web":"https://www.brest-bs.com","slug":"brest-business-school"},

    # ── IEP / Sciences Po régionaux ──
    {"name":"Sciences Po Bordeaux","type":"Institut d'études politiques","city":"Bordeaux","region":"Nouvelle-Aquitaine","statut":"public","site_web":"https://www.sciencespobordeaux.fr","slug":"sciences-po-bordeaux"},
    {"name":"Sciences Po Grenoble","type":"Institut d'études politiques","city":"Grenoble","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.sciencespo-grenoble.fr","slug":"sciences-po-grenoble"},
    {"name":"Sciences Po Lyon","type":"Institut d'études politiques","city":"Lyon","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.sciencespo-lyon.fr","slug":"sciences-po-lyon"},
    {"name":"Sciences Po Rennes","type":"Institut d'études politiques","city":"Rennes","region":"Bretagne","statut":"public","site_web":"https://www.sciencespo-rennes.fr","slug":"sciences-po-rennes"},
    {"name":"Sciences Po Toulouse","type":"Institut d'études politiques","city":"Toulouse","region":"Occitanie","statut":"public","site_web":"https://www.sciencespo-toulouse.fr","slug":"sciences-po-toulouse"},
    {"name":"Sciences Po Aix","type":"Institut d'études politiques","city":"Aix-en-Provence","region":"Provence-Alpes-Côte d'Azur","statut":"public","site_web":"https://www.sciencespo-aix.fr","slug":"sciences-po-aix"},
    {"name":"Sciences Po Lille","type":"Institut d'études politiques","city":"Lille","region":"Hauts-de-France","statut":"public","site_web":"https://www.sciencespo-lille.eu","slug":"sciences-po-lille"},
    {"name":"Sciences Po Strasbourg","type":"Institut d'études politiques","city":"Strasbourg","region":"Grand Est","statut":"public","site_web":"https://www.iep-strasbourg.fr","slug":"sciences-po-strasbourg"},
    {"name":"Sciences Po Saint-Germain-en-Laye","type":"Institut d'études politiques","city":"Saint-Germain-en-Laye","region":"Île-de-France","statut":"public","site_web":"https://www.sciencespo-saintgermainenlaye.fr","slug":"sciences-po-saint-germain"},

    # ── ENS ──
    {"name":"ENS Paris-Saclay","type":"École normale supérieure","city":"Gif-sur-Yvette","region":"Île-de-France","statut":"public","site_web":"https://ens-paris-saclay.fr","slug":"ens-paris-saclay"},
    {"name":"ENS de Lyon","type":"École normale supérieure","city":"Lyon","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.ens-lyon.fr","slug":"ens-lyon"},
    {"name":"ENS Rennes","type":"École normale supérieure","city":"Rennes","region":"Bretagne","statut":"public","site_web":"https://www.ens-rennes.fr","slug":"ens-rennes"},

    # ── CPGE (prépa) ──
    {"name":"Lycée Sainte-Geneviève — Ginette (CPGE)","type":"Classe préparatoire","city":"Versailles","region":"Île-de-France","statut":"privé","site_web":"https://www.bginette.com","slug":"lycee-sainte-genevieve-ginette"},
    {"name":"Lycée du Parc Lyon (CPGE)","type":"Classe préparatoire","city":"Lyon","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.lyceeduparc.fr","slug":"lycee-du-parc-lyon"},
    {"name":"Lycée Pierre de Fermat Toulouse (CPGE)","type":"Classe préparatoire","city":"Toulouse","region":"Occitanie","statut":"public","site_web":"https://www.fermat.fr","slug":"lycee-pierre-de-fermat"},
    {"name":"Lycée Hoche Versailles (CPGE)","type":"Classe préparatoire","city":"Versailles","region":"Île-de-France","statut":"public","site_web":"https://www.lyceehoche.fr","slug":"lycee-hoche-versailles"},
    {"name":"Lycée Faidherbe Lille (CPGE)","type":"Classe préparatoire","city":"Lille","region":"Hauts-de-France","statut":"public","site_web":"https://www.lycee-faidherbe.fr","slug":"lycee-faidherbe-lille"},
    {"name":"Lycée Thiers Marseille (CPGE)","type":"Classe préparatoire","city":"Marseille","region":"Provence-Alpes-Côte d'Azur","statut":"public","site_web":"https://www.lycee-thiers.fr","slug":"lycee-thiers-marseille"},
    {"name":"Lycée Chaptal Paris (CPGE)","type":"Classe préparatoire","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.lycee-chaptal.fr","slug":"lycee-chaptal"},

    # ── Écoles d'art et de design ──
    {"name":"École nationale supérieure des Beaux-Arts (ENSBA)","type":"École d'art et de design","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.beauxartsparis.fr","slug":"ensba-paris"},
    {"name":"École nationale supérieure des Arts Décoratifs (ENSAD)","type":"École d'art et de design","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.ensad.fr","slug":"ensad-paris"},
    {"name":"Gobelins — l'école de l'image","type":"École d'art et de design","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.gobelins.fr","slug":"gobelins"},
    {"name":"École Duperré","type":"École d'art et de design","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.ecole-duperre.fr","slug":"ecole-duperre"},
    {"name":"École Estienne","type":"École d'art et de design","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.ecole-estienne.paris","slug":"ecole-estienne"},
    {"name":"École Boulle","type":"École d'art et de design","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.ecole-boulle.org","slug":"ecole-boulle"},
    {"name":"Penninghen","type":"École d'art et de design","city":"Paris","region":"Île-de-France","statut":"privé","site_web":"https://www.penninghen.fr","slug":"penninghen"},
    {"name":"HEAR — Haute École des Arts du Rhin","type":"École d'art et de design","city":"Strasbourg","region":"Grand Est","statut":"public","site_web":"https://www.hear.fr","slug":"hear-strasbourg"},
    {"name":"ESAD Reims","type":"École d'art et de design","city":"Reims","region":"Grand Est","statut":"public","site_web":"https://www.esad-reims.fr","slug":"esad-reims"},
    {"name":"EBABX — École des Beaux-Arts de Bordeaux","type":"École d'art et de design","city":"Bordeaux","region":"Nouvelle-Aquitaine","statut":"public","site_web":"https://www.ebabx.fr","slug":"ebabx-bordeaux"},
    {"name":"ESMOD Paris","type":"École d'art et de design","city":"Paris","region":"Île-de-France","statut":"privé","site_web":"https://www.esmod.com","slug":"esmod-paris"},
    {"name":"LISAA Paris","type":"École d'art et de design","city":"Paris","region":"Île-de-France","statut":"privé","site_web":"https://www.lisaa.com","slug":"lisaa-paris"},
    {"name":"ICAN — Creative Digital Arts","type":"École d'art et de design","city":"Paris","region":"Île-de-France","statut":"privé","site_web":"https://www.ican.fr","slug":"ican-paris"},
    {"name":"Strate — École de Design","type":"École d'art et de design","city":"Sèvres","region":"Île-de-France","statut":"privé","site_web":"https://www.strate.design","slug":"strate-ecole-design"},
    {"name":"ECV — École de Communication Visuelle","type":"École d'art et de design","city":"Paris","region":"Île-de-France","statut":"privé","site_web":"https://www.ecv.fr","slug":"ecv-paris"},

    # ── Écoles d'architecture ──
    {"name":"ENSA Paris-Belleville","type":"École d'architecture","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.paris-belleville.archi.fr","slug":"ensa-paris-belleville"},
    {"name":"ENSA Paris La Villette","type":"École d'architecture","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.paris-lavillette.archi.fr","slug":"ensa-paris-lavillette"},
    {"name":"ENSA Paris Val de Seine","type":"École d'architecture","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.paris-valdeseine.archi.fr","slug":"ensa-paris-val-de-seine"},
    {"name":"ENSA Paris-Malaquais","type":"École d'architecture","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.paris-malaquais.archi.fr","slug":"ensa-paris-malaquais"},
    {"name":"ENSA Versailles","type":"École d'architecture","city":"Versailles","region":"Île-de-France","statut":"public","site_web":"https://www.versailles.archi.fr","slug":"ensa-versailles"},
    {"name":"ENSA Lyon","type":"École d'architecture","city":"Lyon","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.lyon.archi.fr","slug":"ensa-lyon"},
    {"name":"ENSA Bordeaux","type":"École d'architecture","city":"Bordeaux","region":"Nouvelle-Aquitaine","statut":"public","site_web":"https://www.bordeaux.archi.fr","slug":"ensa-bordeaux"},
    {"name":"ENSA Nantes","type":"École d'architecture","city":"Nantes","region":"Pays de la Loire","statut":"public","site_web":"https://www.nantes.archi.fr","slug":"ensa-nantes"},
    {"name":"ENSA Marseille","type":"École d'architecture","city":"Marseille","region":"Provence-Alpes-Côte d'Azur","statut":"public","site_web":"https://www.marseille.archi.fr","slug":"ensa-marseille"},
    {"name":"ENSA Toulouse","type":"École d'architecture","city":"Toulouse","region":"Occitanie","statut":"public","site_web":"https://www.toulouse.archi.fr","slug":"ensa-toulouse"},
    {"name":"ENSA Grenoble","type":"École d'architecture","city":"Grenoble","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.grenoble.archi.fr","slug":"ensa-grenoble"},
    {"name":"ENSA Strasbourg","type":"École d'architecture","city":"Strasbourg","region":"Grand Est","statut":"public","site_web":"https://www.strasbourg.archi.fr","slug":"ensa-strasbourg"},
    {"name":"ENSA Lille","type":"École d'architecture","city":"Villeneuve-d'Ascq","region":"Hauts-de-France","statut":"public","site_web":"https://www.lille.archi.fr","slug":"ensa-lille"},
    {"name":"ENSA Clermont-Ferrand","type":"École d'architecture","city":"Clermont-Ferrand","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.clermont-ferrand.archi.fr","slug":"ensa-clermont-ferrand"},
    {"name":"ENSA Nancy","type":"École d'architecture","city":"Nancy","region":"Grand Est","statut":"public","site_web":"https://www.nancy.archi.fr","slug":"ensa-nancy"},
    {"name":"ENSA Bretagne","type":"École d'architecture","city":"Rennes","region":"Bretagne","statut":"public","site_web":"https://www.rennes.archi.fr","slug":"ensa-bretagne"},
    {"name":"ENSA Montpellier","type":"École d'architecture","city":"Montpellier","region":"Occitanie","statut":"public","site_web":"https://www.montpellier.archi.fr","slug":"ensa-montpellier"},
    {"name":"ENSA Nice","type":"École d'architecture","city":"Nice","region":"Provence-Alpes-Côte d'Azur","statut":"public","site_web":"https://www.nice.archi.fr","slug":"ensa-nice"},
    {"name":"ENSA Normandie","type":"École d'architecture","city":"Darnétal","region":"Normandie","statut":"public","site_web":"https://www.rouen.archi.fr","slug":"ensa-normandie"},
    {"name":"ENSA Saint-Étienne","type":"École d'architecture","city":"Saint-Étienne","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.saint-etienne.archi.fr","slug":"ensa-saint-etienne"},

    # ── Établissements spécialisés ──
    {"name":"EHESP — École des hautes études en santé publique","type":"Établissement spécialisé","city":"Rennes","region":"Bretagne","statut":"public","site_web":"https://www.ehesp.fr","slug":"ehesp"},
    {"name":"École nationale vétérinaire d'Alfort (EnvA)","type":"Établissement spécialisé","city":"Maisons-Alfort","region":"Île-de-France","statut":"public","site_web":"https://www.vet-alfort.fr","slug":"enva-alfort"},
    {"name":"VetAgro Sup","type":"Établissement spécialisé","city":"Marcy-l'Étoile","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.vetagro-sup.fr","slug":"vetagro-sup"},
    {"name":"ONIRIS — École nationale vétérinaire Nantes","type":"Établissement spécialisé","city":"Nantes","region":"Pays de la Loire","statut":"public","site_web":"https://www.oniris-nantes.fr","slug":"oniris-nantes"},
    {"name":"ENVT — École nationale vétérinaire de Toulouse","type":"Établissement spécialisé","city":"Toulouse","region":"Occitanie","statut":"public","site_web":"https://www.envt.fr","slug":"envt-toulouse"},
    {"name":"INSP — Institut National du Service Public","type":"Établissement spécialisé","city":"Strasbourg","region":"Grand Est","statut":"public","site_web":"https://www.insp.gouv.fr","slug":"insp"},
    {"name":"La Fémis — École nationale des métiers de l'image et du son","type":"Établissement spécialisé","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.femis.fr","slug":"la-femis"},
    {"name":"INSEP — Institut national du sport","type":"Établissement spécialisé","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.insep.fr","slug":"insep"},
    {"name":"CNSMDP — Conservatoire national supérieur de musique et de danse de Paris","type":"Établissement spécialisé","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.conservatoiredeparis.fr","slug":"cnsmdp-paris"},
    {"name":"CNSMD de Lyon — Conservatoire national supérieur de musique et de danse","type":"Établissement spécialisé","city":"Lyon","region":"Auvergne-Rhône-Alpes","statut":"public","site_web":"https://www.cnsmd-lyon.fr","slug":"cnsmdl-lyon"},
    {"name":"CNSAD — Conservatoire national supérieur d'art dramatique","type":"Établissement spécialisé","city":"Paris","region":"Île-de-France","statut":"public","site_web":"https://www.cnsad.fr","slug":"cnsad-paris"},
]

# ── Run by batches of 30 ──
BATCH_SIZE = 30
total_ok = 0
total_err = 0

for i in range(0, len(ECOLES), BATCH_SIZE):
    batch = ECOLES[i:i+BATCH_SIZE]
    label = f"[{i+1}–{min(i+BATCH_SIZE, len(ECOLES))}]"
    ok = insert_batch(batch)
    if ok:
        total_ok += len(batch)
        print(f"  {label} ✓ {len(batch)} insérés")
    else:
        total_err += len(batch)
        print(f"  {label} ✗ erreur")

# ── Final count via REST ──
from collections import Counter
req2 = urllib.request.Request(
    f"{BASE_URL}/ecoles?select=type_etablissement&order=type_etablissement&limit=1000",
    headers={"Authorization": f"Bearer {SERVICE_KEY}", "apikey": SERVICE_KEY,
             "Accept": "application/json", "Prefer": "count=exact"},
    method="GET",
)
with urllib.request.urlopen(req2) as r2:
    all_rows = json.loads(r2.read())
    total_count = r2.headers.get("Content-Range", f"?/{len(all_rows)}").split("/")[-1]

counts = Counter(row["type_etablissement"] for row in all_rows)
print("\n=== Résultat final ===")
for typ, n in sorted(counts.items(), key=lambda x: -x[1]):
    print(f"  {n:>3}  {typ}")
print(f"\n  TOTAL : {total_count} établissements")
