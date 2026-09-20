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

// Sample offers for development/fallback
const SAMPLE_OFFERS: JobOffer[] = [
  {
    id:          "sample-1",
    source:      "local" as JobSource,
    title:       "Développeur Full Stack",
    company:     "TechStartup Paris",
    city:        "Paris",
    type:        "alternance" as JobType,
    sector:      "Informatique",
    description: "Rejoins notre équipe et développe des applications modernes avec React, Node.js et TypeScript.",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl:    "https://springr.app/candidatures",
    remote:      true,
    tags:        ["React", "Node.js", "TypeScript"],
    salary:      "700€ - 800€/mois",
  },
  {
    id:          "sample-2",
    source:      "local" as JobSource,
    title:       "Alternant(e) Marketing Digital",
    company:     "Digital Agency Lyon",
    city:        "Lyon",
    type:        "alternance" as JobType,
    sector:      "Marketing",
    description: "Découvre les métiers du marketing digital : SEO, SEM, réseaux sociaux et analytics.",
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl:    "https://springr.app/candidatures",
    remote:      false,
    tags:        ["SEO", "SEM", "Analytics"],
    salary:      "600€ - 700€/mois",
  },
  {
    id:          "sample-3",
    source:      "local" as JobSource,
    title:       "Data Analyst en alternance",
    company:     "FinTech Solutions",
    city:        "Toulouse",
    type:        "alternance" as JobType,
    sector:      "Finance",
    description: "Analyse des données financières avec Python, SQL et Power BI. Apprentissage sur le métier.",
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    applyUrl:    "https://springr.app/candidatures",
    remote:      true,
    tags:        ["Python", "SQL", "Power BI"],
    salary:      "750€ - 900€/mois",
  },
];

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

  // Fallback to sample offers when DB is empty or unavailable
  const filtered = SAMPLE_OFFERS.filter(offer => {
    if (params.type && params.type !== "tous" && offer.type !== params.type) return false;
    if (params.city && !offer.city.toLowerCase().includes(params.city.toLowerCase())) return false;
    if (params.sector && offer.sector !== params.sector) return false;
    if (params.q) {
      const searchText = `${offer.title} ${offer.company} ${offer.description}`.toLowerCase();
      if (!searchText.includes(params.q.toLowerCase())) return false;
    }
    return true;
  });

  return {
    offers: filtered.slice(start, start + perPage),
    total:  filtered.length,
    page,
    perPage,
    cached: false,
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
