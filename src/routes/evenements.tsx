import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { AppNav } from "@/components/AppNav";
import {
  Calendar, MapPin, X, ExternalLink, SlidersHorizontal,
  CalendarDays, Loader2, GraduationCap, Clock, School,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/evenements")({
  head: () => ({
    meta: [
      { title: "JPO Écoles de France — Springr" },
      { name: "description", content: "Toutes les Journées Portes Ouvertes des écoles et universités de France. Filtres par région, type, mois." },
    ],
  }),
  component: EvenementsPage,
});

/* ── Types ───────────────────────────────────────────────────────────────────*/

type TypeEcole = "université" | "école de commerce" | "ingé" | "BTS" | "lycée" | "autre";

type Jpo = Tables<"jpos">;

/* ── Config d'affichage ──────────────────────────────────────────────────────*/

const TYPE_CONFIG: Record<TypeEcole, { label: string; color: string; bg: string; border: string; icon: typeof School }> = {
  "université":          { label: "Université",       color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/30",   icon: School         },
  "école de commerce":   { label: "École de commerce",color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/30",  icon: GraduationCap  },
  "ingé":                { label: "École d'ingénieurs",color: "text-violet-soft",bg: "bg-violet/10",     border: "border-violet/30",     icon: GraduationCap  },
  "BTS":                 { label: "BTS / IUT",        color: "text-cyan-400",   bg: "bg-cyan-400/10",   border: "border-cyan-400/30",   icon: School         },
  "lycée":               { label: "Lycée",            color: "text-lime",       bg: "bg-lime/10",       border: "border-lime/30",       icon: School         },
  "autre":               { label: "Autre",            color: "text-mute",       bg: "bg-white/5",       border: "border-white/10",      icon: School         },
};

const TYPE_LIST: TypeEcole[] = ["université", "école de commerce", "ingé", "BTS", "lycée", "autre"];

/* ── Helpers ─────────────────────────────────────────────────────────────────*/

function formatDateFR(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "long", year: "numeric" })
    .format(new Date(iso + "T12:00:00"));
}

function dayDiff(iso: string) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const d   = new Date(iso + "T00:00:00");
  return Math.round((d.getTime() - now.getTime()) / 86_400_000);
}

function isUpcoming(iso: string) { return dayDiff(iso) >= 0; }
function isSoon(iso: string)     { const d = dayDiff(iso); return d >= 0 && d <= 7; }
function inSixMonths(iso: string){ const d = dayDiff(iso); return d >= 0 && d <= 180; }

function monthKey(iso: string) { return iso.slice(0, 7); }

function monthLabel(key: string) {
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" })
    .format(new Date(key + "-02"));
}

/* ── Page ─────────────────────────────────────────────────────────────────────*/

function EvenementsPage() {
  const [jpos, setJpos]           = useState<Jpo[]>([]);
  const [loading, setLoading]     = useState(true);
  const [typeFilter, setType]     = useState<"Tous" | TypeEcole>("Tous");
  const [regionFilter, setRegion] = useState("Toutes");
  const [monthFilter, setMonth]   = useState("Tous");
  const [search, setSearch]       = useState("");
  const [showPast, setShowPast]   = useState(false);

  useEffect(() => {
    supabase
      .from("jpos")
      .select("*")
      .order("date", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setJpos(data as Jpo[]);
        setLoading(false);
      });
  }, []);

  /* Dérivés */
  const regions = useMemo(
    () => ["Toutes", ...Array.from(new Set(jpos.map((j) => j.region))).sort()],
    [jpos],
  );

  const months = useMemo(() => {
    const keys = Array.from(new Set(jpos.filter((j) => isUpcoming(j.date)).map((j) => monthKey(j.date)))).sort();
    return ["Tous", ...keys];
  }, [jpos]);

  const upcoming6m = useMemo(() => jpos.filter((j) => inSixMonths(j.date)).length, [jpos]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return jpos.filter((j) => {
      if (!showPast && !isUpcoming(j.date)) return false;
      if (typeFilter !== "Tous" && j.type_ecole !== typeFilter) return false;
      if (regionFilter !== "Toutes" && j.region !== regionFilter) return false;
      if (monthFilter !== "Tous" && monthKey(j.date) !== monthFilter) return false;
      if (q && !j.nom_ecole.toLowerCase().includes(q) && !j.ville.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [jpos, typeFilter, regionFilter, monthFilter, search, showPast]);

  const hasFilters = typeFilter !== "Tous" || regionFilter !== "Toutes" || monthFilter !== "Tous" || search || showPast;

  function reset() { setType("Tous"); setRegion("Toutes"); setMonth("Tous"); setSearch(""); setShowPast(false); }

  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />

      <main className="mx-auto max-w-5xl px-5 py-10 pb-24">

        {/* ── Hero ──────────────────────────────────────────────────────────*/}
        <div className="mb-8">
          <div className="eyebrow mb-3">Scraped automatiquement · Mis à jour chaque lundi</div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
            JPO — Portes Ouvertes
          </h1>
          <p className="mt-4 text-mute text-lg max-w-xl">
            Toutes les journées portes ouvertes des écoles et universités de France, au même endroit.
          </p>
        </div>

        {/* ── Compteur 6 mois ───────────────────────────────────────────────*/}
        {!loading && upcoming6m > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-lime/20 bg-lime/5 px-5 py-4 mb-8">
            <CalendarDays className="size-5 text-lime shrink-0" />
            <p className="text-sm">
              <span className="font-display font-bold text-white text-lg">{upcoming6m}</span>
              <span className="text-mute ml-2">JPO à venir dans les 6 prochains mois</span>
            </p>
          </div>
        )}

        {/* ── Filtres ───────────────────────────────────────────────────────*/}
        <div className="sticky top-14 z-30 -mx-5 px-5 py-4 bg-ink/90 backdrop-blur-xl border-b border-white/5 mb-8 space-y-3">
          {/* Search + reset */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <School className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-mute pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom d'école, ville…"
                className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-9 py-2.5 text-sm placeholder:text-mute/60 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-white">
                  <X className="size-4" />
                </button>
              )}
            </div>

            <select
              value={regionFilter}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-mute focus:outline-none focus:border-violet/60 focus:text-white transition-colors cursor-pointer"
            >
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>

            <select
              value={monthFilter}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-mute focus:outline-none focus:border-violet/60 focus:text-white transition-colors cursor-pointer"
            >
              {months.map((m) => (
                <option key={m} value={m}>{m === "Tous" ? "Tous les mois" : monthLabel(m)}</option>
              ))}
            </select>

            {hasFilters && (
              <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-white transition-colors whitespace-nowrap">
                <X className="size-3.5" /> Réinitialiser
              </button>
            )}
          </div>

          {/* Type pills */}
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="size-4 text-mute shrink-0" />
            <button
              onClick={() => setType("Tous")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${typeFilter === "Tous" ? "bg-white text-ink border-white" : "border-white/15 text-mute hover:border-white/30 hover:text-white"}`}
            >
              Tous types
            </button>
            {TYPE_LIST.map((t) => {
              const cfg = TYPE_CONFIG[t];
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                    typeFilter === t
                      ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                      : "border-white/15 text-mute hover:border-white/30 hover:text-white"
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}

            <div className="w-px h-4 bg-white/10 mx-1" />
            <button
              onClick={() => setShowPast(!showPast)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${showPast ? "bg-white/10 border-white/30 text-white" : "border-white/15 text-mute hover:border-white/30 hover:text-white"}`}
            >
              Afficher les passées
            </button>
          </div>
        </div>

        {/* ── Compteur résultats ─────────────────────────────────────────────*/}
        <div className="flex items-center gap-3 mb-6">
          <span className="font-display font-bold text-2xl">{filtered.length}</span>
          <span className="text-mute text-sm">JPO{filtered.length !== 1 ? "s" : ""}</span>
          {hasFilters && <span className="text-xs font-mono text-lime bg-lime/10 border border-lime/20 rounded-full px-2 py-0.5">Filtres actifs</span>}
        </div>

        {/* ── Liste ─────────────────────────────────────────────────────────*/}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="size-7 text-mute animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <CalendarDays className="size-10 text-mute mb-4" />
            <h3 className="font-display text-xl font-bold mb-2">Aucune JPO trouvée</h3>
            <p className="text-mute text-sm max-w-xs mb-6">
              Essaie de modifier tes filtres ou d'élargir ta recherche.
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm hover:bg-white/5 transition-all"
            >
              <X className="size-4" /> Réinitialiser
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((jpo) => <JpoCard key={jpo.id} jpo={jpo} />)}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Carte JPO ───────────────────────────────────────────────────────────────*/

function JpoCard({ jpo }: { jpo: Jpo }) {
  const type    = (jpo.type_ecole as TypeEcole) in TYPE_CONFIG ? (jpo.type_ecole as TypeEcole) : "autre";
  const cfg     = TYPE_CONFIG[type];
  const past    = !isUpcoming(jpo.date);
  const soon    = isSoon(jpo.date);
  const diff    = dayDiff(jpo.date);

  return (
    <article className={`group flex flex-col sm:flex-row gap-4 sm:gap-6 rounded-2xl border p-5 hover:-translate-y-0.5 transition-all duration-200 ${
      past
        ? "border-white/5 bg-white/[0.02] opacity-50"
        : soon
        ? "border-lime/25 bg-gradient-to-r from-lime/5 to-transparent hover:border-lime/40"
        : "border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-white/20"
    }`}>

      {/* Date block */}
      <div className="shrink-0 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1">
        <div className={`rounded-xl border px-3 py-2 text-center min-w-[4rem] ${soon ? "border-lime/30 bg-lime/10" : "border-white/10 bg-white/5"}`}>
          <div className={`font-mono text-[10px] uppercase tracking-widest ${soon ? "text-lime" : "text-mute"}`}>
            {new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(new Date(jpo.date + "T12:00:00"))}
          </div>
          <div className={`font-display font-bold text-2xl leading-none ${soon ? "text-lime" : ""}`}>
            {new Date(jpo.date + "T12:00:00").getDate()}
          </div>
          <div className="font-mono text-[10px] text-mute">
            {new Date(jpo.date + "T12:00:00").getFullYear()}
          </div>
        </div>

        {/* Badge timing */}
        {!past && (
          soon ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-lime bg-lime/10 border border-lime/25 rounded-full px-2 py-0.5 whitespace-nowrap">
              <Clock className="size-2.5" />
              {diff === 0 ? "Aujourd'hui" : diff === 1 ? "Demain" : `Dans ${diff}j`}
            </span>
          ) : diff <= 30 ? (
            <span className="text-[10px] font-mono text-mute whitespace-nowrap">Dans {diff}j</span>
          ) : null
        )}
        {past && <span className="text-[10px] font-mono text-mute border border-white/10 rounded-full px-2 py-0.5">Passée</span>}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider border rounded-full px-2 py-0.5 ${cfg.bg} ${cfg.border} ${cfg.color}`}>
            {cfg.label}
          </span>
          {soon && !past && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-lime bg-lime/10 border border-lime/25 rounded-full px-2 py-0.5">
              Bientôt
            </span>
          )}
        </div>

        <h2 className="font-display font-bold text-base sm:text-lg leading-snug mb-1 group-hover:text-lime transition-colors">
          {jpo.nom_ecole}
        </h2>

        <div className="flex flex-wrap items-center gap-4 text-xs text-mute mt-2">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3 shrink-0" />
            {jpo.ville}
            {jpo.region && jpo.region !== "France" && jpo.region !== jpo.ville && (
              <span className="text-white/30">· {jpo.region}</span>
            )}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3 shrink-0" />
            {formatDateFR(jpo.date)}
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="shrink-0 flex sm:flex-col items-end justify-start gap-2 pt-0.5">
        {jpo.lien_inscription && !past ? (
          <a
            href={jpo.lien_inscription}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              soon
                ? "bg-lime text-ink hover:-translate-y-0.5 hover:shadow-[0_0_20px_-4px_rgba(181,255,61,0.4)]"
                : "border border-white/15 text-white hover:bg-white/5 hover:border-white/30"
            }`}
          >
            S'inscrire <ExternalLink className="size-3.5" />
          </a>
        ) : past ? (
          <span className="text-xs text-mute border border-white/10 rounded-full px-4 py-2">Terminée</span>
        ) : (
          <span className="text-xs text-mute border border-white/10 rounded-full px-4 py-2">Lien bientôt</span>
        )}
      </div>
    </article>
  );
}
