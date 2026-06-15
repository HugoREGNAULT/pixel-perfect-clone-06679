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
}

const EDGE_FN_URL = `https://ujjpfcdcyvdliofvadul.supabase.co/functions/v1/job-search`;

export async function searchJobs(params: SearchParams): Promise<SearchResult> {
  const qs = new URLSearchParams();
  if (params.q)         qs.set("q",         params.q);
  if (params.type)      qs.set("type",      params.type);
  if (params.city)      qs.set("city",      params.city);
  if (params.sector)    qs.set("sector",    params.sector);
  if (params.education) qs.set("education", params.education);
  if (params.page)      qs.set("page",      String(params.page));

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${EDGE_FN_URL}?${qs}`, {
      headers: {
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqanBmY2RjeXZkbGlvZnZhZHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MTQ1MjQsImV4cCI6MjA5NzA5MDUyNH0.U44NEYkYgX7WJiMTo8GgkQbRfqzi074TcJozk3Zc5Mw",
      },
    });

    if (!res.ok) throw new Error(`Edge function error: ${res.status}`);
    return await res.json() as SearchResult;
  } catch (err) {
    console.warn("[job-search] Edge function unavailable, falling back to local DB:", err);
    return fallbackToLocal(params);
  }
}

// Fallback: query the local offres table in Supabase
async function fallbackToLocal(params: SearchParams): Promise<SearchResult> {
  const page    = params.page ?? 1;
  const perPage = 20;
  const start   = (page - 1) * perPage;

  let query = supabase.from("offres").select("*", { count: "exact" });

  if (params.type && params.type !== "tous") query = query.eq("type", params.type);
  if (params.city)   query = query.ilike("city", `%${params.city}%`);
  if (params.sector) query = query.eq("sector", params.sector);
  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,company.ilike.%${params.q}%`);
  }

  query = query.order("posted_at", { ascending: false }).range(start, start + perPage - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    offers:  (data ?? []).map(r => ({
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
      salary:      "",
    })),
    total:   count ?? 0,
    page,
    perPage,
    cached:  false,
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
