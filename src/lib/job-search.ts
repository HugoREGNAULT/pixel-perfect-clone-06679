// @ts-nocheck
// Unified job-search client
// Calls the Supabase Edge Function which handles France Travail + La Bonne Alternance
// Falls back to local Supabase offres table if the Edge Function is unavailable

import { supabase } from "@/integrations/supabase/client";

export type JobSource = "france_travail" | "bonne_alternance" | "local";
export type JobType   = "stage" | "alternance" | "cdi" | "cdd" | "job";

export interface JobOffer {
  id:          string;
  source:      JobSource;
  title:       string;
  company:     string;
  city:        string;
  type:        JobType;
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

export interface SearchParams {
  q?:         string;
  type?:      string;
  city?:      string;
  sector?:    string;
  education?: string;
  page?:      number;
}

export interface SearchResult {
  offers:  JobOffer[];
  total:   number;
  page:    number;
  perPage: number;
  cached:  boolean;
  sources?: { france_travail: number; bonne_alternance: number };
  errors?:  { france_travail: string | null; bonne_alternance: string | null };
  error?: string | null;
}

const EDGE_TIMEOUT_MS = 8000;
const VALID_TYPES: JobType[] = ["stage", "alternance", "cdi", "cdd", "job"];

// Normalise une offre renvoyée par la fonction Edge vers le type JobOffer de l'UI
function normalizeEdgeOffer(r: any): JobOffer {
  const source: JobSource = r?.source === "france_travail" || r?.source === "bonne_alternance" ? r.source : "local";
  return {
    id:          String(r?.id ?? ""),
    source,
    title:       String(r?.title ?? ""),
    company:     String(r?.company ?? ""),
    city:        String(r?.city ?? ""),
    type:        VALID_TYPES.includes(r?.type) ? r.type : "job",
    sector:      String(r?.sector ?? ""),
    description: String(r?.description ?? ""),
    publishedAt: String(r?.publishedAt ?? ""),
    applyUrl:    String(r?.applyUrl ?? ""),
    remote:      r?.remote === true,
    tags:        Array.isArray(r?.tags) ? r.tags.filter((t: unknown) => typeof t === "string") : [],
    experience:  r?.experience ? String(r.experience) : undefined,
    education:   r?.education ? String(r.education) : undefined,
    salary:      r?.salary ? String(r.salary) : undefined,
  };
}

async function searchViaEdge(params: SearchParams): Promise<SearchResult> {
  const qs = new URLSearchParams();
  if (params.q)         qs.set("q",         params.q);
  if (params.type)      qs.set("type",      params.type);
  if (params.city)      qs.set("city",      params.city);
  if (params.sector)    qs.set("sector",    params.sector);
  if (params.education) qs.set("education", params.education);
  if (params.page)      qs.set("page",      String(params.page));
  const query = qs.toString();

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error("job-search timeout"));
    }, EDGE_TIMEOUT_MS);
  });

  try {
    // La fonction Edge lit ses paramètres dans l'URL (GET)
    const call = supabase.functions.invoke(`job-search${query ? `?${query}` : ""}`, {
      method: "GET",
      signal: controller.signal,
    });
    const { data, error } = await Promise.race([call, timeout]);
    if (error) throw error;
    if (!data || !Array.isArray(data.offers)) throw new Error("Réponse job-search invalide");
    return {
      offers:  data.offers.map(normalizeEdgeOffer),
      total:   typeof data.total === "number" ? data.total : data.offers.length,
      page:    data.page ?? params.page ?? 1,
      perPage: data.perPage ?? 20,
      cached:  data.cached === true,
      sources: data.sources,
      errors:  data.errors,
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function searchJobs(params: SearchParams): Promise<SearchResult> {
  let edgeResult: SearchResult | null = null;
  try {
    edgeResult = await searchViaEdge(params);
    if (edgeResult.offers.length > 0) return edgeResult;
    console.warn("[job-search] Edge function returned 0 offers, falling back to local DB");
  } catch (err) {
    console.warn("[job-search] Edge function unavailable, falling back to local DB:", err);
  }

  const local = await fallbackToLocal(params);
  // Si la base locale est vide aussi, on garde la réponse (vide) de la fonction Edge quand elle existe
  if (local.offers.length === 0 && edgeResult) return edgeResult;
  return local;
}


// Fallback: query the local offres table in Supabase
async function fallbackToLocal(params: SearchParams): Promise<SearchResult> {
  const page    = params.page ?? 1;
  const perPage = 20;
  const start   = (page - 1) * perPage;

  try {
    let query = (supabase as any).from("offres").select("*", { count: "exact" });

    if (params.type && params.type !== "tous") query = query.eq("type", params.type);
    if (params.city)   query = query.ilike("city", `%${params.city}%`);
    if (params.sector) query = query.eq("sector", params.sector);
    if (params.q) {
      query = query.or(`title.ilike.%${params.q}%,company.ilike.%${params.q}%`);
    }

    query = query.order("posted_at", { ascending: false }).range(start, start + perPage - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    // If we have data, return it
    if (data && data.length > 0) {
      return {
        offers:  data.map(r => ({
          id:          r.id,
          source:      "local" as JobSource,
          title:       r.title,
          company:     r.company,
          city:        r.city,
          type:        r.type as JobType,
          sector:      r.sector,
          description: (r as any).description ?? "",
          publishedAt: r.posted_at,
          applyUrl:    r.apply_url ?? "",
          remote:      r.remote,
          tags:        r.tags ?? [],
          salary:      r.salary ?? "",
        })),
        total:   count ?? 0,
        page,
        perPage,
        cached:  false,
      };
    }
  } catch (err) {
    console.warn("[job-search] Local DB query failed:", err);
  }

  // Return empty offers with error when API and DB are unavailable
  return {
    offers: [],
    total:  0,
    page,
    perPage,
    cached: false,
    error: "offres_indisponibles",
  };
}

export async function searchJobsForProfile(userMeta: Record<string, unknown>): Promise<JobOffer[]> {
  const sector  = (userMeta.sectors as string[])?.[0] ?? "";
  const city    = (userMeta.city as string) ?? "";
  const seeking = (userMeta.seeking as string) ?? "";
  const typeMap: Record<string, string> = {
    "Stage": "stage", "Alternance": "alternance",
    "Job étudiant": "job", "Job saisonnier": "job",
  };
  const type = typeMap[seeking] ?? "tous";

  try {
    const result = await searchJobs({ type, city, sector, page: 1 });
    return result.offers.slice(0, 3);
  } catch {
    return [];
  }
}
