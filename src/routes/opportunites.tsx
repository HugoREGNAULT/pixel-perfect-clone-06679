// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  MapPin, Calendar, Search, X, ArrowUpRight, Briefcase, Check, Loader2, ExternalLink, Building2,
  ChevronLeft, ChevronRight, RefreshCw, AlertTriangle, Radio, BookOpen, Heart,
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

const PER_PAGE = 20;

const TYPE_META: Record<string, { label: string; color: string; dot: string }> = {
  tous:        { label: "Tous",           color: "border-border text-muted-foreground",              dot: "bg-muted"         },
  stage:       { label: "Stage",          color: "border-primary/40 bg-primary-soft text-primary", dot: "bg-primary" },
  alternance:  { label: "Alternance",     color: "border-primary/40 bg-primary-soft text-primary",    dot: "bg-primary"         },
  cdi:         { label: "CDI",            color: "border-blue-400/40 bg-blue-400/10 text-blue-600", dot: "bg-blue-400" },
  cdd:         { label: "CDD",            color: "border-amber-400/40 bg-amber-400/10 text-amber-600", dot: "bg-amber-400" },
  job:         { label: "Job étudiant",   color: "border-pink-400/40 bg-pink-400/10 text-pink-600", dot: "bg-pink-400" },
};

const SOURCE_META: Record<string, { label: string; color: string }> = {
  france_travail:   { label: "France Travail",        color: "text-blue-600 border-blue-400/30 bg-blue-400/8"  },
  bonne_alternance: { label: "La Bonne Alternance",   color: "text-primary border-primary/30 bg-primary-soft"               },
  local:            { label: "Springr",               color: "text-primary border-primary/30 bg-primary-soft"    },
};

const EDUCATION_OPTIONS = [
  { value: "", label: "Tous niveaux" },
  { value: "bac",   label: "Bac" },
  { value: "bac+2", label: "Bac+2" },
  { value: "bac+3", label: "Bac+3" },
  { value: "bac+5", label: "Bac+5" },
];

function daysAgo(date: string) {
  const now = new Date();
  const offerDate = new Date(date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const offer = new Date(offerDate.getFullYear(), offerDate.getMonth(), offerDate.getDate());
  return Math.floor((today.getTime() - offer.getTime()) / 86_400_000);
}

function formatDateRelative(date: string) {
  const days = daysAgo(date);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 30) return `Il y a ${days} j`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(date));
}

function getInitials(company: string): string {
  return company.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function OpportunitesPage() {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  const [stats, setStats] = useState<{ schools: number; upcomingJpos: number } | null>(null);

  const [q, setQ] = useState("");
  const [type, setType] = useState("tous");
  const [city, setCity] = useState("");
  const [sector, setSector] = useState("");
  const [education, setEdu] = useState("");
  const [page, setPage] = useState(1);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchJobs(params);
      setResult(res);
      if (res.offers.length > 0 && !selectedOffer) {
        setSelectedOffer(res.offers[0]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [selectedOffer]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      load({ q, type, city, sector, education, page });
    }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [q, type, city, sector, education, page, load]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase.from("candidatures").select("offre_id").eq("user_id", session.user.id)
        .then(({ data }) => { if (data) setApplied(new Set(data.map(c => c.offre_id))); });
    });
  }, []);

  useEffect(() => {
    async function loadStats() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [schoolsRes, jposRes] = await Promise.all([
          supabase.from("ecoles").select("id", { count: "exact", head: true }),
          supabase.from("jpos").select("id").gte("date", today).then(({ data, error: e1 }) => {
            if (e1) return { data: [], error: e1 };
            return supabase.from("jpo_submissions").select("id").eq("status", "approved").gte("date_jpo", today).then(({ data: jpoData }) => ({
              data: (data || []).concat(jpoData || []),
            }));
          }),
        ]);
        setStats({
          schools: schoolsRes.count || 0,
          upcomingJpos: jposRes.data?.length || 0,
        });
      } catch (e) {
        setStats({ schools: 0, upcomingJpos: 0 });
      }
    }
    loadStats();
  }, []);

  function resetFilters() {
    setQ(""); setType("tous"); setCity(""); setSector(""); setEdu(""); setPage(1);
  }

  const hasFilters = type !== "tous" || !!q || !!city || !!sector || !!education;

  async function handleApply(offer: JobOffer) {
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
    <div className="min-h-screen bg-background text-foreground">
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="font-display text-5xl lg:text-6xl font-bold leading-tight mb-3">
            Trouvez votre opportunité parfaite
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Stages, alternances, premiers emplois et bien plus. Toutes les offres réunies au même endroit.
          </p>
        </div>

        {/* Stats */}
        {result && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 p-8 bg-foreground text-background rounded-lg">
            <div>
              <div className="font-display text-2xl md:text-3xl font-bold">
                {(result.total || 0).toLocaleString("fr-FR")}+
              </div>
              <p className="text-sm text-background/70 mt-1">offres actives</p>
            </div>
            {stats.schools > 0 && (
              <div>
                <div className="font-display text-2xl md:text-3xl font-bold">{stats.schools}</div>
                <p className="text-sm text-background/70 mt-1">écoles référencées</p>
              </div>
            )}
            {stats.upcomingJpos > 0 && (
              <div>
                <div className="font-display text-2xl md:text-3xl font-bold">{stats.upcomingJpos}</div>
                <p className="text-sm text-background/70 mt-1">JPO à venir</p>
              </div>
            )}
          </div>
        )}

        {/* Search Card */}
        <div className="bg-card border border-border rounded-xl p-5 mb-10 shadow-sm">
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                value={q}
                onChange={e => { setQ(e.target.value); setPage(1); }}
                placeholder="Poste, entreprise, mot-clé…"
                className="w-full rounded-lg bg-background border border-input px-10 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="relative flex-1 sm:flex-none sm:w-40">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                value={city}
                onChange={e => { setCity(e.target.value); setPage(1); }}
                placeholder="Ville"
                className="w-full rounded-lg bg-background border border-input px-10 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={() => load({ q, type, city, sector, education, page })}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
            >
              Rechercher
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {Object.entries(TYPE_META).map(([t, m]) => (
            <button
              key={t}
              onClick={() => { setType(t); setPage(1); }}
              className={`rounded-full px-4 py-2 text-xs font-medium border transition-all ${
                type === t
                  ? "bg-primary-soft border-primary text-primary-soft-foreground"
                  : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
          <select
            value={sector}
            onChange={e => { setSector(e.target.value); setPage(1); }}
            className="rounded-full bg-background border border-border px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="">Tous les secteurs</option>
            {["Tech", "Marketing", "Finance", "Santé", "Commerce", "Communication", "Ingénierie", "Design", "RH", "Juridique"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={education}
            onChange={e => { setEdu(e.target.value); setPage(1); }}
            className="rounded-full bg-background border border-border px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            {EDUCATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-3.5" /> Réinitialiser
            </button>
          )}
        </div>

        {/* Explore by sector */}
        {!hasFilters && !loading && (
          <div className="mb-12">
            <h2 className="font-display text-2xl font-bold mb-2">Explorez par domaine</h2>
            <p className="text-muted-foreground mb-6">
              Trouvez les meilleures opportunités dans votre domaine d'intérêt
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Tech", color: "bg-blue-50 border-blue-200 text-blue-700" },
                { label: "Finance", color: "bg-purple-50 border-purple-200 text-purple-700" },
                { label: "Marketing", color: "bg-green-50 border-green-200 text-green-700" },
                { label: "Design", color: "bg-pink-50 border-pink-200 text-pink-700" },
                { label: "Santé", color: "bg-red-50 border-red-200 text-red-700" },
                { label: "RH", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
                { label: "Commerce", color: "bg-teal-50 border-teal-200 text-teal-700" },
                { label: "Communication", color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
              ].map((category) => (
                <button
                  key={category.label}
                  onClick={() => { setSector(category.label); setPage(1); }}
                  className={`rounded-lg border-2 p-4 text-sm font-semibold transition-all hover:shadow-md ${category.color}`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-6 text-muted-foreground animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <AlertTriangle className="size-10 text-highlight mx-auto mb-3" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : !result || result.offers.length === 0 ? (
          <div className="text-center py-24">
            <Briefcase className="size-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-foreground font-medium">Aucune offre trouvée</p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasFilters ? "Essaie d'élargir tes critères." : "Les offres vont bientôt s'afficher."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-8">
            {/* Left: List */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-muted-foreground mb-4">
                {result.total.toLocaleString("fr-FR")} offre{result.total !== 1 ? "s" : ""}
              </div>
              {result.offers.map((offer) => (
                <OfferListItem
                  key={offer.id}
                  offer={offer}
                  selected={selectedOffer?.id === offer.id}
                  onSelect={() => setSelectedOffer(offer)}
                />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-2 mt-8 pt-6 border-t border-border">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="text-xs text-muted-foreground">
                    Page {page} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Right: Detail */}
            {selectedOffer && (
              <div className="hidden lg:block">
                <DetailPanel
                  offer={selectedOffer}
                  applied={applied.has(selectedOffer.id)}
                  onApply={() => handleApply(selectedOffer)}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function OfferListItem({
  offer,
  selected,
  onSelect,
}: {
  offer: JobOffer;
  selected: boolean;
  onSelect: () => void;
}) {
  const age = daysAgo(offer.publishedAt);
  const isNew = age < 3;
  const typeMeta = TYPE_META[offer.type] ?? TYPE_META.job;
  const initials = getInitials(offer.company);

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        selected
          ? "bg-card border-primary shadow-sm"
          : "bg-card border-border hover:border-border/80"
      }`}
    >
      <div className="flex gap-4 items-start">
        {/* Logo */}
        <div className="size-12 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-muted-foreground">{initials}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground line-clamp-1">{offer.title}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {offer.company} · {offer.city}
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className={`text-[10px] px-2 py-1 rounded ${typeMeta.color}`}>
              {typeMeta.label}
            </span>
            {isNew && (
              <span className="text-[10px] px-2 py-1 rounded bg-highlight text-highlight-foreground flex items-center gap-1">
                <Radio className="size-2" /> Nouveau
              </span>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="text-xs text-muted-foreground shrink-0">
          {formatDateRelative(offer.publishedAt)}
        </div>
      </div>
    </button>
  );
}

function DetailPanel({
  offer,
  applied,
  onApply,
}: {
  offer: JobOffer;
  applied: boolean;
  onApply: () => void;
}) {
  const age = daysAgo(offer.publishedAt);
  const initials = getInitials(offer.company);
  const sourceMeta = SOURCE_META[offer.source] ?? SOURCE_META.local;

  return (
    <div className="sticky top-20 bg-card border border-border rounded-xl p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="size-14 rounded-lg bg-muted border border-border flex items-center justify-center mb-4">
          <span className="text-sm font-semibold text-muted-foreground">{initials}</span>
        </div>
        <div className="text-sm text-muted-foreground">{offer.company}</div>
        <h2 className="font-display text-2xl font-bold text-foreground mt-2">{offer.title}</h2>
        <div className="text-xs text-muted-foreground mt-3">
          {offer.type} · {offer.city} · {formatDateRelative(offer.publishedAt)}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={onApply}
          className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
            applied
              ? "bg-primary-soft text-primary-soft-foreground border border-primary/30"
              : "bg-primary text-primary-foreground hover:bg-primary-hover"
          }`}
        >
          {applied ? <Check className="size-4 mr-2 inline" /> : null}
          {applied ? "Candidature envoyée" : "Postuler"}
        </button>
        <button className="w-full py-3 rounded-lg border border-border text-foreground hover:bg-muted font-semibold text-sm transition-colors flex items-center justify-center gap-2">
          <Heart className="size-4" /> Enregistrer
        </button>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-3 gap-3 py-4 border-y border-border">
        <div>
          <div className="text-[10px] font-medium text-muted-foreground mb-1">Type</div>
          <div className="text-sm font-medium text-foreground">{offer.type}</div>
        </div>
        <div>
          <div className="text-[10px] font-medium text-muted-foreground mb-1">Lieu</div>
          <div className="text-sm font-medium text-foreground">{offer.city}</div>
        </div>
        <div>
          <div className="text-[10px] font-medium text-muted-foreground mb-1">Publié</div>
          <div className="text-sm font-medium text-foreground">{formatDateRelative(offer.publishedAt)}</div>
        </div>
      </div>

      {/* Description */}
      {offer.description && (
        <div>
          <h3 className="font-semibold text-foreground mb-2">À propos du poste</h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-5">{offer.description}</p>
        </div>
      )}

      {/* Source */}
      <div className="pt-4 border-t border-border">
        <div className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${sourceMeta.color}`}>
          <span className="size-1.5 rounded-full bg-current" />
          Offre officielle · {sourceMeta.label}
        </div>
      </div>
    </div>
  );
}
