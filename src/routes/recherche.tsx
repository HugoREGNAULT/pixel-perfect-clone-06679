// @ts-nocheck
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppNav } from "@/components/AppNav";
import {
  Search,
  X,
  SlidersHorizontal,
  Briefcase,
  Users,
  CalendarDays,
  Tag,
  MapPin,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { PageShell } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, fieldBase } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

/* ------------------------------------------------------------------- route */

export const Route = createFileRoute("/recherche")({
  validateSearch: (s: Record<string, unknown>) => ({
    q:      String(s.q      ?? ""),
    type:   String(s.type   ?? ""),
    sector: String(s.sector ?? ""),
    city:   String(s.city   ?? ""),
  }),
  head: ({ match }) => {
    const q = match.search.q;
    return {
      meta: [
        { title: q ? `"${q}" — Recherche Springr` : "Recherche — Springr" },
        { name: "description", content: "Recherche des offres, mentors, événements et bons plans sur Springr." },
      ],
    };
  },
  component: RecherchePage,
});

/* ------------------------------------------------------------------- types */

type ResultKind = "offre" | "mentor" | "evenement" | "deal";

interface BaseResult {
  id: string;
  kind: ResultKind;
  title: string;
  subtitle: string;
  meta: string;
  badge?: string;
  city?: string;
  sector?: string;
  type?: string;
}

type DbOffer   = Tables<"offres">;
type DbMentor  = Tables<"mentors">;
type DbEvent   = Tables<"evenements">;
type DbDeal    = Tables<"bons_plans">;

const TYPE_LABELS: Record<string, string> = { stage: "Stage", alternance: "Alternance", job: "Premier job" };

const KIND_CONFIG: Record<ResultKind, { icon: React.ComponentType<{ className?: string }>; label: string; plural: string; href: string }> = {
  offre:     { icon: Briefcase,    label: "Offre",     plural: "Offres",     href: "/opportunites" },
  mentor:    { icon: Users,        label: "Mentor",    plural: "Mentors",    href: "/mentors" },
  evenement: { icon: CalendarDays, label: "Événement", plural: "Événements", href: "/evenements" },
  deal:      { icon: Tag,          label: "Bon plan",  plural: "Bons plans", href: "/bons-plans" },
};

/* ------------------------------------------------------------------- page */

function RecherchePage() {
  const navigate  = useNavigate();
  const params    = Route.useSearch();

  const [localQ, setLocalQ]     = useState(params.q);
  const [results, setResults]   = useState<BaseResult[]>([]);
  const [loading, setLoading]   = useState(false);
  const [failed, setFailed]     = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const typeFilter = params.type;
  const sectorFilter = params.sector;
  const cityFilter = params.city;

  const SECTORS = useMemo(() => [...new Set(results.filter(r => r.sector).map(r => r.sector!))].sort(), [results]);
  const CITIES  = useMemo(() => [...new Set(results.filter(r => r.city).map(r => r.city!))].sort(), [results]);

  useEffect(() => {
    setLocalQ(params.q);
    if (!params.q.trim()) { setResults([]); setFailed(false); return; }
    search(params.q);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q]);

  async function search(q: string) {
    setLoading(true);
    setFailed(false);
    const pattern = `%${q.replace(/[,()%]/g, " ")}%`;

    try {
      const [offresRes, mentorsRes, eventsRes, dealsRes] = await Promise.all([
        supabase.from("offres").select("*").or(`title.ilike.${pattern},company.ilike.${pattern},sector.ilike.${pattern},city.ilike.${pattern}`).limit(30),
        supabase.from("mentors").select("*").or(`first_name.ilike.${pattern},last_name.ilike.${pattern},company.ilike.${pattern},sector.ilike.${pattern},position.ilike.${pattern}`).limit(20),
        supabase.from("evenements").select("*").or(`title.ilike.${pattern},organizer.ilike.${pattern},city.ilike.${pattern}`).limit(20),
        supabase.from("bons_plans").select("*").eq("actif", true).or(`titre.ilike.${pattern},description.ilike.${pattern},categorie.ilike.${pattern}`).limit(10),
      ]);

      if ([offresRes, mentorsRes, eventsRes, dealsRes].every(r => r.error)) setFailed(true);

      const mapped: BaseResult[] = [
        ...(offresRes.data ?? []).map((o: DbOffer): BaseResult => ({
          id: o.id, kind: "offre",
          title: o.title, subtitle: o.company,
          meta: o.city + (o.remote ? " · Télétravail" : ""),
          badge: TYPE_LABELS[o.type] ?? o.type,
          city: o.city, sector: o.sector, type: o.type,
        })),
        ...(mentorsRes.data ?? []).map((m: DbMentor): BaseResult => ({
          id: m.id, kind: "mentor",
          title: `${m.first_name} ${m.last_name}`,
          subtitle: `${m.position} · ${m.company}`,
          meta: m.city,
          badge: m.sector,
          city: m.city, sector: m.sector,
        })),
        ...(eventsRes.data ?? []).map((e: DbEvent): BaseResult => ({
          id: e.id, kind: "evenement",
          title: e.title, subtitle: e.organizer,
          meta: e.city + " · " + new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(e.date)),
          badge: e.type,
          city: e.city,
        })),
        ...(dealsRes.data ?? []).map((d: DbDeal): BaseResult => ({
          id: d.id, kind: "deal",
          title: d.titre,
          subtitle: d.description,
          meta: d.categorie,
          badge: d.badge_texte || d.categorie,
        })),
      ];
      setResults(mapped);
    } catch {
      setFailed(true);
      setResults([]);
    }
    setLoading(false);
  }

  function setUrl(next: Partial<{ q: string; type: string; sector: string; city: string }>, replace = true) {
    navigate({ to: "/recherche", search: { q: params.q, type: typeFilter, sector: sectorFilter, city: cityFilter, ...next }, replace });
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setUrl({ q: localQ.trim() }, false);
  }

  function clearFilters() {
    setUrl({ type: "", sector: "", city: "" });
  }

  const filtered = useMemo(() => {
    return results.filter(r => {
      if (typeFilter && r.type !== typeFilter) return false;
      if (sectorFilter && r.sector !== sectorFilter) return false;
      if (cityFilter && r.city !== cityFilter) return false;
      return true;
    });
  }, [results, typeFilter, sectorFilter, cityFilter]);

  const byKind = useMemo(() => {
    const groups: Partial<Record<ResultKind, BaseResult[]>> = {};
    filtered.forEach(r => { if (!groups[r.kind]) groups[r.kind] = []; groups[r.kind]!.push(r); });
    return groups;
  }, [filtered]);

  const hasFilters = !!(typeFilter || sectorFilter || cityFilter);
  const total = filtered.length;

  const KIND_ORDER: ResultKind[] = ["offre", "mentor", "evenement", "deal"];

  return (
    <>
      <AppNav />
      <PageShell size="md" className="pb-20">
        <SectionHeader
          as="h1"
          eyebrow="Recherche"
          title={params.q ? `Résultats pour « ${params.q} »` : "Que cherches-tu ?"}
          description="Offres, mentors, événements et bons plans au même endroit."
        />

        <form onSubmit={submitSearch} role="search" className="mt-6 flex max-w-xl gap-3">
          <div className="relative flex-1">
            <label htmlFor="rech-q" className="sr-only">Rechercher</label>
            <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="rech-q" type="search" value={localQ} onChange={e => setLocalQ(e.target.value)}
              placeholder="Offre, mentor, événement" className="px-10" />
            {localQ && (
              <button type="button" aria-label="Effacer la recherche"
                onClick={() => { setLocalQ(""); setUrl({ q: "", type: "", sector: "", city: "" }, false); }}
                className="absolute right-0 top-0 flex size-11 items-center justify-center text-muted-foreground hover:text-foreground">
                <X aria-hidden className="size-4" />
              </button>
            )}
          </div>
          <Button type="submit">Chercher</Button>
        </form>

        {params.q && (
          <div className="mt-8">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(o => !o)}>
                <SlidersHorizontal /> Filtres
                {hasFilters && <span aria-label="filtres actifs" className="size-2 rounded-full bg-primary" />}
                {filtersOpen ? <ChevronUp /> : <ChevronDown />}
              </Button>
              {hasFilters && (
                <Button type="button" variant="ghost" size="sm" onClick={clearFilters}><X /> Réinitialiser</Button>
              )}
              {!loading && !failed && (
                <span className="ml-auto text-sm text-muted-foreground" aria-live="polite">
                  <strong className="font-display text-lg text-foreground">{total}</strong> résultat{total !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {filtersOpen && (
              <div className="mb-6 grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-3 sm:p-5">
                <div role="group" aria-label="Type de contrat">
                  <p className="mb-2 text-sm font-semibold text-foreground">Type de contrat</p>
                  <div className="flex flex-wrap gap-2">
                    {["stage", "alternance", "job"].map(t => (
                      <button key={t} type="button" aria-pressed={typeFilter === t}
                        onClick={() => setUrl({ type: typeFilter === t ? "" : t })}
                        className={cn(
                          "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                          typeFilter === t ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-foreground hover:bg-muted",
                        )}>
                        {TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="rech-secteur" className="mb-2 block text-sm font-semibold text-foreground">Secteur</label>
                  <select id="rech-secteur" value={sectorFilter} onChange={e => setUrl({ sector: e.target.value })} className={cn(fieldBase, "h-11")}>
                    <option value="">Tous les secteurs</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="rech-ville" className="mb-2 block text-sm font-semibold text-foreground">Ville</label>
                  <select id="rech-ville" value={cityFilter} onChange={e => setUrl({ city: e.target.value })} className={cn(fieldBase, "h-11")}>
                    <option value="">Toutes les villes</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            )}

            {loading ? (
              <div className="space-y-2" aria-busy="true">
                {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
              </div>
            ) : failed ? (
              <EmptyState
                icon={<WifiOff />}
                title="La recherche est indisponible pour le moment"
                description="Nous n'arrivons pas à joindre les données. Ça ne vient pas de ton mot-clé : réessaie dans quelques instants."
                action={<Button onClick={() => search(params.q)}><RefreshCw /> Réessayer</Button>}
              />
            ) : total === 0 ? (
              <EmptyState
                icon={<Search />}
                title="Aucun résultat"
                description={hasFilters ? "Des résultats existent peut-être sans tes filtres." : "Essaie un autre mot-clé ou un terme plus général."}
                action={hasFilters ? <Button variant="secondary" onClick={clearFilters}>Retirer les filtres</Button> : undefined}
              />
            ) : (
              <div className="space-y-10">
                {KIND_ORDER.map(kind => {
                  const items = byKind[kind];
                  if (!items?.length) return null;
                  const cfg = KIND_CONFIG[kind];
                  const Icon = cfg.icon;
                  return (
                    <section key={kind} aria-labelledby={`rech-${kind}`}>
                      <div className="mb-4 flex items-center gap-2">
                        <Icon aria-hidden className="size-5 text-primary" />
                        <h2 id={`rech-${kind}`} className="text-h4 font-semibold text-foreground">{cfg.plural}</h2>
                        <span className="text-sm text-muted-foreground">{items.length}</span>
                      </div>
                      <ul className="space-y-2">
                        {items.map(r => <li key={r.id}><ResultCard result={r} q={params.q} /></li>)}
                      </ul>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!params.q && (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(["offre", "mentor", "evenement", "deal"] as ResultKind[]).map(kind => {
              const cfg = KIND_CONFIG[kind];
              const Icon = cfg.icon;
              return (
                <li key={kind}>
                  <Link to={cfg.href} className="block h-full">
                    <Card interactive className="flex h-full flex-col gap-3 p-5">
                      <Icon aria-hidden className="size-5 text-primary" />
                      <p className="font-display text-base font-semibold text-foreground">Explorer les {cfg.plural.toLowerCase()}</p>
                      <ArrowUpRight aria-hidden className="mt-auto size-4 self-end text-muted-foreground" />
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </PageShell>
    </>
  );
}

/* ------------------------------------------------------------------- result card */

function highlight(text: string, q: string) {
  if (!q || !text) return text;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase()
      ? <mark key={i} className="rounded-sm bg-primary-soft px-0.5 text-primary-soft-foreground">{part}</mark>
      : part
  );
}

function ResultCard({ result: r, q }: { result: BaseResult; q: string }) {
  const cfg = KIND_CONFIG[r.kind];
  const Icon = cfg.icon;
  const search = r.kind === "offre" ? { q: r.title } : undefined;

  return (
    <Link to={cfg.href} search={search} className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      <Card interactive className="flex items-center gap-4 px-4 py-3.5">
        <div aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-soft-foreground">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-foreground">{highlight(r.title, q)}</span>
            {r.badge && <Badge variant="secondary">{r.badge}</Badge>}
          </div>
          <p className="truncate text-sm text-muted-foreground">{highlight(r.subtitle, q)}</p>
        </div>
        {r.meta && (
          <div className="hidden shrink-0 items-center gap-1 text-sm text-muted-foreground sm:flex">
            {r.city && <MapPin aria-hidden className="size-4" />}
            <span>{r.meta}</span>
          </div>
        )}
        <ArrowUpRight aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      </Card>
    </Link>
  );
}
