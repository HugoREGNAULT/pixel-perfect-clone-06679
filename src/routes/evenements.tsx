// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { AppNav } from "@/components/AppNav";
import {
  Calendar, MapPin, X, ExternalLink, CalendarDays, Clock, School, WifiOff, RefreshCw,
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
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/evenements")({
  head: () => ({
    meta: [
      { title: "Événements — Springr" },
      { name: "description", content: "Les journées portes ouvertes des écoles et universités. Filtre par région, type d'établissement et mois." },
    ],
  }),
  component: EvenementsPage,
});

/* ── Types ───────────────────────────────────────────────────────────────────*/

type TypeEcole = "université" | "école de commerce" | "ingé" | "BTS" | "lycée" | "autre";

type Jpo = Tables<"jpos">;

type JpoEvent = Jpo & { source?: "jpos" | "submissions" };

/* ── Config d'affichage ──────────────────────────────────────────────────────*/

const TYPE_LABEL: Record<TypeEcole, string> = {
  "université": "Université",
  "école de commerce": "École de commerce",
  "ingé": "École d'ingénieurs",
  "BTS": "BTS / IUT",
  "lycée": "Lycée",
  "autre": "Autre",
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
  const [failed, setFailed]       = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [typeFilter, setType]     = useState<"Tous" | TypeEcole>("Tous");
  const [regionFilter, setRegion] = useState("Toutes");
  const [monthFilter, setMonth]   = useState("Tous");
  const [search, setSearch]       = useState("");
  const [showPast, setShowPast]   = useState(false);

  useEffect(() => {
    const db = supabase as any;
    setLoading(true);
    setFailed(false);
    Promise.all([
      db.from("jpos").select("*").order("date", { ascending: true }),
      db.from("jpo_submissions").select("*").eq("status", "approved").order("date_jpo", { ascending: true }),
    ])
      .then(([{ data: jposData, error: jposError }, { data: subData }]) => {
        if (jposError) setFailed(true);

        const jposArray = (jposData ?? []) as Jpo[];
        const submissionsArray = (subData ?? []).map((s: any) => ({
          id: s.id,
          nom_ecole: s.nom_ecole,
          date: s.date_jpo,
          ville: "",
          region: "",
          type_ecole: "autre" as TypeEcole,
          lien_inscription: s.lien,
          updated_at: s.created_at,
          source: "submissions" as const,
        }));

        const combined = [...jposArray, ...submissionsArray]
          .filter((j: any) => j.date)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setJpos(combined as any);
        setLoading(false);
      })
      .catch(() => { setFailed(true); setLoading(false); });
  }, [reloadKey]);

  const regions = useMemo(
    () => ["Toutes", ...Array.from(new Set(jpos.map((j) => j.region).filter(Boolean))).sort()],
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
      if (q && !j.nom_ecole.toLowerCase().includes(q) && !(j.ville ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [jpos, typeFilter, regionFilter, monthFilter, search, showPast]);

  const hasFilters = typeFilter !== "Tous" || regionFilter !== "Toutes" || monthFilter !== "Tous" || !!search;

  function reset() { setType("Tous"); setRegion("Toutes"); setMonth("Tous"); setSearch(""); }

  const pill = (on: boolean) => cn(
    "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    on ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-foreground hover:bg-muted",
  );

  return (
    <>
      <AppNav />
      <PageShell size="md" className="pb-20">
        <SectionHeader
          as="h1"
          eyebrow="Journées portes ouvertes"
          title="Événements"
          description="Les journées portes ouvertes des écoles et universités. Vérifie la date et les modalités d'inscription auprès de l'établissement."
        />

        {!loading && !failed && upcoming6m > 0 && (
          <p className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-primary-soft px-4 py-3 text-sm text-primary-soft-foreground">
            <CalendarDays aria-hidden className="size-5 shrink-0" />
            <span><strong className="font-display text-lg">{upcoming6m}</strong> JPO à venir dans les 6 prochains mois</span>
          </p>
        )}

        <div role="search" aria-label="Filtrer les événements" className="mt-8 space-y-4 rounded-lg border border-border bg-card p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="relative">
              <label htmlFor="ev-search" className="sr-only">Nom d'école ou ville</label>
              <School aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="ev-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom d'école, ville" className="pl-10" />
            </div>
            <div>
              <label htmlFor="ev-region" className="sr-only">Région</label>
              <select id="ev-region" value={regionFilter} onChange={(e) => setRegion(e.target.value)} className={cn(fieldBase, "h-11")}>
                {regions.map((r) => <option key={r} value={r}>{r === "Toutes" ? "Toutes les régions" : r}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="ev-month" className="sr-only">Mois</label>
              <select id="ev-month" value={monthFilter} onChange={(e) => setMonth(e.target.value)} className={cn(fieldBase, "h-11")}>
                {months.map((m) => <option key={m} value={m}>{m === "Tous" ? "Tous les mois" : monthLabel(m)}</option>)}
              </select>
            </div>
          </div>

          <div role="group" aria-label="Type d'établissement" className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={typeFilter === "Tous"} onClick={() => setType("Tous")} className={pill(typeFilter === "Tous")}>Tous types</button>
            {TYPE_LIST.map((t) => (
              <button key={t} type="button" aria-pressed={typeFilter === t} onClick={() => setType(t)} className={pill(typeFilter === t)}>
                {TYPE_LABEL[t]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" aria-pressed={showPast} onClick={() => setShowPast(!showPast)} className={pill(showPast)}>
              Afficher les passées
            </button>
            {hasFilters && <Button type="button" variant="ghost" size="sm" onClick={reset}><X /> Réinitialiser</Button>}
          </div>
        </div>

        <div className="mt-8" aria-live="polite">
          {loading ? (
            <div className="space-y-3" aria-busy="true">
              {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
            </div>
          ) : failed ? (
            <EmptyState
              icon={<WifiOff />}
              title="Les événements sont indisponibles pour le moment"
              description="Nous n'arrivons pas à charger la liste. Ça ne vient pas de tes filtres : réessaie dans quelques instants."
              action={<Button onClick={() => setReloadKey((k) => k + 1)}><RefreshCw /> Réessayer</Button>}
            />
          ) : jpos.length === 0 ? (
            <EmptyState icon={<CalendarDays />} title="Pas encore d'événements" description="Aucune journée portes ouvertes n'est publiée pour l'instant. Reviens bientôt." />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<CalendarDays />}
              title="Aucun événement ne correspond"
              description={showPast || hasFilters ? "Essaie d'élargir tes filtres." : "Aucune JPO à venir. Tu peux afficher les passées."}
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  {hasFilters && <Button variant="secondary" onClick={reset}>Retirer les filtres</Button>}
                  {!showPast && <Button variant="secondary" onClick={() => setShowPast(true)}>Afficher les passées</Button>}
                </div>
              }
            />
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                <strong className="font-display text-lg text-foreground">{filtered.length}</strong> JPO
              </p>
              <ul className="space-y-3">
                {filtered.map((jpo) => <li key={jpo.id}><JpoCard jpo={jpo} /></li>)}
              </ul>
            </>
          )}
        </div>
      </PageShell>
    </>
  );
}

/* ── Carte JPO ───────────────────────────────────────────────────────────────*/

function JpoCard({ jpo }: { jpo: Jpo }) {
  const type = (jpo.type_ecole as TypeEcole) in TYPE_LABEL ? (jpo.type_ecole as TypeEcole) : "autre";
  const past = !isUpcoming(jpo.date);
  const soon = isSoon(jpo.date);
  const diff = dayDiff(jpo.date);
  const d = new Date(jpo.date + "T12:00:00");

  return (
    <Card interactive={!past} className={cn("flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6", past && "bg-muted")}>
      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-start">
        <div className={cn("min-w-16 rounded-md border px-3 py-2 text-center", soon ? "border-primary bg-primary-soft text-primary-soft-foreground" : "border-border bg-muted text-foreground")}>
          <div className="text-xs font-semibold uppercase">{new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(d)}</div>
          <div className="font-display text-2xl font-bold leading-none">{d.getDate()}</div>
          <div className="text-xs text-muted-foreground">{d.getFullYear()}</div>
        </div>
        {!past && soon && (
          <Badge variant="highlight"><Clock aria-hidden className="size-3.5" />{diff === 0 ? "Aujourd'hui" : diff === 1 ? "Demain" : `Dans ${diff} j`}</Badge>
        )}
        {!past && !soon && diff <= 30 && <span className="text-sm text-muted-foreground">Dans {diff} j</span>}
        {past && <Badge variant="secondary">Passée</Badge>}
      </div>

      <div className="min-w-0 flex-1">
        <Badge variant="secondary" className="mb-2">{TYPE_LABEL[type]}</Badge>
        <h2 className="font-display text-lg font-semibold leading-snug text-foreground">{jpo.nom_ecole}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {jpo.ville && (
            <span className="flex items-center gap-1.5">
              <MapPin aria-hidden className="size-4 shrink-0" />
              {jpo.ville}
              {jpo.region && jpo.region !== "France" && jpo.region !== jpo.ville && <span>· {jpo.region}</span>}
            </span>
          )}
          <span className="flex items-center gap-1.5"><Calendar aria-hidden className="size-4 shrink-0" />{formatDateFR(jpo.date)}</span>
        </div>
      </div>

      <div className="shrink-0">
        {jpo.lien_inscription && !past ? (
          <Button asChild variant={soon ? "primary" : "secondary"} className="w-full sm:w-auto">
            <a href={jpo.lien_inscription} target="_blank" rel="noopener noreferrer">S'inscrire <ExternalLink /></a>
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">{past ? "Terminée" : "Lien bientôt disponible"}</span>
        )}
      </div>
    </Card>
  );
}
