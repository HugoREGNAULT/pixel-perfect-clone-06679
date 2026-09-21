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
  stage: "STAGE",
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
      bonne_alternance: lbaOffers.length,
    },
    errors: {
      france_travail: ftResult.status === "rejected" ? (ftResult.reason as Error).message : null,
      bonne_alternance: lbaResult.status === "rejected" ? (lbaResult.reason as Error).message : null,
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

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[job-search] FT ${res.status}:`, errText);
    throw new Error(`FT error: ${res.status}`);
  }

  const json = (await res.json()) as { resultats?: Record<string, any>[] };
  const items = json.resultats ?? [];

  return (items as Record<string, any>[]).map(mapFTOffer);
}

// ── Apprentissage API – Single request (all results, no batching) ──────────────
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
    nice: [43.7102, 7.262],
    rennes: [48.1173, -1.6778],
    montpellier: [43.6108, 3.8767],
    grenoble: [45.1885, 5.7245],
    tours: [47.3941, 0.6848],
    metz: [49.1193, 6.1757],
    nancy: [48.6921, 6.1844],
  };

  const cityKey = p.city.toLowerCase().trim();
  const coords = CITY_COORDS[cityKey] ?? CITY_COORDS["paris"];

  const lbaToken = Deno.env.get("LBA_API_TOKEN");
  if (!lbaToken) throw new Error("LBA_API_TOKEN not configured");

  const qs = new URLSearchParams({
    latitude: String(coords[0]),
    longitude: String(coords[1]),
    radius: "30",
  });

  const res = await fetch(`${APPRENTISSAGE_SEARCH_URL}?${qs}`, {
    headers: {
      Authorization: `Bearer ${lbaToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error(`Apprentissage error: ${res.status}`);

  const json = (await res.json()) as { jobs?: Record<string, any>[] };
  const items = json.jobs ?? [];
  const allOffers = (items as Record<string, any>[]).map(mapApprentissageOffer);

  // Apply client-side keyword filtering
  const filtered = p.keywords
    ? allOffers.filter((o) => {
        const text = `${o.title} ${o.description}`.toLowerCase();
        return text.includes(p.keywords.toLowerCase());
      })
    : allOffers;

  return filtered;
}

// ── Mappers ────────────────────────────────────────────────────────────────────
function cleanDescription(text: string): string {
  if (!text) return "";
  // Remove markdown: headers (#, ##), bold (**), italic (*, _), code (`)
  let cleaned = text
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1"); // [text](url) → text
  // Remove multiple blank lines
  cleaned = cleaned.replace(/\n\n+/g, "\n");
  // Remove leading "Entreprise" word if isolated at start
  cleaned = cleaned.replace(/^Entreprise\s+/i, "");
  return cleaned.trim();
}

function extractCity(address: string): string {
  if (!address) return "France";
  address = address.trim();

  // Patterns for French addresses: "CODE POSTAL COMMUNE" or "STREET CODE POSTAL COMMUNE"
  // Extract postal code (5 digits) and commune
  const match = address.match(/(\d{5})\s+(.+)$/);
  if (match) {
    const [, code, commune] = match;
    const commoneName = commune.split("\n")[0]?.trim();

    // Handle arrondissements (75001 Paris → Paris, 75020 Paris 20e Arrondissement → Paris 20e)
    if (code.startsWith("75")) {
      const arrondissement = commoneName.match(/(\d+)(?:e|er|ème)?\s+Arrondissement/);
      if (arrondissement) {
        return `Paris ${arrondissement[1]}e`;
      }
      return "Paris";
    }
    return commoneName;
  }

  // Fallback: just return the last part (common for "75001 Paris" format)
  const parts = address.split(/[\s,]+/).filter(p => p);
  if (parts.length > 0) {
    const lastPart = parts[parts.length - 1];
    if (!/^\d+$/.test(lastPart)) return lastPart;
  }

  return "France";
}

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

  // Cascade for company: legal_name → name → brand → fallback
  const company = workplace.legal_name || workplace.name || workplace.brand || "Entreprise confidentielle";

  const targetDiploma = offer.target_diploma;
  const education = typeof targetDiploma === "string" ? targetDiploma : (targetDiploma?.label ?? "");

  const romeCodes = offer.rome_codes ?? [];

  return {
    id:          `apprentissage-${identifier.id ?? crypto.randomUUID()}`,
    source:      "bonne_alternance",
    title:       String(offer.title ?? "Alternance"),
    company:     String(company),
    city:        extractCity(workplace.location?.address ?? ""),
    type:        "alternance",
    sector:      String(romeCodes[0] ?? ""),
    description: cleanDescription(offer.description ?? ""),
    publishedAt: offer.publication?.creation ?? new Date().toISOString(),
    applyUrl:    apply.url ?? "https://api.apprentissage.beta.gouv.fr",
    remote:      contract.remote === true,
    tags:        (contract.type ?? []).filter((tag: any) => typeof tag === "string").slice(0, 2),
    experience:  "",
    education:   String(education),
    salary:      "",
  };
}

// ── Types ──────────────────────────────────────────────────────────────────────
interface JobOffer {
  id: string;
  source: "france_travail" | "bonne_alternance";
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
