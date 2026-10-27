import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Search, X, GraduationCap, MapPin, Users, Building2,
  ChevronLeft, ChevronRight, SlidersHorizontal, WifiOff,
} from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { EcoleLogo } from "@/components/ecoles/EcoleLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, fieldBase } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ecoles/")({
  head: () => ({
    meta: [
      { title: "Annuaire des écoles | Springr" },
      { name: "description", content: "Explore les universités, grandes écoles, lycées et IUT. Filtre par région, type et statut." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
    type: (search.type as string) || "",
    region: (search.region as string) || "",
    statut: (search.statut as string) || "",
    page: Number(search.page) || 1,
  }),
  component: EcolesPage,
});

type Ecole = Record<string, any>;

const PAGE_SIZE = 24;

const TYPES = [
  "Université", "Grande école", "École d'ingénieurs", "École de commerce et de gestion",
  "Institut d'études politiques", "École normale supérieure", "Institut universitaire de technologie",
  "Lycée général et technologique", "Lycée professionnel", "CPGE", "STS",
];

const REGIONS = [
  "Île-de-France", "Auvergne-Rhône-Alpes", "Nouvelle-Aquitaine", "Occitanie", "Hauts-de-France",
  "Provence-Alpes-Côte d'Azur", "Grand Est", "Pays de la Loire", "Bretagne", "Normandie",
  "Bourgogne-Franche-Comté", "Centre-Val de Loire", "Corse", "Guadeloupe", "Martinique", "La Réunion", "Mayotte",
];

function typeLabel(type: string | null): string {
  if (!type) return "Établissement";
  if (type.includes("Lycée prof")) return "Lycée pro";
  if (type.includes("Lycée")) return "Lycée";
  if (type.includes("commerce") || type.includes("gestion")) return "École de commerce";
  if (type.includes("ingénieur") || type.includes("ingenieur")) return "École d'ingénieurs";
  if (type.includes("université") || type.includes("Université")) return "Université";
  if (type.includes("IUT") || type.includes("universitaire de technologie")) return "IUT";
  if (type.includes("normale")) return "ENS";
  if (type.includes("politiques")) return "IEP";
  return type.slice(0, 22);
}

function EcolesPage() {
  const { q, type, region, statut, page } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [ecoles, setEcoles] = useState<Ecole[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [qVal, setQVal] = useState(q);
  const [typeVal, setTypeVal] = useState(type);
  const [regionVal, setRegionVal] = useState(region);
  const [statutVal, setStatutVal] = useState(statut);

  const offset = (page - 1) * PAGE_SIZE;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("ecoles")
      .select("id, name, type, city, type_etablissement, statut, region, slug, nombre_etudiants, diplomes", { count: "exact" })
      .order("nombre_etudiants", { ascending: false, nullsFirst: false })
      .order("name")
      .range(offset, offset + PAGE_SIZE - 1);

    if (q) query = query.ilike("name", `%${q}%`);
    if (type) query = query.ilike("type_etablissement", `%${type}%`);
    if (region) query = query.eq("region", region);
    if (statut) query = query.eq("statut", statut);

    const { data, count, error } = await query;
    if (error || !data) {
      setFailed(true);
      setEcoles([]);
      setTotal(0);
    } else {
      setFailed(false);
      setEcoles(data as Ecole[]);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [q, type, region, statut, offset]);

  useEffect(() => { load(); }, [load]);

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ search: { q: qVal, type: typeVal, region: regionVal, statut: statutVal, page: 1 } });
  }

  function clearFilters() {
    setQVal(""); setTypeVal(""); setRegionVal(""); setStatutVal("");
    navigate({ search: { q: "", type: "", region: "", statut: "", page: 1 } });
  }

  function goPage(p: number) {
    navigate({ search: { q, type, region, statut, page: p } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const hasFilters = !!(q || type || region || statut);
  const selectCls = cn(fieldBase, "h-11 py-2");

  return (
    <div className="bg-background text-foreground">
      <AppNav />

      <PageShell className="pb-8">
        <SectionHeader
          as="h1"
          eyebrow="Annuaire"
          title="Annuaire des écoles"
          description="Universités, grandes écoles, lycées, IUT : cherche par nom, région ou type d'établissement."
        />

        <form onSubmit={applySearch} className="mt-8 space-y-4" role="search">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1 sm:max-w-lg">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={qVal}
                onChange={(e) => setQVal(e.target.value)}
                placeholder="Rechercher un établissement…"
                aria-label="Rechercher un établissement"
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowFilters((f) => !f)}
                aria-expanded={showFilters}
                aria-controls="filtres-ecoles"
              >
                <SlidersHorizontal aria-hidden="true" />
                Filtres
                {hasFilters && <span className="size-2 rounded-full bg-primary" aria-label="filtres actifs" />}
              </Button>
              <Button type="submit">Chercher</Button>
            </div>
          </div>

          {showFilters && (
            <div id="filtres-ecoles" className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-3">
              <div>
                <label htmlFor="f-type" className="mb-1.5 block text-sm font-semibold">Type</label>
                <select id="f-type" value={typeVal} onChange={(e) => setTypeVal(e.target.value)} className={selectCls}>
                  <option value="">Tous les types</option>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="f-region" className="mb-1.5 block text-sm font-semibold">Région</label>
                <select id="f-region" value={regionVal} onChange={(e) => setRegionVal(e.target.value)} className={selectCls}>
                  <option value="">Toutes les régions</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="f-statut" className="mb-1.5 block text-sm font-semibold">Statut</label>
                <select id="f-statut" value={statutVal} onChange={(e) => setStatutVal(e.target.value)} className={selectCls}>
                  <option value="">Public et privé</option>
                  <option value="public">Public</option>
                  <option value="privé">Privé</option>
                </select>
              </div>
            </div>
          )}
        </form>

        <div className="mt-8 min-h-[2.75rem]" aria-live="polite">
          {!loading && !failed && ecoles.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-foreground-2">
                <span className="font-display text-lg font-bold text-foreground">{total.toLocaleString("fr-FR")}</span>{" "}
                établissement{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}
              </p>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X aria-hidden="true" /> Réinitialiser
                </Button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-36 rounded-lg" />)}
          </div>
        ) : failed ? (
          <EmptyState
            icon={<WifiOff />}
            title="Annuaire indisponible pour le moment"
            description="On n'arrive pas à charger les écoles. Réessaie dans quelques instants."
            action={<Button onClick={load}>Réessayer</Button>}
          />
        ) : ecoles.length === 0 ? (
          <EmptyState
            icon={<GraduationCap />}
            title={hasFilters ? "Aucune école ne correspond" : "Pas encore d'écoles dans l'annuaire"}
            description={hasFilters ? "Retire un filtre ou change le nom que tu cherches." : "L'annuaire se remplit : reviens bientôt."}
            action={hasFilters ? (
              <Button variant="secondary" onClick={clearFilters}><X aria-hidden="true" /> Retirer les filtres</Button>
            ) : undefined}
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ecoles.map((e) => <li key={e.id} className="contents"><EcoleCard ecole={e} /></li>)}
          </ul>
        )}

        {totalPages > 1 && !failed && (
          <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => goPage(page - 1)} disabled={page <= 1}>
              <ChevronLeft aria-hidden="true" /> Précédent
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p: number;
              if (totalPages <= 5 || page <= 3) p = i + 1;
              else if (page >= totalPages - 2) p = totalPages - 4 + i;
              else p = page - 2 + i;
              return (
                <Button
                  key={p}
                  size="icon"
                  variant={p === page ? "primary" : "secondary"}
                  onClick={() => goPage(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </Button>
              );
            })}
            <Button variant="secondary" size="sm" onClick={() => goPage(page + 1)} disabled={page >= totalPages}>
              Suivant <ChevronRight aria-hidden="true" />
            </Button>
          </nav>
        )}
      </PageShell>
    </div>
  );
}

function EcoleCard({ ecole }: { ecole: Ecole }) {
  const label = typeLabel(ecole.type_etablissement ?? ecole.type);

  const body = (
    <Card interactive className="flex h-full flex-col p-5">
      <EcoleLogo ecole={ecole} className="mb-4 size-12" />
      <h2 className="line-clamp-2 text-h4 font-semibold leading-snug text-foreground">{ecole.name}</h2>
      <p className="mb-3 mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{ecole.city}{ecole.region ? ` · ${ecole.region}` : ""}</span>
      </p>
      <div className="mt-auto flex flex-wrap gap-2">
        <Badge><Building2 className="size-3.5" aria-hidden="true" />{label}</Badge>
        {ecole.statut && (
          <Badge variant={ecole.statut === "privé" ? "warning" : "success"}>{ecole.statut === "privé" ? "Privé" : "Public"}</Badge>
        )}
        {ecole.nombre_etudiants ? (
          <Badge variant="secondary"><Users className="size-3.5" aria-hidden="true" />{ecole.nombre_etudiants.toLocaleString("fr-FR")}</Badge>
        ) : null}
      </div>
    </Card>
  );

  return ecole.slug ? (
    <Link to="/ecoles/$slug" params={{ slug: ecole.slug }} className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      {body}
    </Link>
  ) : (
    <div>{body}</div>
  );
}
