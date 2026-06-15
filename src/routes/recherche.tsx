import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
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
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
  badgeCls?: string;
  city?: string;
  sector?: string;
  type?: string;
}

type DbOffer   = Tables<"offres">;
type DbMentor  = Tables<"mentors">;
type DbEvent   = Tables<"evenements">;
type DbDeal    = Tables<"bons_plans">;

const TYPE_COLORS: Record<string, string> = {
  stage:       "border-violet/30 bg-violet/10 text-violet-soft",
  alternance:  "border-lime/30 bg-lime/10 text-lime",
  job:         "border-amber-400/30 bg-amber-400/10 text-amber-300",
};
const TYPE_LABELS: Record<string, string> = { stage: "Stage", alternance: "Alternance", job: "Premier job" };

const KIND_CONFIG: Record<ResultKind, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  offre:     { icon: Briefcase,   label: "Offre",      color: "text-violet-soft" },
  mentor:    { icon: Users,       label: "Mentor",     color: "text-lime"        },
  evenement: { icon: CalendarDays, label: "Événement", color: "text-cyan-400"   },
  deal:      { icon: Tag,         label: "Bon plan",   color: "text-amber-400"   },
};

/* ------------------------------------------------------------------- page */

function RecherchePage() {
  const navigate  = useNavigate();
  const params    = Route.useSearch();

  const [localQ, setLocalQ]     = useState(params.q);
  const [results, setResults]   = useState<BaseResult[]>([]);
  const [loading, setLoading]   = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [typeFilter, setTypeFilter]   = useState(params.type);
  const [sectorFilter, setSectorFilter] = useState(params.sector);
  const [cityFilter, setCityFilter]   = useState(params.city);

  const SECTORS = useMemo(() => [...new Set(results.filter(r => r.sector).map(r => r.sector!))].sort(), [results]);
  const CITIES  = useMemo(() => [...new Set(results.filter(r => r.city).map(r => r.city!))].sort(), [results]);

  useEffect(() => {
    setLocalQ(params.q);
    if (!params.q.trim()) { setResults([]); return; }
    search(params.q);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q]);

  async function search(q: string) {
    setLoading(true);
    const pattern = `%${q}%`;

    const [offresRes, mentorsRes, eventsRes, dealsRes] = await Promise.all([
      supabase.from("offres").select("*").or(`title.ilike.${pattern},company.ilike.${pattern},sector.ilike.${pattern},city.ilike.${pattern}`).limit(30),
      supabase.from("mentors").select("*").or(`first_name.ilike.${pattern},last_name.ilike.${pattern},company.ilike.${pattern},sector.ilike.${pattern},position.ilike.${pattern}`).limit(20),
      supabase.from("evenements").select("*").or(`title.ilike.${pattern},organizer.ilike.${pattern},city.ilike.${pattern}`).limit(20),
      supabase.from("bons_plans").select("*").or(`title.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern}`).limit(10),
    ]);

    const mapped: BaseResult[] = [
      ...(offresRes.data ?? []).map((o: DbOffer): BaseResult => ({
        id: o.id, kind: "offre",
        title: o.title, subtitle: o.company,
        meta: o.city + (o.remote ? " · Remote" : ""),
        badge: TYPE_LABELS[o.type] ?? o.type,
        badgeCls: TYPE_COLORS[o.type] ?? "border-white/15 text-mute",
        city: o.city, sector: o.sector, type: o.type,
      })),
      ...(mentorsRes.data ?? []).map((m: DbMentor): BaseResult => ({
        id: m.id, kind: "mentor",
        title: `${m.first_name} ${m.last_name}`,
        subtitle: `${m.position} · ${m.company}`,
        meta: m.city,
        badge: m.sector,
        badgeCls: "border-violet/30 bg-violet/10 text-violet-soft",
        city: m.city, sector: m.sector,
      })),
      ...(eventsRes.data ?? []).map((e: DbEvent): BaseResult => ({
        id: e.id, kind: "evenement",
        title: e.title, subtitle: e.organizer,
        meta: e.city + " · " + new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(e.date)),
        badge: e.type,
        badgeCls: "border-cyan-400/30 bg-cyan-400/10 text-cyan-400",
        city: e.city,
      })),
      ...(dealsRes.data ?? []).map((d: DbDeal): BaseResult => ({
        id: d.id, kind: "deal",
        title: d.title,
        subtitle: d.description ?? "",
        meta: d.category,
        badge: d.category,
        badgeCls: "border-amber-400/30 bg-amber-400/10 text-amber-300",
      })),
    ];

    setResults(mapped);
    setLoading(false);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/recherche", search: { q: localQ, type: typeFilter, sector: sectorFilter, city: cityFilter } });
  }

  function clearFilters() {
    setTypeFilter(""); setSectorFilter(""); setCityFilter("");
    navigate({ to: "/recherche", search: { q: params.q, type: "", sector: "", city: "" } });
  }

  const filtered = useMemo(() => {
    return results.filter(r => {
      if (typeFilter && r.type && r.type !== typeFilter) return false;
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
    <div className="min-h-screen bg-ink text-white">
      <AppNav />

      <main className="mx-auto max-w-5xl px-5 py-10 pb-24">
        {/* hero */}
        <div className="mb-8">
          <div className="eyebrow mb-3">Recherche globale</div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-6">
            {params.q ? (
              <>Résultats pour <span className="text-lime">"{params.q}"</span></>
            ) : (
              "Que cherches-tu ?"
            )}
          </h1>

          {/* search bar */}
          <form onSubmit={submitSearch} className="flex gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-mute pointer-events-none" />
              <input
                value={localQ}
                onChange={e => setLocalQ(e.target.value)}
                placeholder="Offre, mentor, événement…"
                autoFocus={!params.q}
                className="w-full rounded-xl bg-white/5 border border-white/10 pl-11 pr-4 py-3.5 text-sm placeholder:text-mute/50 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors"
              />
              {localQ && (
                <button
                  type="button"
                  onClick={() => { setLocalQ(""); navigate({ to: "/recherche", search: { q: "", type: "", sector: "", city: "" } }); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-mute hover:text-white transition-colors"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="rounded-xl bg-lime px-5 text-sm font-semibold text-ink hover:-translate-y-0.5 hover:shadow-[0_0_20px_-4px_rgba(181,255,61,0.5)] transition-all"
            >
              Chercher
            </button>
          </form>
        </div>

        {params.q && (
          <>
            {/* filter toggle */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <button
                onClick={() => setFiltersOpen(o => !o)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${filtersOpen ? "border-violet/60 bg-violet/10 text-white" : "border-white/15 text-mute hover:border-white/30"}`}
              >
                <SlidersHorizontal className="size-4" />
                Filtres
                {hasFilters && <span className="size-2 rounded-full bg-lime" />}
                {filtersOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              </button>
              {hasFilters && (
                <button onClick={clearFilters} className="inline-flex items-center gap-1 text-sm text-mute hover:text-white transition-colors">
                  <X className="size-3.5" /> Réinitialiser
                </button>
              )}
              {!loading && (
                <span className="ml-auto text-sm text-mute">
                  <span className="font-display font-bold text-white">{total}</span> résultat{total !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* filter panel */}
            {filtersOpen && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-2">Type de contrat</label>
                    <div className="flex flex-wrap gap-2">
                      {["stage", "alternance", "job"].map(t => (
                        <button
                          key={t}
                          onClick={() => setTypeFilter(typeFilter === t ? "" : t)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${typeFilter === t ? "bg-white text-ink border-white" : "border-white/15 text-mute hover:border-white/30"}`}
                        >
                          {TYPE_LABELS[t]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-2">Secteur</label>
                    <select
                      value={sectorFilter}
                      onChange={e => setSectorFilter(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-mute focus:outline-none focus:border-violet/60 focus:text-white transition-colors"
                    >
                      <option value="">Tous les secteurs</option>
                      {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-2">Ville</label>
                    <select
                      value={cityFilter}
                      onChange={e => setCityFilter(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-mute focus:outline-none focus:border-violet/60 focus:text-white transition-colors"
                    >
                      <option value="">Toutes les villes</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => navigate({ to: "/recherche", search: { q: params.q, type: typeFilter, sector: sectorFilter, city: cityFilter } })}
                    className="rounded-full bg-lime px-5 py-2 text-sm font-semibold text-ink hover:-translate-y-0.5 transition-transform"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            )}

            {/* results */}
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="size-7 text-mute animate-spin" />
              </div>
            ) : total === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Search className="size-10 text-mute mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">Aucun résultat</h3>
                <p className="text-mute text-sm max-w-xs">
                  Essaie un autre mot-clé ou élargis tes filtres.
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                {KIND_ORDER.map(kind => {
                  const items = byKind[kind];
                  if (!items?.length) return null;
                  const cfg = KIND_CONFIG[kind];
                  const Icon = cfg.icon;
                  return (
                    <section key={kind}>
                      <div className="flex items-center gap-2 mb-4">
                        <Icon className={`size-4 ${cfg.color}`} />
                        <h2 className="font-display font-bold text-lg">{cfg.label}s</h2>
                        <span className="text-xs font-mono text-mute ml-1">{items.length}</span>
                      </div>
                      <div className="space-y-2">
                        {items.map(r => <ResultCard key={r.id} result={r} q={params.q} />)}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* empty state (no query) */}
        {!params.q && !loading && (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["offre", "mentor", "evenement", "deal"] as ResultKind[]).map(kind => {
              const cfg = KIND_CONFIG[kind];
              const Icon = cfg.icon;
              const hrefs: Record<ResultKind, string> = {
                offre: "/opportunites", mentor: "/mentors", evenement: "/evenements", deal: "/bons-plans"
              };
              return (
                <a
                  key={kind}
                  href={hrefs[kind]}
                  className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-5 flex flex-col gap-3 hover:border-white/20 hover:-translate-y-0.5 transition-all"
                >
                  <Icon className={`size-5 ${cfg.color}`} />
                  <div>
                    <p className="font-display font-bold text-sm">Explorer les {cfg.label}s</p>
                    <p className="text-xs text-mute mt-0.5">Voir tous les résultats</p>
                  </div>
                  <ArrowUpRight className="size-4 text-mute group-hover:text-white transition-colors self-end mt-auto" />
                </a>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------- result card */

function highlight(text: string, q: string) {
  if (!q) return text;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase()
      ? <mark key={i} className="bg-lime/20 text-lime rounded-sm px-0.5">{part}</mark>
      : part
  );
}

function ResultCard({ result: r, q }: { result: BaseResult; q: string }) {
  const cfg = KIND_CONFIG[r.kind];
  const Icon = cfg.icon;

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent px-4 py-3.5 hover:border-white/20 hover:bg-white/[0.04] transition-all">
      {/* icon */}
      <div className="size-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
        <Icon className={`size-4 ${cfg.color}`} />
      </div>

      {/* content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="font-semibold text-sm">{highlight(r.title, q)}</span>
          {r.badge && (
            <span className={`text-[10px] font-mono uppercase tracking-wide border rounded-full px-2 py-0.5 ${r.badgeCls}`}>
              {r.badge}
            </span>
          )}
        </div>
        <p className="text-xs text-mute truncate">{highlight(r.subtitle, q)}</p>
      </div>

      {/* meta */}
      {r.meta && (
        <div className="shrink-0 text-xs text-mute flex items-center gap-1">
          {r.city && <MapPin className="size-3" />}
          <span className="hidden sm:inline">{r.meta}</span>
        </div>
      )}

      <ArrowUpRight className="size-4 text-mute group-hover:text-white transition-colors shrink-0" />
    </div>
  );
}
