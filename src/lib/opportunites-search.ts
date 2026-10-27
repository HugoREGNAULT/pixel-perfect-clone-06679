// Paramètres de recherche de /opportunites (dans l'URL), partagés avec la redirection /opportunites/search.

export const OFFER_TYPES = ["tous", "stage", "alternance", "cdi", "cdd", "job"] as const;

export interface OpportunitesSearch {
  q?: string;
  type?: string;
  city?: string;
  sector?: string;
  education?: string;
  page?: number;
}

const str = (v: unknown, max = 80): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;

export function validateOpportunitesSearch(raw: Record<string, unknown>): OpportunitesSearch {
  const type = str(raw.type, 20);
  const page = Number(raw.page);
  return {
    q: str(raw.q),
    type: type && (OFFER_TYPES as readonly string[]).includes(type) && type !== "tous" ? type : undefined,
    city: str(raw.city),
    sector: str(raw.sector),
    education: str(raw.education, 20),
    page: Number.isInteger(page) && page > 1 && page < 1000 ? page : undefined,
  };
}
