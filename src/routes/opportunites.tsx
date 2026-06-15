import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  MapPin, Calendar, Search, X, ArrowUpRight, Briefcase, Check,
  SlidersHorizontal, Loader2, ExternalLink, Building2, ChevronLeft,
  ChevronRight, RefreshCw, Zap, AlertTriangle, Radio, BookOpen,
} from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { supabase } from "@/integrations/supabase/client";
import { searchJobs, type JobOffer, type SearchParams, type SearchResult } from "@/lib/job-search";

export const Route = createFileRoute("/opportunites")({
  head: () => ({
    meta: [
      { title: "Opportunités — Springr" },
      { name: "description", content: "Stages, alternances et emplois en direct depuis France Travail et La Bonne Alternance." },
    ],
  }),
  component: OpportunitesPage,
});

/* ─── constants ─── */

const PER_PAGE = 20;

const TYPE_META: Record<string, { label: string; color: string; dot: string }> = {
  tous:        { label: "Tous",           color: "border-white/20 text-mute",              dot: "bg-mute"         },
  stage:       { label: "Stage",          color: "border-violet/40 bg-violet/15 text-violet-soft", dot: "bg-violet-soft" },
  alternance:  { label: "Alternance",     color: "border-lime/40 bg-lime/10 text-lime",    dot: "bg-lime"         },
  cdi:         { label: "CDI",            color: "border-blue-400/40 bg-blue-400/10 text-blue-300", dot: "bg-blue-400" },
  cdd:         { label: "CDD",            color: "border-amber-400/40 bg-amber-400/10 text-amber-300", dot: "bg-amber-400" },
  job:         { label: "Job étudiant",   color: "border-pink-400/40 bg-pink-400/10 text-pink-300", dot: "bg-pink-400" },
};

const SOURCE_META: Record<string, { label: string; color: string }> = {
  france_travail:   { label: "France Travail",        color: "text-blue-400 border-blue-400/30 bg-blue-400/8"  },
  bonne_alternance: { label: "La Bonne Alternance",   color: "text-lime border-lime/30 bg-lime/8"               },
  local:            { label: "Springr",               color: "text-violet-soft border-violet/30 bg-violet/8"    },
};

const EDUCATION_OPTIONS = [
  { value: "", label: "Tous niveaux" },
  { value: "bac",   label: "Bac" },
  { value: "bac+2", label: "Bac+2" },
  { value: "bac+3", label: "Bac+3" },
  { value: "bac+5", label: "Bac+5" },
];

const COMPANY_COLORS = [
  "from-violet/60 to-violet/30",   "from-lime/50 to-lime/20",
  "from-blue-500/60 to-blue-500/20","from-emerald-500/50 to-emerald-500/20",
  "from-pink-500/50 to-pink-500/20","from-orange-500/50 to-orange-500/20",
  "from-cyan-500/50 to-cyan-500/20","from-amber-500/50 to-amber-500/20",
];

function companyGradient(name: string) {
  return COMPANY_COLORS[(name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % COMPANY_COLORS.length];
}

function daysAgo(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(date));
}

/* ─── page ─── */

function OpportunitesPage() {
  const [result,   setResult]   = useState<SearchResult | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [applied,  setApplied]  = useState<Set<string>>(new Set());

  // filters
  const [q,        setQ]        = useState("");
  const [type,     setType]     = useState("tous");
  const [city,     setCity]     = useState("");
  const [sector,   setSector]   = useState("");
  const [education,setEdu]      = useState("");
  const [page,     setPage]     = useState(1);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchJobs(params);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search on param change
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      load({ q, type, city, sector, education, page });
    }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [q, type, city, sector, education, page, load]);

  // Load applied candidatures
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase.from("candidatures").select("offre_id").eq("user_id", session.user.id)
        .then(({ data }) => { if (data) setApplied(new Set(data.map(c => c.offre_id))); });
    });
  }, []);

  function resetFilters() {
    setQ(""); setType("tous"); setCity(""); setSector(""); setEdu(""); setPage(1);
  }

  const hasFilters = type !== "tous" || !!q || !!city || !!sector || !!education;

  async function handleApply(offer: JobOffer) {
    // External offers → open apply URL directly
    if (offer.source !== "local" && offer.applyUrl) {
      window.open(offer.applyUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (applied.has(offer.id)) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Connecte-toi pour postuler !"); return; }
    const { error } = await supabase.from("candidatures").insert({ user_id: session.user.id, offre_id: offer.id });
    if (error && error.code !== "23505") { toast.error("Erreur lors de la candidature."); return; }
    setApplied(prev => new Set([...prev, offer.id]));
    toast.success(`Candidature envoyée pour "${offer.title}" !`);
  }

  const totalPages = result ? Math.ceil(result.total / PER_PAGE) : 1;

  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 sm:px-5 py-10 pb-24">

        {/* ── Hero ── */}
        <div className="mb-8">
          <div className="eyebrow mb-3">En direct depuis France Travail & La Bonne Alternance</div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">Opportunités</h1>
          <p className="mt-4 text-mute text-lg max-w-xl">
            Stages, alternances, CDI et jobs étudiants — offres officielles en temps réel.
          </p>
          {/* Source legend */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {Object.entries(SOURCE_META).map(([key, s]) => (
              <span key={key} className={`inline-flex items-center gap-1.5 text-xs border rounded-full px-2.5 py-1 ${s.color}`}>
                <span className="size-1.5 rounded-full bg-current opacity-70"/>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Filters bar ── */}
        <div className="sticky top-14 z-30 -mx-4 sm:-mx-5 px-4 sm:px-5 py-4 bg-ink/95 backdrop-blur-xl border-b border-white/5 mb-8">
          {/* Row 1: search + reset */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-mute pointer-events-none" />
              <input value={q} onChange={e => { setQ(e.target.value); setPage(1); }}
                placeholder="Poste, entreprise, mot-clé…"
                className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm placeholder:text-mute/60 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors" />
              {q && <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-white"><X className="size-4"/></button>}
            </div>
            <input value={city} onChange={e => { setCity(e.target.value); setPage(1); }}
              placeholder="Ville"
              className="rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm placeholder:text-mute/60 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors w-32 sm:w-40" />
            {hasFilters && (
              <button onClick={resetFilters} className="inline-flex items-center gap-1.5 text-xs text-mute hover:text-white transition-colors whitespace-nowrap">
                <X className="size-3.5"/> Réinitialiser
              </button>
            )}
          </div>

          {/* Row 2: type pills + select filters */}
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="size-4 text-mute shrink-0" />
            {Object.entries(TYPE_META).map(([t, m]) => (
              <button key={t} onClick={() => { setType(t); setPage(1); }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                  type === t ? "bg-white text-ink border-white" : "border-white/15 text-mute hover:border-white/30 hover:text-white"
                }`}>
                {m.label}
              </button>
            ))}
            <div className="w-px h-4 bg-white/10 mx-1" />
            <select value={sector} onChange={e => { setSector(e.target.value); setPage(1); }}
              className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-mute focus:outline-none focus:border-violet/60 transition-colors cursor-pointer">
              <option value="">Tous les secteurs</option>
              {["Tech", "Marketing", "Finance", "Santé", "Commerce", "Communication", "Ingénierie", "Design", "RH", "Juridique"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select value={education} onChange={e => { setEdu(e.target.value); setPage(1); }}
              className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-mute focus:outline-none focus:border-violet/60 transition-colors cursor-pointer">
              {EDUCATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* ── Result count + source info ── */}
        {result && !loading && (
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="font-display font-bold text-2xl">{result.total.toLocaleString("fr-FR")}</span>
            <span className="text-mute text-sm">offre{result.total !== 1 ? "s" : ""} trouvée{result.total !== 1 ? "s" : ""}</span>
            {result.cached && (
              <span className="text-xs font-mono text-mute border border-white/10 rounded-full px-2 py-0.5 flex items-center gap-1">
                <RefreshCw className="size-2.5"/> Cache
              </span>
            )}
            {hasFilters && (
              <span className="text-xs font-mono text-lime bg-lime/10 border border-lime/20 rounded-full px-2 py-0.5">Filtres actifs</span>
            )}
            {/* API errors as soft warnings */}
            {result.errors?.france_travail && (
              <span className="text-xs text-amber-400/70 flex items-center gap-1">
                <AlertTriangle className="size-3"/> France Travail indisponible
              </span>
            )}
          </div>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="size-8 text-mute animate-spin" />
            <p className="text-sm text-mute">Recherche en cours sur France Travail & La Bonne Alternance…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <AlertTriangle className="size-10 text-amber-400/60" />
            <p className="text-mute text-sm">Erreur de chargement des offres.</p>
            <code className="text-xs text-amber-400/70 bg-amber-400/5 border border-amber-400/15 rounded-lg px-3 py-2 max-w-sm break-all">{error}</code>
            <button onClick={() => load({ q, type, city, sector, education, page })}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm text-mute hover:text-white hover:border-white/30 transition-colors">
              <RefreshCw className="size-3.5"/> Réessayer
            </button>
          </div>
        ) : !result || result.offers.length === 0 ? (
          <EmptyState onReset={resetFilters} hasFilters={hasFilters} />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.offers.map(offer => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  applied={applied.has(offer.id)}
                  onApply={() => handleApply(offer)}
                />
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2.5 text-sm text-mute hover:text-white hover:border-white/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronLeft className="size-4"/> Précédent
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let p: number;
                    if (totalPages <= 7) p = i + 1;
                    else if (page <= 4) p = i + 1;
                    else if (page >= totalPages - 3) p = totalPages - 6 + i;
                    else p = page - 3 + i;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`size-9 rounded-xl text-sm font-mono transition-all ${
                          p === page
                            ? "bg-lime text-ink font-bold"
                            : "text-mute hover:text-white hover:bg-white/5"
                        }`}>
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2.5 text-sm text-mute hover:text-white hover:border-white/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  Suivant <ChevronRight className="size-4"/>
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* ─── offer card ─── */

function OfferCard({ offer, applied, onApply }: { offer: JobOffer; applied: boolean; onApply: () => void }) {
  const age   = daysAgo(offer.publishedAt);
  const isNew = age <= 3;
  const typeMeta   = TYPE_META[offer.type]   ?? TYPE_META.job;
  const sourceMeta = SOURCE_META[offer.source] ?? SOURCE_META.local;
  const isExternal = offer.source !== "local";

  return (
    <article className="group relative flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 hover:border-violet/40 hover:-translate-y-0.5 transition-all duration-200">
      {/* top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className={`size-10 rounded-xl bg-gradient-to-br ${companyGradient(offer.company)} flex items-center justify-center font-display font-bold text-base text-white shrink-0`}>
          {offer.company[0]}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {isNew && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-lime bg-lime/10 border border-lime/25 rounded-full px-2 py-0.5 flex items-center gap-1">
              <Radio className="size-2.5"/> Nouveau
            </span>
          )}
          <span className={`text-[10px] font-mono uppercase tracking-wider border rounded-full px-2 py-0.5 ${typeMeta.color}`}>
            {typeMeta.label}
          </span>
        </div>
      </div>

      {/* title + company */}
      <div className="flex-1 mb-3">
        <h2 className="font-display font-bold text-sm leading-snug group-hover:text-lime transition-colors line-clamp-2">{offer.title}</h2>
        <p className="mt-0.5 text-xs text-mute">{offer.company}</p>
      </div>

      {/* description snippet */}
      {offer.description && (
        <p className="text-xs text-mute/70 leading-relaxed line-clamp-2 mb-3">{offer.description}</p>
      )}

      {/* tags */}
      {offer.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {offer.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] font-mono bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-mute">{tag}</span>
          ))}
        </div>
      )}

      {/* salary / education */}
      {(offer.salary || offer.education) && (
        <div className="flex flex-wrap gap-3 text-[11px] text-mute mb-3">
          {offer.salary    && <span className="flex items-center gap-1"><Zap className="size-3 text-lime"/>{offer.salary}</span>}
          {offer.education && <span className="flex items-center gap-1"><BookOpen className="size-3"/>{offer.education}</span>}
        </div>
      )}

      {/* meta: city + date + source */}
      <div className="flex items-center justify-between gap-2 text-[11px] text-mute mb-4">
        <span className="flex items-center gap-1 truncate">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{offer.city}{offer.remote && " · Remote"}</span>
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <Calendar className="size-3" />
          {age === 0 ? "Auj." : age === 1 ? "Hier" : formatDate(offer.publishedAt)}
        </span>
      </div>

      {/* source badge */}
      <div className="mb-4">
        <span className={`text-[10px] border rounded-full px-2 py-0.5 font-mono ${sourceMeta.color}`}>{sourceMeta.label}</span>
      </div>

      {/* apply button */}
      <button
        onClick={onApply}
        disabled={!isExternal && applied}
        className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-all ${
          !isExternal && applied
            ? "bg-lime/15 border border-lime/30 text-lime cursor-default"
            : "bg-lime text-ink hover:-translate-y-0.5 hover:shadow-[0_0_20px_-4px_rgba(181,255,61,0.4)]"
        }`}>
        {!isExternal && applied ? (
          <><Check className="size-4"/> Candidature envoyée</>
        ) : isExternal ? (
          <>Postuler <ExternalLink className="size-4"/></>
        ) : (
          <>Postuler <ArrowUpRight className="size-4"/></>
        )}
      </button>
    </article>
  );
}

/* ─── empty state ─── */

function EmptyState({ onReset, hasFilters }: { onReset: () => void; hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <Briefcase className="size-12 text-mute opacity-20" />
      <div>
        <p className="font-semibold text-white">Aucune offre trouvée</p>
        <p className="text-sm text-mute mt-1">
          {hasFilters
            ? "Essaie d'élargir tes critères de recherche."
            : "Les offres externes mettent parfois quelques secondes à charger."}
        </p>
      </div>
      {hasFilters && (
        <button onClick={onReset} className="inline-flex items-center gap-2 rounded-full bg-lime text-ink px-5 py-2.5 text-sm font-semibold hover:-translate-y-0.5 transition-transform">
          <X className="size-4"/> Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}
