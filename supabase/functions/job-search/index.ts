// Supabase Edge Function — job-search
// Proxies France Travail API (OAuth2 server-side) + La Bonne Alternance
// Caches results in offres_cache table for 6 hours
//
// Deploy: supabase functions deploy job-search
// Secrets: supabase secrets set FRANCE_TRAVAIL_CLIENT_ID=xxx FRANCE_TRAVAIL_CLIENT_SECRET=xxx

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-client-info, apikey",
  "Content-Type": "application/json",
};

const FT_TOKEN_URL = "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire";
const FT_SEARCH_URL = "https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search";
const LBA_SEARCH_URL = "https://labonnealternance.apprentissage.beta.gouv.fr/api/v1/jobs/matcha";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// Module-level token cache (warm within a Deno isolate)
let ftToken: string | null = null;
let ftTokenExpiry = 0;

// ── France Travail contract type mapping ──────────────────────────────────────
const SPRINGR_TO_FT: Record<string, string> = {
  stage:       "E2",   // Stage: natureContrat E2
  cdi:         "CDI",
  cdd:         "CDD",
  job:         "CDD",  // Job étudiant ~ CDD
  alternance:  "",     // handled by La Bonne Alternance
};

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  const url    = new URL(req.url);
  const params = url.searchParams;

  const keywords  = params.get("q")         ?? "";
  const type      = params.get("type")      ?? "tous";
  const city      = params.get("city")      ?? "";
  const sector    = params.get("sector")    ?? "";
  const education = params.get("education") ?? "";
  const page      = parseInt(params.get("page") ?? "1", 10);
  const perPage   = 20;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // ── 1. Check cache ───────────────────────────────────────────────────────
  const cacheKey = `${type}|${keywords}|${city}|${sector}|${education}|${page}`;
  const queryHash = btoa(cacheKey).replace(/[^a-zA-Z0-9]/g, "");

  const { data: cached } = await supabase
    .from("offres_cache")
    .select("data, expires_at")
    .eq("query_hash", queryHash)
    .maybeSingle();

  if (cached && new Date(cached.expires_at) > new Date()) {
    return new Response(JSON.stringify({ ...cached.data, cached: true }), { headers: CORS });
  }

  // ── 2. Fetch from external APIs ──────────────────────────────────────────
  const results = await fetchAll({ keywords, type, city, sector, education, page, perPage });

  // ── 3. Store in cache ────────────────────────────────────────────────────
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS).toISOString();
  await supabase.from("offres_cache").upsert({
    query_hash: queryHash,
    source:     "merged",
    data:       results,
    expires_at: expiresAt,
  }, { onConflict: "query_hash" });

  return new Response(JSON.stringify({ ...results, cached: false }), { headers: CORS });
});

// ── Fetch aggregator ──────────────────────────────────────────────────────────

async function fetchAll(p: {
  keywords: string; type: string; city: string; sector: string;
  education: string; page: number; perPage: number;
}) {
  const ftType = SPRINGR_TO_FT[p.type] ?? "";
  const doLBA  = p.type === "tous" || p.type === "alternance";
  const doFT   = p.type !== "alternance";

  const [ftResult, lbaResult] = await Promise.allSettled([
    doFT  ? fetchFranceTravail({ ...p, ftType }) : Promise.resolve([]),
    doLBA ? fetchBonneAlternance(p) : Promise.resolve([]),
  ]);

  const ftOffers  = ftResult.status  === "fulfilled" ? (ftResult.value as JobOffer[])  : [];
  const lbaOffers = lbaResult.status === "fulfilled" ? (lbaResult.value as JobOffer[]) : [];

  // Deduplicate by normalising title+company
  const seen = new Set<string>();
  const merged: JobOffer[] = [];
  for (const o of [...ftOffers, ...lbaOffers]) {
    const key = `${o.title.toLowerCase().trim()}|${o.company.toLowerCase().trim()}`;
    if (!seen.has(key)) { seen.add(key); merged.push(o); }
  }

  // Sort by date desc
  merged.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const start = (p.page - 1) * p.perPage;
  return {
    offers: merged.slice(start, start + p.perPage),
    total:  merged.length,
    page:   p.page,
    perPage: p.perPage,
    sources: {
      france_travail:   ftOffers.length,
      bonne_alternance: lbaOffers.length,
    },
    errors: {
      france_travail:   ftResult.status  === "rejected" ? (ftResult.reason as Error).message  : null,
      bonne_alternance: lbaResult.status === "rejected" ? (lbaResult.reason as Error).message : null,
    },
  };
}

// ── France Travail ─────────────────────────────────────────────────────────────

async function getFTToken(): Promise<string> {
  if (ftToken && Date.now() < ftTokenExpiry) return ftToken;
  const clientId     = Deno.env.get("FRANCE_TRAVAIL_CLIENT_ID");
  const clientSecret = Deno.env.get("FRANCE_TRAVAIL_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("France Travail credentials not configured");

  const body = new URLSearchParams({
    grant_type:    "client_credentials",
    client_id:     clientId,
    client_secret: clientSecret,
    scope:         "api_offresdemploiv2 o2dsoffre",
  });

  const res = await fetch(FT_TOKEN_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`FT token error: ${res.status}`);
  const json = await res.json();
  ftToken       = json.access_token;
  ftTokenExpiry = Date.now() + (json.expires_in - 60) * 1000; // subtract 60s safety margin
  return ftToken!;
}

async function fetchFranceTravail(p: {
  keywords: string; city: string; sector: string; education: string;
  ftType: string; page: number; perPage: number;
}): Promise<JobOffer[]> {
  const token = await getFTToken();

  const qs = new URLSearchParams();
  if (p.keywords) qs.set("motsCles",      p.keywords);
  if (p.ftType)   qs.set("typeContrat",   p.ftType);
  if (p.city)     qs.set("lieuTravail",   p.city);
  if (p.sector)   qs.set("secteurActivite", p.sector);
  if (p.education) {
    const lvlMap: Record<string, string> = {
      bac: "3", "bac+2": "4", "bac+3": "5", "bac+5": "6",
    };
    const lvl = lvlMap[p.education.toLowerCase()];
    if (lvl) qs.set("niveauFormation", lvl);
  }

  const start  = (p.page - 1) * p.perPage;
  qs.set("range", `${start}-${start + p.perPage - 1}`);

  const res = await fetch(`${FT_SEARCH_URL}?${qs}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept:        "application/json",
    },
  });
  if (!res.ok) throw new Error(`FT search error: ${res.status}`);

  const json = await res.json();
  return (json.resultats ?? []).map(mapFTOffer);
}

function mapFTOffer(r: Record<string, any>): JobOffer {
  const typeContrat = (r.typeContrat ?? "").toUpperCase();
  let type: JobOffer["type"] = "job";
  if (typeContrat === "CDI") type = "cdi";
  else if (typeContrat === "CDD") type = "cdd";
  else if (r.natureContrat === "E2") type = "stage";
  else if (typeContrat === "APP") type = "alternance";

  const city = (r.lieuTravail?.libelle ?? "").replace(/^\d+ - /, "");

  return {
    id:          `ft-${r.id}`,
    source:      "france_travail",
    title:       r.intitule ?? "",
    company:     r.entreprise?.nom ?? "Entreprise non communiquée",
    city,
    type,
    sector:      r.secteurActiviteLibelle ?? "",
    description: r.description ?? "",
    publishedAt: r.dateCreation ?? new Date().toISOString(),
    applyUrl:    r.origineOffre?.urlOrigine ?? `https://candidat.francetravail.fr/offres/recherche/detail/${r.id}`,
    remote:      (r.lieuTravail?.libelle ?? "").toLowerCase().includes("télétravail"),
    tags:        [r.typeContratLibelle, r.experienceLibelle, r.qualificationLibelle].filter(Boolean).slice(0, 3),
    experience:  r.experienceLibelle ?? "",
    education:   r.niveauFormationLibelle ?? "",
    salary:      r.salaire?.libelle ?? "",
  };
}

// ── La Bonne Alternance ───────────────────────────────────────────────────────

// City → approximate coordinates for major French cities
const CITY_COORDS: Record<string, [number, number]> = {
  "paris":       [48.8566,  2.3522],
  "lyon":        [45.7640,  4.8357],
  "marseille":   [43.2965,  5.3698],
  "bordeaux":    [44.8378, -0.5792],
  "toulouse":    [43.6047,  1.4442],
  "nantes":      [47.2184, -1.5536],
  "strasbourg":  [48.5734,  7.7521],
  "lille":       [50.6292,  3.0573],
  "nice":        [43.7102,  7.2620],
  "rennes":      [48.1173, -1.6778],
  "montpellier": [43.6108,  3.8767],
  "grenoble":    [45.1885,  5.7245],
  "tours":       [47.3941,  0.6848],
  "metz":        [49.1193,  6.1757],
  "nancy":       [48.6921,  6.1844],
};

// Common student-relevant ROME codes
const DEFAULT_ROMES = "M1805,M1803,M1807,M1403,M1702,E1104,D1406,K2401,H2502";

async function fetchBonneAlternance(p: {
  keywords: string; city: string; sector: string; page: number; perPage: number;
}): Promise<JobOffer[]> {
  const cityKey = p.city.toLowerCase().trim();
  const coords  = CITY_COORDS[cityKey] ?? CITY_COORDS["paris"];

  const qs = new URLSearchParams({
    caller:    "springr",
    longitude: String(coords[1]),
    latitude:  String(coords[0]),
    radius:    "30",
    romes:     DEFAULT_ROMES,
  });

  const res = await fetch(`${LBA_SEARCH_URL}?${qs}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`LBA error: ${res.status}`);

  const json = await res.json();
  const items = json.matchas ?? json.jobs ?? json.results ?? [];
  return (items as Record<string, any>[]).map(mapLBAOffer);
}

function mapLBAOffer(r: Record<string, any>): JobOffer {
  const job  = r.job ?? r;
  const comp = r.company ?? r.entreprise ?? {};
  return {
    id:          `lba-${r.id ?? r._id ?? crypto.randomUUID()}`,
    source:      "bonne_alternance",
    title:       job.title ?? job.appellationlibelle ?? r.title ?? "Alternance",
    company:     comp.name ?? comp.nom ?? "Entreprise",
    city:        job.location?.city ?? comp.city ?? comp.ville ?? "France",
    type:        "alternance",
    sector:      job.rome_appellation_label ?? r.romeLabel ?? "Alternance",
    description: job.description ?? r.description ?? "",
    publishedAt: job.createdAt ?? r.createdAt ?? new Date().toISOString(),
    applyUrl:    r.url ?? r.applyUrl ?? `https://labonnealternance.apprentissage.beta.gouv.fr/recherche-apprentissage`,
    remote:      false,
    tags:        ["Alternance", job.contractType ?? "Apprentissage"].filter(Boolean),
    experience:  "",
    education:   "",
    salary:      job.salary ?? "",
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface JobOffer {
  id:          string;
  source:      "france_travail" | "bonne_alternance";
  title:       string;
  company:     string;
  city:        string;
  type:        "stage" | "alternance" | "cdi" | "cdd" | "job";
  sector:      string;
  description: string;
  publishedAt: string;
  applyUrl:    string;
  remote:      boolean;
  tags:        string[];
  experience?: string;
  education?:  string;
  salary?:     string;
}
