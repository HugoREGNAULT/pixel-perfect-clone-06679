// @ts-nocheck
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import {
  MapPin, Calendar, Search, X, ArrowUpRight, Briefcase, Check, ExternalLink,
  ChevronLeft, ChevronRight, RefreshCw, WifiOff, GraduationCap, Banknote,
} from "lucide-react";
import { AppNav } from "@/components/AppNav";
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
import { searchJobs, type JobOffer, type SearchResult } from "@/lib/job-search";
import { validateOpportunitesSearch } from "@/lib/opportunites-search";

export const Route = createFileRoute("/opportunites/")({
  validateSearch: validateOpportunitesSearch,
  head: () => ({
    meta: [
      { title: "Opportunités — Springr" },
      { name: "description", content: "Stages, alternances et premiers emplois pour les 15-29 ans." },
    ],
  }),
  component: OpportunitesPage,
});

const PER_PAGE = 20;

const TYPE_OPTIONS = [
  { value: "tous", label: "Tous" },
  { value: "stage", label: "Stage" },
  { value: "alternance", label: "Alternance" },
  { value: "cdi", label: "CDI" },
  { value: "cdd", label: "CDD" },
  { value: "job", label: "Job étudiant" },
];
const TYPE_LABEL: Record<string, string> = Object.fromEntries(TYPE_OPTIONS.map((t) => [t.value, t.label]));

const SOURCE_LABEL: Record<string, string> = {
  france_travail: "France Travail",
  bonne_alternance: "La Bonne Alternance",
  local: "Springr",
};

const EDUCATION_OPTIONS = [
  { value: "", label: "Tous niveaux" },
  { value: "bac", label: "Bac" },
  { value: "bac+2", label: "Bac+2" },
  { value: "bac+3", label: "Bac+3" },
  { value: "bac+5", label: "Bac+5" },
];

function daysAgo(date: string) {
  const now = new Date();
  const d = new Date(date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const offer = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((today.getTime() - offer.getTime()) / 86_400_000);
}

function formatDateRelative(date: string) {
  if (!date || Number.isNaN(new Date(date).getTime())) return "";
  const days = daysAgo(date);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 30) return `Il y a ${days} j`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(date));
}

function OpportunitesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/opportunites/" });

  const type = search.type ?? "tous";
  const city = search.city ?? "";
  const sector = search.sector ?? "";
  const education = search.education ?? "";
  const q = search.q ?? "";
  const page = search.page ?? 1;

  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  // Villes et secteurs réellement rencontrés dans les résultats (jamais de liste inventée)
  const [seenCities, setSeenCities] = useState<string[]>([]);
  const [seenSectors, setSeenSectors] = useState<string[]>([]);

  // Champs texte : valeur locale, poussée dans l'URL après 400 ms
  const [qInput, setQInput] = useState(q);
  const [cityInput, setCityInput] = useState(city);
  useEffect(() => setQInput(q), [q]);
  useEffect(() => setCityInput(city), [city]);

  function update(patch: Record<string, string | number | undefined>) {
    navigate({
      search: (prev) => validateOpportunitesSearch({ ...prev, page: undefined, ...patch }),
      replace: true,
    });
  }

  useEffect(() => {
    if (qInput.trim() === q) return;
    const t = setTimeout(() => update({ q: qInput }), 400);
    return () => clearTimeout(t);
  }, [qInput]);
  useEffect(() => {
    if (cityInput.trim() === city) return;
    const t = setTimeout(() => update({ city: cityInput }), 400);
    return () => clearTimeout(t);
  }, [cityInput]);

  const reqId = useRef(0);
  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);
    setFailed(false);
    searchJobs({ q, type, city, sector, education, page })
      .then((res) => {
        if (id !== reqId.current) return;
        setResult(res);
        setFailed(res.error === "offres_indisponibles" && res.offers.length === 0);
        setSeenCities((prev) => [...new Set([...prev, ...res.offers.map((o) => o.city).filter(Boolean)])].sort());
        setSeenSectors((prev) => [...new Set([...prev, ...res.offers.map((o) => o.sector).filter(Boolean)])].sort());
      })
      .catch(() => {
        if (id !== reqId.current) return;
        setResult(null);
        setFailed(true);
      })
      .finally(() => {
        if (id === reqId.current) setLoading(false);
      });
  }, [q, type, city, sector, education, page, reloadKey]);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!session) return;
        return supabase
          .from("candidatures")
          .select("offre_id")
          .eq("user_id", session.user.id)
          .then(({ data }) => {
            if (data) setApplied(new Set(data.map((c) => c.offre_id)));
          });
      })
      .catch(() => {});
  }, []);

  const sectorOptions = useMemo(() => [...new Set([...(sector ? [sector] : []), ...seenSectors])].sort(), [sector, seenSectors]);
  const hasFilters = type !== "tous" || !!q || !!city || !!sector || !!education;
  const totalPages = result ? Math.ceil(result.total / PER_PAGE) : 1;

  function resetFilters() {
    setQInput("");
    setCityInput("");
    navigate({ search: {}, replace: true });
  }

  async function handleApply(offer: JobOffer) {
    if (offer.source !== "local" && offer.applyUrl) {
      window.open(offer.applyUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (applied.has(offer.id)) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Connecte-toi pour postuler."); return; }
    const { error } = await supabase.from("candidatures").insert({ user_id: session.user.id, offre_id: offer.id });
    if (error && error.code !== "23505") { toast.error("Erreur lors de la candidature."); return; }
    setApplied((prev) => new Set([...prev, offer.id]));
    toast.success(`Candidature envoyée pour « ${offer.title} ».`);
  }

  return (
    <>
      <AppNav />
      <PageShell className="pb-20">
        <SectionHeader
          as="h1"
          eyebrow="Offres"
          title="Opportunités"
          description="Stages, alternances, CDI et jobs étudiants. Les offres viennent de France Travail et de La Bonne Alternance, la source est indiquée sur chaque carte."
        />

        {/* Filtres */}
        <form
          role="search"
          aria-label="Filtrer les offres"
          onSubmit={(e) => { e.preventDefault(); update({ q: qInput, city: cityInput }); }}
          className="mt-8 space-y-4 rounded-lg border border-border bg-card p-4 sm:p-5"
        >
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
            <div className="relative">
              <label htmlFor="offres-q" className="sr-only">Poste, entreprise ou mot-clé</label>
              <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="offres-q" type="search" value={qInput} onChange={(e) => setQInput(e.target.value)}
                placeholder="Poste, entreprise, mot-clé" className="pl-10" />
            </div>
            <div className="relative">
              <label htmlFor="offres-city" className="sr-only">Ville</label>
              <MapPin aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="offres-city" list="offres-villes" value={cityInput} onChange={(e) => setCityInput(e.target.value)}
                placeholder="Ville" className="pl-10" autoComplete="off" />
              <datalist id="offres-villes">
                {seenCities.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          <div role="group" aria-label="Type d'offre" className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((t) => (
              <button key={t.value} type="button" aria-pressed={type === t.value}
                onClick={() => update({ type: t.value === "tous" ? undefined : t.value })}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  type === t.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-card text-foreground hover:bg-muted",
                )}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {sectorOptions.length > 0 && (
              <div>
                <label htmlFor="offres-secteur" className="sr-only">Secteur</label>
                <select id="offres-secteur" value={sector} onChange={(e) => update({ sector: e.target.value })}
                  className={cn(fieldBase, "h-11 w-auto max-w-full")}>
                  <option value="">Tous les secteurs</option>
                  {sectorOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="offres-niveau" className="sr-only">Niveau d'études</label>
              <select id="offres-niveau" value={education} onChange={(e) => update({ education: e.target.value })}
                className={cn(fieldBase, "h-11 w-auto max-w-full")}>
                {EDUCATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {hasFilters && (
              <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
                <X /> Réinitialiser
              </Button>
            )}
          </div>
        </form>

        {/* Résultats */}
        <div className="mt-8" aria-live="polite">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
              {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
            </div>
          ) : failed ? (
            <EmptyState
              icon={<WifiOff />}
              title="Les offres sont indisponibles pour le moment"
              description="Ce n'est pas lié à ta recherche : nous n'arrivons pas à joindre les sources d'offres. Réessaie dans quelques instants."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button onClick={() => setReloadKey((k) => k + 1)}><RefreshCw /> Réessayer</Button>
                  {hasFilters && <Button variant="secondary" onClick={resetFilters}>Retirer les filtres</Button>}
                </div>
              }
            />
          ) : !result || result.offers.length === 0 ? (
            <NoResults q={q} type={type} city={city} sector={sector} education={education}
              hasFilters={hasFilters} update={update} onReset={resetFilters} />
          ) : (
            <>
              <p className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span>
                  <strong className="font-display text-lg text-foreground">{result.total.toLocaleString("fr-FR")}</strong>{" "}
                  offre{result.total > 1 ? "s" : ""}{hasFilters ? " correspondant à tes filtres" : ""}
                </span>
                {result.errors?.france_travail && <Badge variant="warning">France Travail indisponible</Badge>}
                {result.errors?.bonne_alternance && <Badge variant="warning">La Bonne Alternance indisponible</Badge>}
              </p>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {result.offers.map((offer) => (
                  <li key={offer.id} className="flex">
                    <OfferCard offer={offer} applied={applied.has(offer.id)} onApply={() => handleApply(offer)} />
                  </li>
                ))}
              </ul>

              {totalPages > 1 && (
                <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3">
                  <Button variant="secondary" disabled={page <= 1}
                    onClick={() => navigate({ search: (p) => validateOpportunitesSearch({ ...p, page: page - 1 }), replace: true })}>
                    <ChevronLeft /> Précédent
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {page} sur {totalPages}</span>
                  <Button variant="secondary" disabled={page >= totalPages}
                    onClick={() => navigate({ search: (p) => validateOpportunitesSearch({ ...p, page: page + 1 }), replace: true })}>
                    Suivant <ChevronRight />
                  </Button>
                </nav>
              )}
            </>
          )}
        </div>
      </PageShell>
    </>
  );
}

/* Aucun résultat : propose des actions précises selon les filtres posés */
function NoResults({ q, type, city, sector, education, hasFilters, update, onReset }) {
  const actions = [];
  if (city) actions.push(<Button key="city" variant="secondary" onClick={() => update({ city: undefined })}>Élargis la ville : retire « {city} »</Button>);
  if (type !== "tous") actions.push(<Button key="type" variant="secondary" onClick={() => update({ type: undefined })}>Retire le filtre « {TYPE_LABEL[type] ?? type} »</Button>);
  if (sector) actions.push(<Button key="sector" variant="secondary" onClick={() => update({ sector: undefined })}>Retire le secteur « {sector} »</Button>);
  if (education) actions.push(<Button key="edu" variant="secondary" onClick={() => update({ education: undefined })}>Retire le niveau d'études</Button>);
  if (q) actions.push(<Button key="q" variant="secondary" onClick={() => update({ q: undefined })}>Essaie sans le mot-clé « {q} »</Button>);
  return (
    <EmptyState
      icon={<Briefcase />}
      title={hasFilters ? "Aucune offre ne correspond à ta recherche" : "Pas encore d'offres"}
      description={hasFilters
        ? "Les sources répondent, mais rien ne colle à ces critères. Élargis ta recherche :"
        : "Aucune offre n'est publiée pour l'instant. Reviens bientôt."}
      action={hasFilters ? (
        <div className="flex flex-wrap justify-center gap-3">
          {actions}
          <Button onClick={onReset}>Voir les offres récentes</Button>
        </div>
      ) : undefined}
    />
  );
}

function OfferCard({ offer, applied, onApply }: { offer: JobOffer; applied: boolean; onApply: () => void }) {
  const isExternal = offer.source !== "local";
  const isNew = offer.publishedAt && daysAgo(offer.publishedAt) < 3;
  const date = formatDateRelative(offer.publishedAt);
  return (
    <Card interactive className="flex w-full flex-col p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-soft font-display font-bold text-primary-soft-foreground">
          {(offer.company?.[0] ?? "?").toUpperCase()}
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {isNew && <Badge variant="highlight">Nouveau</Badge>}
          <Badge>{TYPE_LABEL[offer.type] ?? "Job étudiant"}</Badge>
        </div>
      </div>

      <h2 className="line-clamp-2 font-display text-base font-semibold leading-snug text-foreground">{offer.title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{offer.company}</p>

      {offer.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{offer.description}</p>}

      {offer.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {offer.tags.slice(0, 3).map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
        </div>
      )}

      <dl className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin aria-hidden className="size-4 shrink-0" />
          <dt className="sr-only">Lieu</dt>
          <dd className="truncate">{offer.city || "Lieu non précisé"}{offer.remote && " · Télétravail"}</dd>
        </div>
        {date && (
          <div className="flex items-center gap-2">
            <Calendar aria-hidden className="size-4 shrink-0" />
            <dt className="sr-only">Publiée</dt>
            <dd>{date}</dd>
          </div>
        )}
        {offer.salary && (
          <div className="flex items-center gap-2">
            <Banknote aria-hidden className="size-4 shrink-0" />
            <dt className="sr-only">Rémunération</dt>
            <dd>{offer.salary}</dd>
          </div>
        )}
        {offer.education && (
          <div className="flex items-center gap-2">
            <GraduationCap aria-hidden className="size-4 shrink-0" />
            <dt className="sr-only">Niveau</dt>
            <dd>{offer.education}</dd>
          </div>
        )}
      </dl>

      <div className="mt-auto pt-4">
        <p className="mb-3 text-xs text-muted-foreground">
          {isExternal ? `Source : ${SOURCE_LABEL[offer.source] ?? offer.source}` : "Publiée sur Springr"}
        </p>
        {!isExternal && applied ? (
          <Button variant="secondary" disabled className="w-full"><Check /> Candidature envoyée</Button>
        ) : (
          <Button onClick={onApply} className="w-full">
            Postuler {isExternal ? <ExternalLink /> : <ArrowUpRight />}
          </Button>
        )}
      </div>
    </Card>
  );
}
