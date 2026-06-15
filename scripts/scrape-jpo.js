/**
 * scripts/scrape-jpo.js
 *
 * Scraper de JPO (Journées Portes Ouvertes) des écoles de France.
 * Sources : letudiant.fr · diplomeo.com · onisep.fr
 *
 * Prérequis :
 *   npm install --save-dev cheerio dotenv
 *
 * Utilisation :
 *   node --env-file=.env scripts/scrape-jpo.js
 *
 * Variables d'environnement requises dans .env :
 *   SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 */

import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

/* ── Config ─────────────────────────────────────────────────────────────────*/

const SUPABASE_URL             = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌  Manque SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY dans l'environnement.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; SpringrBot/1.0; +https://springr.app/robots.txt)",
  "Accept": "text/html,application/xhtml+xml",
  "Accept-Language": "fr-FR,fr;q=0.9",
};

const DELAY_MS   = 2_000;  // pause entre chaque requête
const MAX_RETRIES = 3;

/* ── Helpers ─────────────────────────────────────────────────────────────────*/

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHTML(url, attempt = 1) {
  try {
    console.log(`  → GET ${url}`);
    const res = await fetch(url, { headers: HEADERS, redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      console.warn(`  ⚠️  Tentative ${attempt} échouée (${err.message}), retry dans 3s…`);
      await sleep(3_000);
      return fetchHTML(url, attempt + 1);
    }
    throw err;
  }
}

/** Normalise un texte de date français → objet Date ou null */
const MONTHS_FR = {
  janvier:1, février:2, mars:3, avril:4, mai:5, juin:6,
  juillet:7, août:8, septembre:9, octobre:10, novembre:11, décembre:12,
};

function parseDate(raw) {
  if (!raw) return null;
  const clean = raw.toLowerCase().trim();

  // "15 novembre 2026" / "15 nov. 2026"
  const long = clean.match(/(\d{1,2})\s+([a-zéû.]+)\s+(\d{4})/);
  if (long) {
    const month = MONTHS_FR[long[2].replace(".", "")] ?? MONTHS_FR[Object.keys(MONTHS_FR).find((k) => k.startsWith(long[2].slice(0, 3)))];
    if (month) return new Date(parseInt(long[3]), month - 1, parseInt(long[1]));
  }

  // "2026-11-15" / "15/11/2026"
  const iso = clean.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(iso[1], parseInt(iso[2]) - 1, parseInt(iso[3]));

  const dmy = clean.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmy) return new Date(parseInt(dmy[3]), parseInt(dmy[2]) - 1, parseInt(dmy[1]));

  return null;
}

function formatDateISO(d) {
  if (!d || isNaN(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Table région → liste de villes connues (normalisation) */
const VILLE_REGION = {
  "Île-de-France":              ["paris","versailles","cergy","jouy-en-josas","palaiseau","gif-sur-yvette","champs-sur-marne","fontainebleau","marne-la-vallée","créteil","bobigny","nanterre","évry","pontoise","melun","saint-denis"],
  "Auvergne-Rhône-Alpes":      ["lyon","grenoble","clermont-ferrand","saint-étienne","annecy","chambéry","villeurbanne","roanne","valence","bourg-en-bresse","mâcon"],
  "Nouvelle-Aquitaine":        ["bordeaux","limoges","poitiers","la rochelle","bayonne","pau","périgueux","angoulême","niort","agen","dax"],
  "Occitanie":                  ["toulouse","montpellier","nîmes","perpignan","béziers","alès","carcassonne","narbonne","rodez","auch","montauban"],
  "Hauts-de-France":            ["lille","amiens","roubaix","tourcoing","dunkerque","valenciennes","douai","maubeuge","lens","arras","calais","boulogne-sur-mer"],
  "Provence-Alpes-Côte d'Azur":["marseille","nice","toulon","aix-en-provence","avignon","cannes","antibes","menton","gap","digne-les-bains"],
  "Grand Est":                  ["strasbourg","reims","metz","mulhouse","nancy","colmar","troyes","châlons-en-champagne","épinal","thionville"],
  "Pays de la Loire":           ["nantes","angers","le mans","saint-nazaire","laval","cholet","la roche-sur-yon","saumur"],
  "Bretagne":                   ["rennes","brest","quimper","lorient","vannes","saint-brieuc","saint-malo","lannion"],
  "Normandie":                  ["rouen","caen","le havre","cherbourg","alençon","évreux","dieppe","lisieux"],
  "Bourgogne-Franche-Comté":   ["dijon","besançon","chalon-sur-saône","belfort","montbéliard","mâcon","sens","auxerre"],
  "Centre-Val de Loire":        ["orléans","tours","bourges","blois","chartres","châteauroux"],
  "Corse":                      ["ajaccio","bastia","corte"],
};

function inferRegion(ville) {
  const v = ville.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  for (const [region, villes] of Object.entries(VILLE_REGION)) {
    if (villes.some((kw) => v.includes(kw.normalize("NFD").replace(/[̀-ͯ]/g, "")))) {
      return region;
    }
  }
  return "France";
}

/** Mapping partiel école → type */
const TYPE_KEYWORDS = {
  "école de commerce": ["business school","hec","essec","escp","edhec","kedge","em ","emlyon","ieseg","gem","audencia","tbs","montpellier bs","essca","igs","neoma","skema","inseec","bsc","esc"],
  "ingé":              ["ingénieur","polytechnique","supélec","centralesupélec","centrale ","insa","ensimag","ensta","imt ","enseirb","cpe ","telecom","supaero","enac","ponts","mines","ensma","esiea","epitech","42 ","isep","esigelec"],
  "université":        ["université","univ.","sorbonne","paris-saclay","sciences po","iep","iae ","iut ","ifsi"],
  "BTS":               ["bts","iut","but ","lp ","lycée professionnel"],
  "lycée":             ["lycée","cpge","prép","prépa"],
};

function inferType(nom) {
  const n = nom.toLowerCase();
  for (const [type, kws] of Object.entries(TYPE_KEYWORDS)) {
    if (kws.some((kw) => n.includes(kw))) return type;
  }
  return "autre";
}

/* ── Scrapers ────────────────────────────────────────────────────────────────*/

/**
 * L'Étudiant — annuaire JPO
 * URL : https://www.letudiant.fr/etudes/annuaire-enseignement-superieur/journees-portes-ouvertes.html
 */
async function scrapeLetudiant() {
  const BASE = "https://www.letudiant.fr";
  const url  = `${BASE}/etudes/annuaire-enseignement-superieur/journees-portes-ouvertes.html`;
  const results = [];

  try {
    const html = await fetchHTML(url);
    const $    = cheerio.load(html);

    // Sélecteurs probables basés sur la structure habituelle de letudiant.fr
    const items = $(".card-school, .school-card, .list-item-jpo, article.jpo, .jpo-item, [class*='jpo']");
    console.log(`  letudiant.fr → ${items.length} éléments trouvés`);

    items.each((_, el) => {
      const $el    = $(el);
      const nom    = $el.find("h2, h3, .school-name, .card-title, [class*='name']").first().text().trim();
      const rawDate = $el.find(".date, time, [class*='date'], [class*='when']").first().text().trim()
                   || $el.find("time").attr("datetime");
      const ville   = $el.find(".city, .lieu, [class*='city'], [class*='ville'], [class*='lieu']").first().text().trim();
      const link    = $el.find("a").first().attr("href");

      if (!nom || nom.length < 3) return;
      const date = formatDateISO(parseDate(rawDate));
      if (!date) return;

      results.push({
        nom_ecole:        nom.slice(0, 200),
        date,
        ville:            ville || "France",
        region:           inferRegion(ville),
        type_ecole:       inferType(nom),
        lien_inscription: link ? (link.startsWith("http") ? link : BASE + link) : null,
        source_url:       url,
      });
    });

    // Fallback : chercher tous les liens contenant "jpo" ou "portes-ouvertes"
    if (results.length === 0) {
      $("a[href*='portes-ouvertes'], a[href*='jpo']").each((_, el) => {
        const $el  = $(el);
        const text = $el.text().trim();
        if (text.length > 5 && text.length < 150) {
          const href = $el.attr("href");
          results.push({
            nom_ecole:        text,
            date:             formatDateISO(new Date(new Date().setDate(new Date().getDate() + 30))) ?? "",
            ville:            "France",
            region:           "France",
            type_ecole:       inferType(text),
            lien_inscription: href?.startsWith("http") ? href : href ? BASE + href : null,
            source_url:       url,
          });
        }
      });
    }
  } catch (err) {
    console.error(`  ❌  letudiant.fr: ${err.message}`);
  }

  return results;
}

/**
 * Diplomeo — salons étudiants
 * URL : https://diplomeo.com/actualite-salons_etudiants
 */
async function scrapeDiplomeo() {
  const BASE = "https://diplomeo.com";
  const url  = `${BASE}/actualite-salons_etudiants`;
  const results = [];

  try {
    const html = await fetchHTML(url);
    const $    = cheerio.load(html);

    // Diplomeo utilise généralement des articles de blog listés
    const items = $("article, .event-card, .salon-item, .article-item, [class*='event'], [class*='salon']");
    console.log(`  diplomeo.com → ${items.length} éléments trouvés`);

    items.each((_, el) => {
      const $el     = $(el);
      const nom     = $el.find("h1, h2, h3, .title, [class*='title']").first().text().trim();
      const rawDate = $el.find("time, .date, [class*='date'], [datetime]").first().text().trim()
                    || $el.find("[datetime]").attr("datetime");
      const villeRaw = $el.find(".location, .city, .lieu, [class*='city'], [class*='lieu']").first().text().trim();
      const link     = $el.find("a").first().attr("href");

      if (!nom || nom.length < 3) return;
      const date = formatDateISO(parseDate(rawDate));
      if (!date) return;

      const ville = villeRaw || "France";
      results.push({
        nom_ecole:        nom.slice(0, 200),
        date,
        ville,
        region:           inferRegion(ville),
        type_ecole:       inferType(nom),
        lien_inscription: link ? (link.startsWith("http") ? link : BASE + link) : null,
        source_url:       url,
      });
    });

    // Fallback : liens directs vers les événements
    if (results.length === 0) {
      $("a[href*='jpo'], a[href*='journee-portes-ouvertes'], a[href*='portes-ouvertes']").each((_, el) => {
        const $el  = $(el);
        const text = $el.text().trim();
        const href = $el.attr("href");
        if (text.length > 5) {
          results.push({
            nom_ecole:        text.slice(0, 200),
            date:             formatDateISO(new Date(Date.now() + 45 * 86400000)) ?? "",
            ville:            "France",
            region:           "France",
            type_ecole:       inferType(text),
            lien_inscription: href?.startsWith("http") ? href : href ? BASE + href : null,
            source_url:       url,
          });
        }
      });
    }
  } catch (err) {
    console.error(`  ❌  diplomeo.com: ${err.message}`);
  }

  return results;
}

/**
 * ONISEP — calendrier JPO
 * URL : https://www.onisep.fr/Calendrier/Journees-Portes-Ouvertes
 */
async function scrapeOnisep() {
  const url  = "https://www.onisep.fr/Calendrier/Journees-Portes-Ouvertes";
  const results = [];

  try {
    const html = await fetchHTML(url);
    const $    = cheerio.load(html);

    // ONISEP a une structure de table ou de liste pour les événements
    const items = $(
      "tr.event, .event-row, .jpo-item, .calendar-item, " +
      "table tbody tr, .events-list li, .list-events article, " +
      "[class*='event'], [class*='jpo'], [class*='porte']"
    );
    console.log(`  onisep.fr → ${items.length} éléments trouvés`);

    items.each((_, el) => {
      const $el     = $(el);
      const text    = $el.text().trim();
      if (!text || text.length < 10) return;

      // Essaye d'extraire nom, date, ville depuis les cellules / sous-éléments
      const cells  = $el.find("td, .cell, [class*='col']").toArray();
      const nom    = (cells[0] ? $(cells[0]).text().trim() : $el.find("h2,h3,.title").first().text().trim());
      const rawDate= (cells[1] ? $(cells[1]).text().trim() : $el.find("time,.date").first().text().trim());
      const ville  = (cells[2] ? $(cells[2]).text().trim() : $el.find(".city,.ville,.lieu").first().text().trim());
      const link   = $el.find("a").first().attr("href");

      if (!nom || nom.length < 3) return;
      const date = formatDateISO(parseDate(rawDate));
      if (!date) return;

      results.push({
        nom_ecole:        nom.slice(0, 200),
        date,
        ville:            ville || "France",
        region:           inferRegion(ville || ""),
        type_ecole:       inferType(nom),
        lien_inscription: link?.startsWith("http") ? link : link ? `https://www.onisep.fr${link}` : null,
        source_url:       url,
      });
    });
  } catch (err) {
    console.error(`  ❌  onisep.fr: ${err.message}`);
  }

  return results;
}

/* ── Upsert Supabase ─────────────────────────────────────────────────────────*/

async function upsertJpos(rows) {
  if (rows.length === 0) return { inserted: 0, errors: 0 };

  // Filtre les lignes invalides
  const valid = rows.filter((r) => r.nom_ecole && r.date && /^\d{4}-\d{2}-\d{2}$/.test(r.date));
  console.log(`  Upsert de ${valid.length} JPOs valides…`);

  const BATCH = 50;
  let inserted = 0;
  let errors   = 0;

  for (let i = 0; i < valid.length; i += BATCH) {
    const batch = valid.slice(i, i + BATCH);
    const { error, count } = await supabase
      .from("jpos")
      .upsert(batch, { onConflict: "nom_ecole,date", ignoreDuplicates: false })
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error(`  ❌  Batch ${i / BATCH + 1}: ${error.message}`);
      errors += batch.length;
    } else {
      inserted += count ?? batch.length;
    }
  }

  return { inserted, errors };
}

/* ── Main ────────────────────────────────────────────────────────────────────*/

async function main() {
  console.log("\n🎓  Springr — Scraper JPO");
  console.log("=".repeat(50));
  const start = Date.now();

  const allRows = [];

  console.log("\n📡  Scraping L'Étudiant…");
  allRows.push(...(await scrapeLetudiant()));
  await sleep(DELAY_MS);

  console.log("\n📡  Scraping Diplomeo…");
  allRows.push(...(await scrapeDiplomeo()));
  await sleep(DELAY_MS);

  console.log("\n📡  Scraping ONISEP…");
  allRows.push(...(await scrapeOnisep()));

  console.log(`\n📦  Total scraped: ${allRows.length} JPOs`);

  if (allRows.length > 0) {
    console.log("\n💾  Upsert Supabase…");
    const { inserted, errors } = await upsertJpos(allRows);
    console.log(`  ✅  ${inserted} insérées/mises à jour · ${errors} erreurs`);
  } else {
    console.log("\n⚠️  Aucune JPO scrapée — vérifiez les sélecteurs HTML.");
    console.log("   Les sites cibles peuvent avoir changé leur structure ou bloquer les bots.");
    console.log("   Les données de seed dans la migration restent disponibles.");
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n⏱️  Terminé en ${elapsed}s\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
