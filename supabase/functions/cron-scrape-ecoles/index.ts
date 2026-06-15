/**
 * cron-scrape-ecoles — Deno Edge Function
 * Fetches French school data from official government APIs and upserts to Supabase.
 * Trigger monthly via pg_cron:
 *   SELECT cron.schedule('scrape-ecoles', '0 3 1 * *',
 *     $$SELECT net.http_post(url:='<SUPABASE_URL>/functions/v1/cron-scrape-ecoles',
 *              headers:'{"Authorization":"Bearer <SERVICE_ROLE_KEY>"}')$$);
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase     = createClient(SUPABASE_URL, SERVICE_KEY);
const BATCH        = 100;

// ── Slug ─────────────────────────────────────────────────────────────────────

const seenSlugs = new Set<string>();

function toSlug(name: string, city = ""): string {
  const base = city ? `${name}-${city}` : name;
  return base
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function uniqueSlug(name: string, city: string): string {
  let slug = toSlug(name, city);
  if (!seenSlugs.has(slug)) { seenSlugs.add(slug); return slug; }
  let i = 2;
  while (seenSlugs.has(`${slug}-${i}`)) i++;
  const s = `${slug}-${i}`;
  seenSlugs.add(s);
  return s;
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function fetchAll(
  baseUrl: string,
  params: Record<string, string> = {},
  maxPages = 50
): Promise<unknown[]> {
  const records: unknown[] = [];
  let offset = 0;

  for (let page = 0; page < maxPages; page++) {
    const url = new URL(baseUrl);
    url.searchParams.set("limit", String(BATCH));
    url.searchParams.set("offset", String(offset));
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    const res = await fetch(url.toString());
    if (!res.ok) break;

    const json = await res.json() as { results?: unknown[]; total_count?: number };
    const batch = json.results ?? [];
    if (!batch.length) break;

    records.push(...batch);
    offset += batch.length;
    if (json.total_count && offset >= json.total_count) break;

    await new Promise((r) => setTimeout(r, 300));
  }

  return records;
}

// ── Scrapers ──────────────────────────────────────────────────────────────────

interface EcoleRow {
  name: string; type: string; city: string;
  type_etablissement: string | null; statut: string;
  region: string | null; code_postal: string | null;
  adresse: string | null; telephone: string | null;
  email: string | null; site_web: string | null;
  website: string | null; diplomes: string[];
  nombre_etudiants: number | null; slug: string;
}

async function scrapeSecondaire(): Promise<EcoleRow[]> {
  const TYPES = [
    "Lycée général et technologique","Lycée professionnel","Lycée polyvalent",
    "EREA","Lycée","LP","CPGE","STS",
  ];
  const where = TYPES.map((t) => `type_etablissement="${t}"`).join(" OR ");

  const raw = await fetchAll(
    "https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records",
    {
      select: "nom_etablissement,type_etablissement,statut_public_prive,libelle_commune,nom_region,code_postal_uai,adresse_uai,telephone_uai,mail_uai,url",
      where,
    },
    80
  ) as Record<string, string>[];

  return raw
    .filter((r) => r.nom_etablissement && r.libelle_commune)
    .map((r) => {
      const name = r.nom_etablissement.trim();
      const city = r.libelle_commune.trim();
      return {
        name, city,
        type: r.type_etablissement || "Lycée",
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
        nombre_etudiants: null,
        slug: uniqueSlug(name, city),
      };
    });
}

async function scrapeSup(): Promise<EcoleRow[]> {
  const raw = await fetchAll(
    "https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-principaux-etablissements-enseignement-superieur/records",
    { select: "uo_lib,type_d_etablissement,statut,com_nom,reg_nom,cp_uai,adresse_uai,telephone_uai,url_en,mail,effectif_1" },
    30
  ) as Record<string, string>[];

  return raw
    .filter((r) => r.uo_lib && r.com_nom)
    .map((r) => {
      const name = r.uo_lib.trim();
      const city = r.com_nom.trim();
      const statut = (r.statut || "").toLowerCase().includes("priv") ? "privé" : "public";
      const type = (r.type_d_etablissement || "").toLowerCase();
      const diplomes =
        type.includes("commerce") || type.includes("gestion") ? ["Grande École (M2)", "MSc", "MBA"] :
        type.includes("ingénieur") || type.includes("ingenieur") ? ["Cycle ingénieur (M2)", "Master", "Doctorat"] :
        type.includes("iut") ? ["BUT (Bac+3)", "Licence pro"] :
        ["Licence", "Master", "Doctorat"];

      return {
        name, city,
        type: r.type_d_etablissement || "Établissement supérieur",
        type_etablissement: r.type_d_etablissement || null,
        statut,
        region: r.reg_nom || null,
        code_postal: r.cp_uai || null,
        adresse: r.adresse_uai || null,
        telephone: r.telephone_uai || null,
        email: r.mail || null,
        site_web: r.url_en || null,
        website: r.url_en || null,
        nombre_etudiants: r.effectif_1 ? (parseInt(r.effectif_1) || null) : null,
        diplomes,
        slug: uniqueSlug(name, city),
      };
    });
}

// ── Upsert ────────────────────────────────────────────────────────────────────

async function upsert(rows: EcoleRow[]) {
  let ok = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await supabase
      .from("ecoles")
      .upsert(rows.slice(i, i + BATCH), { onConflict: "slug" });
    if (!error) ok += Math.min(BATCH, rows.length - i);
  }
  return ok;
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.includes(SERVICE_KEY.slice(0, 20))) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const [secondaire, sup] = await Promise.all([scrapeSecondaire(), scrapeSup()]);
    const all = [...secondaire, ...sup];
    const inserted = await upsert(all);

    return Response.json({
      ok: true,
      total: all.length,
      upserted: inserted,
      ts: new Date().toISOString(),
    });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
});
