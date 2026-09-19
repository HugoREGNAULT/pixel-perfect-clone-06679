// Supabase Edge Function — job-search v2
// Proxies France Travail API (OAuth2) + Apprentissage API
// Caches results in offres_cache table for 1 hour
// Fetches max volume with parallel ROME code batches

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, x-client-info, apikey",
  "Content-Type": "application/json",
};

const FT_TOKEN_URL = "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire";
const FT_SEARCH_URL = "https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search";
const APPRENTISSAGE_SEARCH_URL = "https://api.apprentissage.beta.gouv.fr/api/job/v1/search";
const CACHE_TTL_MS = 1 * 60 * 60 * 1000; // 1 hour

let ftToken: string | null = null;
let ftTokenExpiry = 0;

// ── All ROME codes for major domains (100+ codes) ────────────────────────
const ALL_ROME_CODES = "M1101,M1102,M1201,M1202,M1203,M1301,M1302,M1303,M1401,M1402,M1403,M1404,M1405,M1501,M1502,M1503,M1601,M1602,M1603,M1604,M1701,M1702,M1703,M1704,M1801,M1802,M1803,M1804,M1805,M1806,M2101,M2102,M2103,M2104,M2105,M2161,M2162,M2171,M2172,M2173,M2181,M2182,M2201,M2202,M2203,M2204,M2205,M2301,M2302,M2303,M2304,M2305,M3101,M3102,M3103,M3104,M3105,M3201,M3202,M3203,M3204,M3205,M3301,M3302,M3303,M3304,M3305,M3401,M3402,M3403,M3404,M3405,M3501,M3502,M3503,M3504,M3505,M3601,M3602,M3603,M3604,M3605,M3701,M3702,M3703,M3704,M3705,M3801,M3802,M3803,M3804,M3805,M3901,M3902,M3903,M4101,M4102";

// Split into batches of max 20 codes per request
function getRomeBatches(): string[] {
  const codes = ALL_ROME_CODES.split(",");
  const batches: string[] = [];
  for (let i = 0; i < codes.length; i += 20) {
    batches.push(codes.slice(i, i + 20).join(","));
  }
  return batches;
}

// Decode HTML entities
function decodeHtml(text: string): string {
  const map: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
  };
  return text.replace(/&[^;]+;/g, (entity) => map[entity] || entity);
}

// France Travail contract type mapping
const SPRINGR_TO_FT: Record<string, string> = {
  stage: "E2",
  cdi: "CDI",
  cdd: "CDD",
  job: "CDD",
  alternance: "",
};

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  const url = new URL(req.url);
  const params = url.searchParams;

  const keywords = params.get("q") ?? "";
  const type = params.get("type") ?? "tous";
  const city = params.get("city") ?? "";
  const sector = params.get("sector") ?? "";
  const education = params.get("education") ?? "";
  const page = parseInt(params.get("page") ?? "1", 10);
  const perPage = 20;

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
    source: "merged",
    data: results,
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
  const doLBA = p.type === "tous" || p.type === "alternance";
  const doFT = p.type !== "alternance";

  const [ftResult, lbaResult] = await Promise.allSettled([
    doFT ? fetchFranceTravail({ ...p, ftType }) : Promise.resolve([]),
    doLBA ? fetchApprentissageParallel(p) : Promise.resolve([]),
  ]);

  const ftOffers = ftResult.status === "fulfilled" ? (ftResult.value as JobOffer[]) : [];
  if (ftResult.status === "rejected") console.error("[job-search] FT error:", ftResult.reason);

  const lbaOffers = lbaResult.status === "fulfilled" ? (lbaResult.value as JobOffer[]) : [];
  if (lbaResult.status === "rejected") console.error("[job-search] Apprentissage error:", lbaResult.reason);

  // ── Deduplicate by identifier.id ──────────────────────────────────────────
  const seen = new Set<string>();
  const merged: JobOffer[] = [];
  for (const o of [...ftOffers, ...lbaOffers]) {
    if (!seen.has(o.id)) {
      seen.add(o.id);
      merged.push(o);
    }
  }

  // Sort by date desc
  merged.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const start = (p.page - 1) * p.perPage;
  return {
    offers: merged.slice(start, start + p.perPage),
    total: merged.length,
    page: p.page,
    perPage: p.perPage,
    sources: {
      france_travail: ftOffers.length,
      apprentissage: lbaOffers.length,
    },
    errors: {
      france_travail: ftResult.status === "rejected" ? (ftResult.reason as Error).message : null,
      apprentissage: lbaResult.status === "rejected" ? (lbaResult.reason as Error).message : null,
    },
  };
}

// ── France Travail ─────────────────────────────────────────────────────────────
async function getFTToken(): Promise<string> {
  if (ftToken && Date.now() < ftTokenExpiry) return ftToken;

  const clientId = Deno.env.get("FRANCE_TRAVAIL_CLIENT_ID");
  const clientSecret = Deno.env.get("FRANCE_TRAVAIL_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("FT credentials not configured");

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "api_offresdemploiv2 o2dsoffre",
  });

  const res = await fetch(FT_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  ftToken = json.access_token ?? null;
  ftTokenExpiry = Date.now() + ((json.expires_in ?? 3600) * 1000);

  return ftToken || "";
}

async function fetchFranceTravail(p: {
  keywords: string; city: string; ftType: string; page: number; perPage: number;
}): Promise<JobOffer[]> {
  const token = await getFTToken();

  const qs = new URLSearchParams({
    motsCles: p.keywords,
    lieuTravail: p.city,
    ...(p.ftType && { typeContrat: p.ftType }),
    range: `${(p.page - 1) * p.perPage}-${p.page * p.perPage - 1}`,
  });

  const res = await fetch(`${FT_SEARCH_URL}?${qs}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`FT error: ${res.status}`);

  const json = (await res.json()) as { resultats?: Record<string, any>[] };
  const items = json.resultats ?? [];

  return (items as Record<string, any>[]).map(mapFTOffer);
}

// ── Apprentissage API – Parallel batches ─────────────────────────────────────
async function fetchApprentissageParallel(p: {
  keywords: string; city: string; page: number; perPage: number;
}): Promise<JobOffer[]> {
  const CITY_COORDS: Record<string, [number, number]> = {
    paris: [48.8566, 2.3522],
    lyon: [45.764, 4.8357],
    marseille: [43.2965, 5.3698],
    bordeaux: [44.8378, -0.5792],
    toulouse: [43.6047, 1.4442],
    nantes: [47.2184, -1.5536],
    strasbourg: [48.5734, 7.7521],
    lille: [50.6292, 3.0573],
  };

  const cityKey = p.city.toLowerCase().trim();
  const coords = CITY_COORDS[cityKey] ?? CITY_COORDS["paris"];

  const lbaToken = Deno.env.get("LBA_API_TOKEN");
  if (!lbaToken) throw new Error("LBA_API_TOKEN not configured");

  // Fetch all ROME batches in parallel
  const batches = getRomeBatches();
  const allOffers: JobOffer[] = [];
  const results = await Promise.allSettled(
    batches.map((romesBatch) =>
      fetchApprentissageBatch({
        lat: coords[0],
        lon: coords[1],
        romes: romesBatch,
        token: lbaToken,
        keywords: p.keywords,
      })
    )
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      allOffers.push(...result.value);
    } else {
      console.error("[apprentissage-batch]", result.reason);
    }
  }

  // Apply client-side keyword filtering
  const filtered = p.keywords
    ? allOffers.filter((o) => {
        const text = `${o.title} ${o.description}`.toLowerCase();
        return text.includes(p.keywords.toLowerCase());
      })
    : allOffers;

  // Paginate
  const start = (p.page - 1) * p.perPage;
  return filtered.slice(start, start + p.perPage);
}

async function fetchApprentissageBatch(p: {
  lat: number;
  lon: number;
  romes: string;
  token: string;
  keywords: string;
}): Promise<JobOffer[]> {
  const qs = new URLSearchParams({
    latitude: String(p.lat),
    longitude: String(p.lon),
    radius: "30",
    romes: p.romes,
  });

  const res = await fetch(`${APPRENTISSAGE_SEARCH_URL}?${qs}`, {
    headers: {
      Authorization: `Bearer ${p.token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error(`Apprentissage error: ${res.status}`);

  const json = (await res.json()) as { jobs?: Record<string, any>[] };
  const items = json.jobs ?? [];

  return (items as Record<string, any>[]).map(mapApprentissageOffer);
}

// ── Mappers ────────────────────────────────────────────────────────────────────
function mapFTOffer(r: Record<string, any>): JobOffer {
  const type = r.typeContratLibelle === "Alternance" ? "alternance" : "cdi";
  const city = (r.lieuTravail?.libelle ?? "").replace(/^\d+ - /, "");

  return {
    id: `ft-${r.id}`,
    source: "france_travail",
    title: decodeHtml(r.intitule ?? ""),
    company: decodeHtml(r.entreprise?.nom ?? ""),
    city,
    type: type as any,
    sector: r.secteurActiviteLibelle ?? "",
    description: decodeHtml(r.description ?? ""),
    publishedAt: r.dateCreation ?? new Date().toISOString(),
    applyUrl: r.origineOffre?.urlOrigine ?? `https://candidat.francetravail.fr/offres/recherche/detail/${r.id}`,
    remote: (r.lieuTravail?.libelle ?? "").toLowerCase().includes("télétravail"),
    tags: [r.typeContratLibelle, r.experienceLibelle].filter(Boolean).slice(0, 2),
    experience: r.experienceLibelle ?? "",
    education: r.niveauFormationLibelle ?? "",
    salary: r.salaire?.libelle ?? "",
  };
}

function mapApprentissageOffer(r: Record<string, any>): JobOffer {
  const offer = r.offer ?? {};
  const workplace = r.workplace ?? {};
  const identifier = r.identifier ?? {};
  const contract = r.contract ?? {};
  const apply = r.apply ?? {};

  return {
    id: `apprentissage-${identifier.id}`,
    source: "apprentissage",
    title: decodeHtml(offer.title ?? "Alternance"),
    company: decodeHtml(workplace.legal_name ?? workplace.name ?? ""),
    city: workplace.location?.address ?? "France",
    type: "alternance",
    sector: (offer.rome_codes?.[0] ?? "") as any,
    description: decodeHtml(offer.description ?? ""),
    publishedAt: offer.publication?.creation ?? new Date().toISOString(),
    applyUrl: apply.url ?? "https://api.apprentissage.beta.gouv.fr",
    remote: contract.remote === true,
    tags: [...(contract.type ?? [])].filter(Boolean).slice(0, 2),
    experience: "",
    education: offer.target_diploma ?? "",
    salary: "",
  };
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface JobOffer {
  id: string;
  source: "france_travail" | "apprentissage";
  title: string;
  company: string;
  city: string;
  type: "stage" | "alternance" | "cdi" | "cdd" | "job";
  sector: string;
  description: string;
  publishedAt: string;
  applyUrl: string;
  remote: boolean;
  tags: string[];
  experience: string;
  education: string;
  salary: string;
}
