#!/usr/bin/env node
/**
 * Import tous les établissements d'enseignement supérieur français
 * depuis l'API officielle MENESR (data.enseignementsup-recherche.gouv.fr)
 *
 * Usage: node scripts/import-ecoles-complet.js
 */

const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || "https://ujjpfcdcyvdliofvadul.supabase.co";
if (!SERVICE_KEY) { console.error("Missing SUPABASE_SERVICE_KEY env var"); process.exit(1); }

// ── Helpers ────────────────────────────────────────────────────────────────────

function slug(name, city) {
  const base = (name + (city ? `-${city}` : ""))
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base;
}

function typeEtab(apiTypes) {
  if (!apiTypes?.length) return null;
  const raw = Array.isArray(apiTypes) ? apiTypes[0] : apiTypes;
  const t = raw.toLowerCase();
  if (t.includes("université")) return "Université";
  if (t.includes("ingénieur") || t.includes("ingenieur")) return "École d'ingénieurs";
  if (t.includes("commerce") || t.includes("gestion") || t.includes("management"))
    return "École de commerce et de gestion";
  if (t.includes("normale supérieure") || t.includes("ens")) return "École normale supérieure";
  if (t.includes("politiques") || t.includes("iep")) return "Institut d'études politiques";
  if (t.includes("iut") || t.includes("universitaire de technologie"))
    return "Institut universitaire de technologie";
  if (t.includes("art") || t.includes("design") || t.includes("architecture"))
    return "École d'art et de design";
  if (t.includes("école")) return "Grande école";
  return raw;
}

function broadType(typeEt) {
  if (!typeEt) return "Grande école";
  if (typeEt === "Université") return "Université";
  if (typeEt === "Institut universitaire de technologie") return "Université";
  return "Grande école";
}

function statut(secteur) {
  if (!secteur) return "public";
  const s = secteur.toLowerCase();
  if (s.includes("privé") || s.includes("prive")) return "privé";
  return "public";
}

function anneeCreation(dateStr) {
  if (!dateStr) return null;
  const y = parseInt(dateStr.slice(0, 4), 10);
  return Number.isFinite(y) ? y : null;
}

// ── Fetch from MENESR ──────────────────────────────────────────────────────────

async function fetchMENESR() {
  const BASE =
    "https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-principaux-etablissements-enseignement-superieur/records";
  const LIMIT = 100;
  let offset = 0;
  let total = null;
  const all = [];

  while (true) {
    const url = `${BASE}?limit=${LIMIT}&offset=${offset}`;
    const res = await fetch(url);
    const json = await res.json();

    if (total === null) total = json.total_count ?? 0;

    const records = json.results ?? [];
    if (!records.length) break;

    for (const r of records) {
      const name =
        r.uo_lib_officiel || r.uo_lib || r.sigle || "Inconnu";
      const city = r.com_nom || r.localite_acheminement_uai || null;
      const region = r.reg_nom || null;
      const typeEt = typeEtab(r.type_d_etablissement);
      const lat = r.coordonnees?.lat ?? null;
      const lon = r.coordonnees?.lon ?? null;
      const inscrits =
        r.inscrits_2024 ?? r.inscrits_2023 ?? r.inscrits_2022 ?? null;

      const row = {
        name,
        sigle: r.sigle || null,
        type: broadType(typeEt),
        type_etablissement: typeEt,
        city,
        region,
        code_postal: r.code_postal_uai || null,
        adresse: r.adresse_uai || null,
        telephone: r.numero_telephone_uai || null,
        site_web: r.url || null,
        statut: statut(r.secteur_d_etablissement),
        lat,
        lng: lon,
        nombre_etudiants: inscrits ? Math.round(inscrits) : null,
        annee_creation: anneeCreation(r.date_creation),
        compte_instagram: r.compte_instagram || null,
        compte_linkedin: r.compte_linkedin || null,
        compte_twitter: r.compte_twitter || null,
        slug: slug(name, city),
      };
      all.push(row);
    }

    console.log(`  Fetched ${Math.min(offset + LIMIT, total)}/${total}...`);
    offset += LIMIT;
    if (offset >= total) break;
  }

  return all;
}

// ── Upsert to Supabase ─────────────────────────────────────────────────────────

async function fetchExistingSlugs() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/ecoles?select=id,slug&limit=2000`,
    {
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
      },
    }
  );
  const rows = await res.json();
  // Returns Map<slug, id>
  return new Map(rows.map((r) => [r.slug, r.id]));
}

function deduplicateSlugs(rows, existingMap) {
  const seen = new Set([...existingMap.keys()]);
  return rows.map((r) => {
    if (!seen.has(r.slug)) {
      seen.add(r.slug);
      return r;
    }
    // Already exists — mark for patch, not insert
    r._existingId = existingMap.get(r.slug) ?? null;
    return r;
  });
}

async function insertBatch(rows) {
  if (!rows.length) return;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ecoles`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Insert error ${res.status}: ${body}`);
  }
}

async function patchRow(id, row) {
  const { _existingId: _, slug: _s, ...patch } = row;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ecoles?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`  PATCH ${id}: ${body}`);
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Import établissements MENESR ===\n");

  console.log("Fetching depuis data.enseignementsup-recherche.gouv.fr...");
  const rows = await fetchMENESR();
  console.log(`\n✓ ${rows.length} établissements récupérés\n`);

  console.log("Chargement des slugs existants...");
  const existingMap = await fetchExistingSlugs();
  console.log(`  ${existingMap.size} établissements déjà en base\n`);

  const tagged = deduplicateSlugs(rows, existingMap);
  const toInsert = tagged.filter((r) => !r._existingId);
  const toUpdate = tagged.filter((r) => r._existingId);

  // Insert new records in batches of 50
  const BATCH = 50;
  let done = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    await insertBatch(batch);
    done += batch.length;
    process.stdout.write(`  Insert ${done}/${toInsert.length} nouveaux...\r`);
  }
  if (toInsert.length) console.log(`\n  ✓ ${toInsert.length} nouveaux insérés`);

  // Patch existing records
  let patched = 0;
  for (const r of toUpdate) {
    await patchRow(r._existingId, r);
    patched++;
    if (patched % 10 === 0) process.stdout.write(`  Patch ${patched}/${toUpdate.length} existants...\r`);
  }
  if (toUpdate.length) console.log(`\n  ✓ ${toUpdate.length} existants mis à jour`);

  console.log(`\n\n✓ Upsert terminé : ${rows.length} établissements traités`);

  // Final count
  const count = await fetch(
    `${SUPABASE_URL}/rest/v1/ecoles?select=type_etablissement`,
    {
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
        Prefer: "count=exact",
      },
    }
  );
  const total = count.headers.get("Content-Range")?.split("/")[1] ?? "?";
  console.log(`\n  Total en base : ${total} établissements`);
}

main().catch((e) => {
  console.error("\n✗ Erreur :", e.message);
  process.exit(1);
});
