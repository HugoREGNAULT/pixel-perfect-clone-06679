// @ts-nocheck
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { AppNav } from "@/components/AppNav";
import {
  Search, X, Loader2, GraduationCap, MapPin, Users,
  Building2, ChevronLeft, ChevronRight, SlidersHorizontal,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/ecoles/")({
  head: () => ({
    meta: [
      { title: "Annuaire des Écoles — Springr" },
      { name: "description", content: "Explore toutes les universités, grandes écoles, lycées et IUT de France. Filtres par région, type, statut." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    q:      (search.q      as string) || "",
    type:   (search.type   as string) || "",
    region: (search.region as string) || "",
    statut: (search.statut as string) || "",
    page:   Number(search.page) || 1,
  }),
  component: EcolesPage,
});

type Ecole = Tables<"ecoles">;

const PAGE_SIZE = 24;

const TYPES = [
  "Université",
  "Grande école",
  "École d'ingénieurs",
  "École de commerce et de gestion",
  "Institut d'études politiques",
  "École normale supérieure",
  "Institut universitaire de technologie",
  "Lycée général et technologique",
  "Lycée professionnel",
  "CPGE",
  "STS",
];

const REGIONS = [
  "Île-de-France", "Auvergne-Rhône-Alpes", "Nouvelle-Aquitaine",
  "Occitanie", "Hauts-de-France", "Provence-Alpes-Côte d'Azur",
  "Grand Est", "Pays de la Loire", "Bretagne", "Normandie",
  "Bourgogne-Franche-Comté", "Centre-Val de Loire", "Corse",
  "Guadeloupe", "Martinique", "La Réunion", "Mayotte",
];

const TYPE_ICON: Record<string, string> = {
  "Université": "🎓",
  "Grande école": "🏛️",
  "École d'ingénieurs": "⚙️",
  "École de commerce et de gestion": "📈",
  "Institut d'études politiques": "🗳️",
  "École normale supérieure": "📚",
  "Institut universitaire de technologie": "🔬",
  "Lycée général et technologique": "🏫",
  "Lycée professionnel": "🔧",
  "CPGE": "📐",
  "STS": "📋",
};

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

function statutColor(statut: string | null) {
  if (statut === "privé" || statut?.includes("privé")) return "text-amber-400 border-amber-400/30 bg-amber-400/10";
  return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
}

// ── Page ─────────────────────────────────────────────────────────────────────

function EcolesPage() {
  const { q, type, region, statut, page } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [ecoles,  setEcoles]  = useState<Ecole[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Local form state (applied on submit/change)
  const [qVal,      setQVal]      = useState(q);
  const [typeVal,   setTypeVal]   = useState(type);
  const [regionVal, setRegionVal] = useState(region);
  const [statutVal, setStatutVal] = useState(statut);

  const offset = (page - 1) * PAGE_SIZE;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetch = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("ecoles")
      .select(
        "id, name, type, city, type_etablissement, statut, region, slug, nombre_etudiants, diplomes",
        { count: "exact" }
      )
      .order("nombre_etudiants", { ascending: false, nullsFirst: false })
      .order("name")
      .range(offset, offset + PAGE_SIZE - 1);

    if (q) query = query.ilike("name", `%${q}%`);
    if (type)   query = query.ilike("type_etablissement", `%${type}%`);
    if (region) query = query.eq("region", region);
    if (statut) query = query.eq("statut", statut);

    const { data, count, error } = await query;
    if (!error && data) {
      setEcoles(data as Ecole[]);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [q, type, region, statut, offset]);

  useEffect(() => { fetch(); }, [fetch]);

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

  const hasFilters = q || type || region || statut;

  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />

      <main className="mx-auto max-w-7xl px-5 py-10 pb-24">

        {/* ── Hero ──────────────────────────────────────────────────────────*/}
        <div className="mb-10">
          <div className="eyebrow mb-3">APIs officielles · Données Éducation Nationale</div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
            Annuaire des Écoles
          </h1>
          <p className="mt-4 text-mute text-lg max-w-xl">
            Universités, grandes écoles, lycées, IUT — toutes les formations de France.
          </p>
        </div>

        {/* ── Search + Filters ──────────────────────────────────────────────*/}
        <form onSubmit={applySearch} className="mb-8 space-y-4">
          <div className="flex gap-3">
            {/* Search input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-mute pointer-events-none" />
              <input
                value={qVal}
                onChange={(e) => setQVal(e.target.value)}
                placeholder="Rechercher un établissement…"
                className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm placeholder:text-mute/60 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((f) => !f)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all ${
                showFilters || hasFilters
                  ? "border-violet/50 bg-violet/10 text-violet-soft"
                  : "border-white/10 text-mute hover:border-white/25 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="size-4" />
              Filtres
              {hasFilters && <span className="size-2 rounded-full bg-violet" />}
            </button>
            <button
              type="submit"
              className="rounded-xl bg-violet/90 hover:bg-violet text-white px-5 py-3 text-sm font-semibold transition-all"
            >
              Chercher
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="grid sm:grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-mute mb-1.5">Type</label>
                <select
                  value={typeVal}
                  onChange={(e) => setTypeVal(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet/60 transition-colors"
                >
                  <option value="">Tous les types</option>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-mute mb-1.5">Région</label>
                <select
                  value={regionVal}
                  onChange={(e) => setRegionVal(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet/60 transition-colors"
                >
                  <option value="">Toutes les régions</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-mute mb-1.5">Statut</label>
                <select
                  value={statutVal}
                  onChange={(e) => setStatutVal(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet/60 transition-colors"
                >
                  <option value="">Public & privé</option>
                  <option value="public">Public</option>
                  <option value="privé">Privé</option>
                </select>
              </div>
            </div>
          )}
        </form>

        {/* ── Counter ───────────────────────────────────────────────────────*/}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="size-5 text-violet shrink-0" />
              <p className="text-sm">
                <span className="font-display font-bold text-white text-lg">{total.toLocaleString("fr-FR")}</span>
                <span className="text-mute ml-2">établissement{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}</span>
              </p>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="inline-flex items-center gap-1.5 text-xs text-mute hover:text-white transition-colors">
                <X className="size-3.5" /> Réinitialiser
              </button>
            )}
          </div>
        )}

        {/* ── Grid ──────────────────────────────────────────────────────────*/}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="size-7 text-mute animate-spin" />
          </div>
        ) : ecoles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <GraduationCap className="size-10 text-mute mb-4" />
            <h3 className="font-display text-xl font-bold mb-2">Aucun résultat</h3>
            <p className="text-mute text-sm max-w-xs mb-5">
              Essaie un autre nom ou élargis les filtres.
            </p>
            <button onClick={clearFilters}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm hover:bg-white/5 transition-all">
              <X className="size-4" /> Tout afficher
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ecoles.map((e) => <EcoleCard key={e.id} ecole={e} />)}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────────────*/}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => goPage(page - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-sm disabled:opacity-30 hover:border-white/25 hover:bg-white/5 transition-all"
            >
              <ChevronLeft className="size-4" /> Précédent
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p: number;
                if (totalPages <= 5) { p = i + 1; }
                else if (page <= 3) { p = i + 1; }
                else if (page >= totalPages - 2) { p = totalPages - 4 + i; }
                else { p = page - 2 + i; }
                return (
                  <button
                    key={p}
                    onClick={() => goPage(p)}
                    className={`size-9 rounded-xl text-sm font-medium transition-all ${
                      p === page
                        ? "bg-violet text-white"
                        : "border border-white/10 text-mute hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => goPage(page + 1)}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-sm disabled:opacity-30 hover:border-white/25 hover:bg-white/5 transition-all"
            >
              Suivant <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

function EcoleCard({ ecole }: { ecole: Ecole }) {
  const icon = TYPE_ICON[ecole.type_etablissement ?? ""] ?? "🏫";
  const label = typeLabel(ecole.type_etablissement ?? ecole.type);
  const href = ecole.slug ? `/ecoles/${ecole.slug}` : null;

  const card = (
    <article className="group relative flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 hover:border-white/20 hover:-translate-y-1 transition-all duration-200 h-full">
      {/* Logo or icon */}
      <div className="size-12 rounded-xl bg-white border border-white/10 flex items-center justify-center text-2xl mb-4 overflow-hidden shrink-0">
        {ecole.logo_url ? (
          <img
            src={ecole.logo_url}
            alt=""
            className="size-full object-contain p-1"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = "none";
              (el.parentElement as HTMLElement).innerHTML = `<span class="text-xl">${icon}</span>`;
            }}
          />
        ) : (
          <span className="text-xl">{icon}</span>
        )}
      </div>

      {/* Name */}
      <h2 className="font-display font-bold text-base leading-snug mb-1 group-hover:text-violet-soft transition-colors line-clamp-2">
        {ecole.name}
      </h2>

      {/* City + region */}
      <div className="flex items-center gap-1.5 text-xs text-mute mb-3">
        <MapPin className="size-3 shrink-0" />
        <span className="truncate">{ecole.city}{ecole.region ? ` · ${ecole.region}` : ""}</span>
      </div>

      <div className="flex flex-wrap gap-2 mt-auto">
        {/* Type pill */}
        <span className="inline-flex items-center gap-1 rounded-full border border-violet/25 bg-violet/10 px-2.5 py-0.5 text-[10px] font-mono text-violet-soft">
          <Building2 className="size-2.5" />
          {label}
        </span>

        {/* Statut */}
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono ${statutColor(ecole.statut)}`}>
          {ecole.statut === "privé" ? "Privé" : "Public"}
        </span>

        {/* Étudiants */}
        {ecole.nombre_etudiants && (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] font-mono text-mute">
            <Users className="size-2.5" />
            {ecole.nombre_etudiants.toLocaleString("fr-FR")}
          </span>
        )}
      </div>
    </article>
  );

  return href ? (
    <Link to={href as any} className="block">{card}</Link>
  ) : (
    <div>{card}</div>
  );
}
