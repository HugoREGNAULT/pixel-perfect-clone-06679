/**
 * Supabase Edge Function : cron-scrape-jpo
 *
 * Scrape les JPO des écoles de France et les stocke dans la table `jpos`.
 * Déploiement : supabase functions deploy cron-scrape-jpo
 *
 * Pour planifier automatiquement tous les lundis à 6h00, exécutez dans
 * le SQL Editor Supabase (après avoir récupéré votre project ref et service role key) :
 *
 *   SELECT cron.schedule(
 *     'scrape-jpo-weekly', '0 6 * * 1',
 *     $$ SELECT extensions.http_post(
 *          url     := 'https://<REF>.supabase.co/functions/v1/cron-scrape-jpo',
 *          headers := '{"Authorization":"Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
 *          body    := '{}'::jsonb
 *     ); $$
 *   );
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ── Types ───────────────────────────────────────────────────────────────────*/

interface JpoRow {
  nom_ecole: string;
  date: string;
  ville: string;
  region: string;
  type_ecole: string;
  lien_inscription: string | null;
  source_url: string;
}

/* ── Helpers ─────────────────────────────────────────────────────────────────*/

const MONTHS_FR: Record<string, number> = {
  janvier:1, février:2, mars:3, avril:4, mai:5, juin:6,
  juillet:7, août:8, septembre:9, octobre:10, novembre:11, décembre:12,
};

function parseDate(raw: string): string | null {
  const clean = raw.toLowerCase().trim();
  const long  = clean.match(/(\d{1,2})\s+([a-zéû.]+)\s+(\d{4})/);
  if (long) {
    const monthKey = Object.keys(MONTHS_FR).find((k) => k.startsWith(long[2].slice(0, 3)));
    const month    = monthKey ? MONTHS_FR[monthKey] : null;
    if (month) {
      const d = new Date(parseInt(long[3]), month - 1, parseInt(long[1]));
      return formatISO(d);
    }
  }
  const iso = clean.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const dmy = clean.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmy) return formatISO(new Date(parseInt(dmy[3]), parseInt(dmy[2]) - 1, parseInt(dmy[1])));

  return null;
}

function formatISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

const VILLE_REGION: Record<string, string[]> = {
  "Île-de-France":              ["paris","versailles","cergy","jouy-en-josas","palaiseau","gif-sur-yvette","champs-sur-marne","fontainebleau","marne","créteil","bobigny","nanterre","évry","pontoise","melun","saint-denis"],
  "Auvergne-Rhône-Alpes":      ["lyon","grenoble","clermont","saint-étienne","annecy","chambéry","villeurbanne","roanne","valence"],
  "Nouvelle-Aquitaine":        ["bordeaux","limoges","poitiers","la rochelle","bayonne","pau","périgueux","angoulême"],
  "Occitanie":                  ["toulouse","montpellier","nîmes","perpignan","béziers","alès","carcassonne","narbonne"],
  "Hauts-de-France":            ["lille","amiens","roubaix","tourcoing","dunkerque","valenciennes","douai","lens","arras"],
  "Provence-Alpes-Côte d'Azur":["marseille","nice","toulon","aix-en-provence","avignon","cannes"],
  "Grand Est":                  ["strasbourg","reims","metz","mulhouse","nancy","colmar","troyes"],
  "Pays de la Loire":           ["nantes","angers","le mans","saint-nazaire","laval","cholet"],
  "Bretagne":                   ["rennes","brest","quimper","lorient","vannes","saint-brieuc"],
  "Normandie":                  ["rouen","caen","le havre","cherbourg","alençon","évreux"],
  "Bourgogne-Franche-Comté":   ["dijon","besançon","belfort","montbéliard"],
  "Centre-Val de Loire":        ["orléans","tours","bourges","blois","chartres"],
  "Corse":                      ["ajaccio","bastia"],
};

function inferRegion(ville: string): string {
  const v = ville.toLowerCase();
  for (const [region, villes] of Object.entries(VILLE_REGION)) {
    if (villes.some((kw) => v.includes(kw))) return region;
  }
  return "France";
}

const TYPE_KEYWORDS: Record<string, string[]> = {
  "école de commerce": ["business school","hec ","essec","escp","edhec","kedge","em ","emlyon","ieseg","gem","audencia","tbs","montpellier bs","essca","neoma","skema","inseec"],
  "ingé":              ["ingénieur","polytechnique","supélec","centralesupélec","centrale ","insa","ensimag","ensta","imt ","enseirb","cpe ","telecom","supaero","ponts","mines","epitech"],
  "université":        ["université","univ.","sorbonne","paris-saclay","sciences po","iep","iae ","iut "],
  "BTS":               ["bts ","iut ","but ","lp "],
  "lycée":             ["lycée ","cpge","prép"],
};

function inferType(nom: string): string {
  const n = nom.toLowerCase();
  for (const [type, kws] of Object.entries(TYPE_KEYWORDS)) {
    if (kws.some((kw) => n.includes(kw))) return type;
  }
  return "autre";
}

/* ── HTML parser minimaliste (Deno sans dépendance DOM externe) ──────────────*/

/** Extrait des blocs délimités par une balise avec des attributs optionnels */
function extractBlocks(html: string, tag: string): string[] {
  const blocks: string[] = [];
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, "gi");
  let m;
  while ((m = re.exec(html)) !== null) blocks.push(m[0]);
  return blocks;
}

/** Extrait le texte brut d'un bloc HTML */
function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Extrait la valeur d'un attribut */
function attr(html: string, name: string): string | null {
  const m = new RegExp(`${name}="([^"]*)"`, "i").exec(html);
  return m ? m[1] : null;
}

/** Cherche une valeur de classe ou sous-élément contenant un mot-clé */
function findByKeyword(block: string, keywords: string[]): string | null {
  for (const kw of keywords) {
    const re = new RegExp(`class="[^"]*${kw}[^"]*"[^>]*>([^<]*)`, "gi");
    const m  = re.exec(block);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return null;
}

/* ── Scraper L'Étudiant ───────────────────────────────────────────────────────*/

async function scrapeLetudiant(log: string[]): Promise<JpoRow[]> {
  const url = "https://www.letudiant.fr/etudes/annuaire-enseignement-superieur/journees-portes-ouvertes.html";
  const results: JpoRow[] = [];

  try {
    const res  = await fetch(url, {
      headers: { "User-Agent": "SpringrBot/1.0", "Accept": "text/html", "Accept-Language": "fr-FR" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // L'Étudiant liste les JPO dans des cards .card ou articles
    const blocks = [
      ...extractBlocks(html, "article"),
      ...extractBlocks(html, "li"),
    ].filter((b) => /jpo|portes.ouvertes|portes ouvertes/i.test(b));

    log.push(`letudiant.fr → ${blocks.length} blocs`);

    for (const block of blocks) {
      const nom = findByKeyword(block, ["school-name","card-title","title","name"])
               || stripTags(extractBlocks(block, "h2")[0] ?? "")
               || stripTags(extractBlocks(block, "h3")[0] ?? "");
      if (!nom || nom.length < 3) continue;

      const rawDate = findByKeyword(block, ["date","when","time"])
                   || attr(block, "datetime") ?? "";
      const date = parseDate(rawDate);
      if (!date) continue;

      const ville  = findByKeyword(block, ["city","ville","lieu","location"]) ?? "France";
      const linkRaw = attr(block, "href");
      const link    = linkRaw ? (linkRaw.startsWith("http") ? linkRaw : `https://www.letudiant.fr${linkRaw}`) : null;

      results.push({ nom_ecole: nom.slice(0, 200), date, ville, region: inferRegion(ville), type_ecole: inferType(nom), lien_inscription: link, source_url: url });
    }
  } catch (e) {
    log.push(`letudiant.fr erreur: ${(e as Error).message}`);
  }
  return results;
}

/* ── Scraper Diplomeo ────────────────────────────────────────────────────────*/

async function scrapeDiplomeo(log: string[]): Promise<JpoRow[]> {
  const url = "https://diplomeo.com/actualite-salons_etudiants";
  const results: JpoRow[] = [];

  try {
    const res  = await fetch(url, { headers: { "User-Agent": "SpringrBot/1.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const blocks = extractBlocks(html, "article").concat(
      extractBlocks(html, "li").filter((b) => /salon|jpo|événement|event/i.test(b))
    );
    log.push(`diplomeo.com → ${blocks.length} blocs`);

    for (const block of blocks) {
      const nom = stripTags(extractBlocks(block, "h2")[0] ?? "")
               || stripTags(extractBlocks(block, "h3")[0] ?? "")
               || findByKeyword(block, ["title","heading","name"]) ?? "";
      if (!nom || nom.length < 3) continue;

      const rawDate = attr(block, "datetime") ?? findByKeyword(block, ["date","time","when"]) ?? "";
      const date    = parseDate(rawDate);
      if (!date) continue;

      const ville   = findByKeyword(block, ["location","city","lieu","ville"]) ?? "France";
      const linkRaw = attr(block, "href");
      const link    = linkRaw ? (linkRaw.startsWith("http") ? linkRaw : `https://diplomeo.com${linkRaw}`) : null;

      results.push({ nom_ecole: nom.slice(0, 200), date, ville, region: inferRegion(ville), type_ecole: inferType(nom), lien_inscription: link, source_url: url });
    }
  } catch (e) {
    log.push(`diplomeo.com erreur: ${(e as Error).message}`);
  }
  return results;
}

/* ── Scraper ONISEP ───────────────────────────────────────────────────────────*/

async function scrapeOnisep(log: string[]): Promise<JpoRow[]> {
  const url = "https://www.onisep.fr/Calendrier/Journees-Portes-Ouvertes";
  const results: JpoRow[] = [];

  try {
    const res  = await fetch(url, { headers: { "User-Agent": "SpringrBot/1.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    // ONISEP : souvent un tableau ou une liste structurée
    const rows = extractBlocks(html, "tr").concat(
      extractBlocks(html, "li").filter((b) => /portes.ouvertes|jpo|établissement/i.test(b))
    );
    log.push(`onisep.fr → ${rows.length} blocs`);

    for (const row of rows) {
      const cells = extractBlocks(row, "td");
      const nom   = cells[0] ? stripTags(cells[0]) : (stripTags(extractBlocks(row, "h3")[0] ?? "") || findByKeyword(row, ["school","etab","name"]) ?? "");
      if (!nom || nom.length < 3) continue;

      const rawDate = cells[1] ? stripTags(cells[1]) : (attr(row, "datetime") ?? findByKeyword(row, ["date","time"]) ?? "");
      const date    = parseDate(rawDate);
      if (!date) continue;

      const ville   = cells[2] ? stripTags(cells[2]) : (findByKeyword(row, ["city","ville","lieu"]) ?? "France");
      const linkRaw = attr(row, "href");
      const link    = linkRaw ? (linkRaw.startsWith("http") ? linkRaw : `https://www.onisep.fr${linkRaw}`) : null;

      results.push({ nom_ecole: nom.slice(0, 200), date, ville, region: inferRegion(ville), type_ecole: inferType(nom), lien_inscription: link, source_url: url });
    }
  } catch (e) {
    log.push(`onisep.fr erreur: ${(e as Error).message}`);
  }
  return results;
}

/* ── Handler principal ───────────────────────────────────────────────────────*/

Deno.serve(async (req) => {
  // Vérification basique de l'Authorization header
  const authHeader = req.headers.get("Authorization");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (serviceKey && authHeader !== `Bearer ${serviceKey}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const log: string[] = [];
  const start = Date.now();

  log.push("Démarrage du scraping JPO…");

  const [fromLetudiant, fromDiplomeo, fromOnisep] = await Promise.all([
    scrapeLetudiant(log),
    scrapeDiplomeo(log),
    scrapeOnisep(log),
  ]);

  const all = [...fromLetudiant, ...fromDiplomeo, ...fromOnisep];
  log.push(`Total scraped: ${all.length} JPOs`);

  // Filtre les doublons internes (même école + date)
  const seen  = new Set<string>();
  const dedup = all.filter((r) => {
    const key = `${r.nom_ecole}|${r.date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Filtre les dates valides (format YYYY-MM-DD)
  const valid = dedup.filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.date));

  let inserted = 0;
  let errors   = 0;

  if (valid.length > 0) {
    const BATCH = 50;
    for (let i = 0; i < valid.length; i += BATCH) {
      const { error } = await supabase
        .from("jpos")
        .upsert(valid.slice(i, i + BATCH), { onConflict: "nom_ecole,date" });
      if (error) {
        log.push(`Batch erreur: ${error.message}`);
        errors += Math.min(BATCH, valid.length - i);
      } else {
        inserted += Math.min(BATCH, valid.length - i);
      }
    }
  }

  const elapsed = Date.now() - start;
  log.push(`Terminé en ${elapsed}ms — ${inserted} insérées, ${errors} erreurs`);

  return new Response(
    JSON.stringify({ ok: true, scraped: all.length, upserted: inserted, errors, log }),
    { headers: { "Content-Type": "application/json" } },
  );
});
