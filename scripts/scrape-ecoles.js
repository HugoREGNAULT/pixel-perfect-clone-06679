/**
 * scrape-ecoles.js
 * Fetches French school data from 3 official government APIs and upserts to Supabase.
 *
 * APIs used:
 *   1. Annuaire Éducation Nationale (secondary schools)
 *   2. Établissements enseignement supérieur (higher ed)
 *   3. Diplômes & formations enseignement supérieur (diploma data)
 *
 * Run: node --env-file=.env scripts/scrape-ecoles.js
 * Env required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BATCH = 100;
const DELAY = 500; // ms between API calls

// ── Slug generation ──────────────────────────────────────────────────────────

const seenSlugs = new Set();

function toSlug(name, city = "") {
  const base = city ? `${name}-${city}` : name;
  return base
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[œ]/g, "oe")
    .replace(/[æ]/g, "ae")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function uniqueSlug(name, city) {
  let slug = toSlug(name, city);
  if (!seenSlugs.has(slug)) { seenSlugs.add(slug); return slug; }
  let i = 2;
  while (seenSlugs.has(`${slug}-${i}`)) i++;
  const s = `${slug}-${i}`;
  seenSlugs.add(s);
  return s;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchAll(baseUrl, params = {}) {
  const records = [];
  let offset = 0;
  let total = null;

  while (total === null || offset < total) {
    const url = new URL(baseUrl);
    url.searchParams.set("limit", BATCH);
    url.searchParams.set("offset", offset);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    const res = await fetch(url.toString());
    if (!res.ok) {
      console.warn(`HTTP ${res.status} at offset ${offset} for ${baseUrl}`);
      break;
    }

    const json = await res.json();
    total = json.total_count ?? 0;
    const batch = json.results ?? [];
    if (!batch.length) break;

    records.push(...batch);
    offset += batch.length;

    const pct = total ? Math.round((offset / total) * 100) : "?";
    process.stdout.write(`\r  ${offset}/${total} (${pct}%)`);

    await sleep(DELAY);
  }

  console.log(); // newline after progress
  return records;
}

// ── Dataset 1: Annuaire Éducation Nationale ─────────────────────────────────

async function scrapeSecondaire() {
  console.log("\n[1/3] Annuaire Éducation Nationale (lycées & post-bac)…");

  // Filter to secondary & post-bac types only (skip primaire/collège to avoid 66k+ rows)
  const SECONDARY_TYPES = [
    "Lycée général et technologique",
    "Lycée professionnel",
    "Lycée polyvalent",
    "EREA",
    "Lycée",
    "LP",
    "CPGE",
    "STS",
    "Etablissement régional d'enseignement adapté",
  ];

  const whereClause = SECONDARY_TYPES.map((t) => `type_etablissement="${t}"`).join(" OR ");

  const raw = await fetchAll(
    "https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records",
    {
      select: "nom_etablissement,type_etablissement,statut_public_prive,libelle_commune,nom_region,code_postal_uai,adresse_uai,telephone_uai,mail_uai,url",
      where: whereClause,
    }
  );

  return raw
    .filter((r) => r.nom_etablissement && r.libelle_commune)
    .map((r) => {
      const name = r.nom_etablissement?.trim();
      const city = r.libelle_commune?.trim();
      return {
        name,
        type: r.type_etablissement || "Lycée",
        city,
        type_etablissement: r.type_etablissement || null,
        statut: r.statut_public_prive === "Privé" ? "privé" : "public",
        region: r.nom_region || null,
        code_postal: r.code_postal_uai || null,
        adresse: r.adresse_uai || null,
        telephone: r.telephone_uai || null,
        email: r.mail_uai || null,
        site_web: r.url || null,
        website: r.url || null,
        diplomes: r.type_etablissement?.includes("STS") ? ["BTS"] :
                  r.type_etablissement?.includes("CPGE") ? ["CPGE"] : ["Baccalauréat"],
        slug: uniqueSlug(name, city),
      };
    });
}

// ── Dataset 2: Enseignement Supérieur ────────────────────────────────────────

async function scrapeSup() {
  console.log("\n[2/3] Établissements enseignement supérieur…");

  const raw = await fetchAll(
    "https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-principaux-etablissements-enseignement-superieur/records",
    {
      select: "uo_lib,type_d_etablissement,statut,com_nom,reg_nom,cp_uai,adresse_uai,telephone_uai,url_en,mail,effectif_1",
    }
  );

  return raw
    .filter((r) => (r.uo_lib || r.uo_lib_officiel) && r.com_nom)
    .map((r) => {
      const name = (r.uo_lib || r.uo_lib_officiel)?.trim();
      const city = r.com_nom?.trim();
      const statut = (r.statut || "").toLowerCase().includes("priv") ? "privé" : "public";

      let diplomes = ["Licence", "Master"];
      const type = (r.type_d_etablissement || "").toLowerCase();
      if (type.includes("commerce") || type.includes("gestion"))
        diplomes = ["Grande École (M2)", "MSc", "MBA"];
      else if (type.includes("ingénieur") || type.includes("ingenieur"))
        diplomes = ["Cycle ingénieur (M2)", "Master", "Doctorat"];
      else if (type.includes("iut"))
        diplomes = ["BUT (Bac+3)", "Licence pro"];
      else if (type.includes("université") || type.includes("universite"))
        diplomes = ["Licence", "Master", "Doctorat"];

      return {
        name,
        type: r.type_d_etablissement || "Établissement supérieur",
        city,
        type_etablissement: r.type_d_etablissement || null,
        statut,
        region: r.reg_nom || null,
        code_postal: r.cp_uai || null,
        adresse: r.adresse_uai || null,
        telephone: r.telephone_uai || null,
        email: r.mail || null,
        site_web: r.url_en || null,
        website: r.url_en || null,
        nombre_etudiants: r.effectif_1 ? parseInt(r.effectif_1) || null : null,
        diplomes,
        slug: uniqueSlug(name, city),
      };
    });
}

// ── Dataset 3: Diplômes (enrich existing schools) ───────────────────────────

async function scrapeDiplomes() {
  console.log("\n[3/3] Diplômes et formations enseignement supérieur…");

  const raw = await fetchAll(
    "https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-principaux-diplomes-et-formations-prepares-etablissements-publics/records",
    {
      select: "libelle_uai,lib_dis,lib_domaine",
    }
  );

  // Group diplomas by school name
  const map = new Map();
  for (const r of raw) {
    if (!r.libelle_uai || !r.lib_dis) continue;
    const key = r.libelle_uai.trim();
    if (!map.has(key)) map.set(key, new Set());
    map.get(key).add(r.lib_dis.trim());
  }

  return map; // Map<schoolName, Set<diplomaName>>
}

// ── Upsert to Supabase ───────────────────────────────────────────────────────

async function upsertBatch(rows) {
  const { error } = await supabase
    .from("ecoles")
    .upsert(rows, { onConflict: "slug", ignoreDuplicates: false });

  if (error) console.error("  Upsert error:", error.message);
  return !error;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Springr — Scraper écoles France ===");
  const t0 = Date.now();

  const [secondaire, sup, diplomesMap] = await Promise.all([
    scrapeSecondaire(),
    scrapeSup(),
    scrapeDiplomes(),
  ]);

  // Enrich supérieur with diploma data
  for (const school of sup) {
    const extra = diplomesMap.get(school.name);
    if (extra?.size) {
      const merged = new Set([...school.diplomes, ...extra]);
      school.diplomes = [...merged].slice(0, 20);
    }
  }

  const all = [...secondaire, ...sup];
  console.log(`\nTotal: ${all.length} établissements — upsert en cours…`);

  let inserted = 0;
  for (let i = 0; i < all.length; i += BATCH) {
    const slice = all.slice(i, i + BATCH);
    const ok = await upsertBatch(slice);
    if (ok) inserted += slice.length;
    process.stdout.write(`\r  ${Math.min(i + BATCH, all.length)}/${all.length}`);
    await sleep(100);
  }

  console.log(`\n\nTerminé en ${((Date.now() - t0) / 1000).toFixed(1)}s — ${inserted}/${all.length} upserted.`);
}

main().catch(console.error);
