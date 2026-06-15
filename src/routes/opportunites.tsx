import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  MapPin,
  Calendar,
  Search,
  X,
  ArrowUpRight,
  Briefcase,
  Check,
  SlidersHorizontal,
} from "lucide-react";

export const Route = createFileRoute("/opportunites")({
  head: () => ({
    meta: [
      { title: "Opportunités — Springr" },
      { name: "description", content: "Stages, alternances et premiers emplois matchés pour les étudiants." },
    ],
  }),
  component: OpportunitesPage,
});

/* ------------------------------------------------------------------- types */

type ContractType = "stage" | "alternance" | "job";

interface Offer {
  id: string;
  title: string;
  company: string;
  city: string;
  remote: boolean;
  type: ContractType;
  sector: string;
  postedAt: string;
  tags: string[];
  applyUrl?: string;
}

/* -------------------------------------------------------------------- data */

const OFFERS: Offer[] = [
  { id: "1",  title: "UX Designer",               company: "Notion",          city: "Paris",     remote: true,  type: "stage",       sector: "Tech",       postedAt: "2026-06-13", tags: ["Figma", "User research"] },
  { id: "2",  title: "Développeur·se React",       company: "Alan",            city: "Paris",     remote: true,  type: "alternance",  sector: "Tech",       postedAt: "2026-06-12", tags: ["React", "TypeScript"] },
  { id: "3",  title: "Chef de projet Marketing",   company: "Doctolib",        city: "Paris",     remote: false, type: "stage",       sector: "Marketing",  postedAt: "2026-06-10", tags: ["SEO", "Analytics"] },
  { id: "4",  title: "Data Analyst",               company: "BlaBlaCar",       city: "Paris",     remote: true,  type: "stage",       sector: "Tech",       postedAt: "2026-06-08", tags: ["SQL", "Python"] },
  { id: "5",  title: "Chargé·e de Communication",  company: "Mano Mano",       city: "Bordeaux",  remote: false, type: "alternance",  sector: "Marketing",  postedAt: "2026-06-11", tags: ["Réseaux sociaux", "Canva"] },
  { id: "6",  title: "Business Developer",         company: "Pennylane",       city: "Lyon",      remote: false, type: "job",         sector: "Finance",    postedAt: "2026-06-09", tags: ["B2B", "SaaS"] },
  { id: "7",  title: "Product Manager Junior",     company: "Swile",           city: "Paris",     remote: true,  type: "job",         sector: "Tech",       postedAt: "2026-06-07", tags: ["Agile", "Roadmap"] },
  { id: "8",  title: "Graphiste Motion Design",    company: "Brut.",           city: "Paris",     remote: false, type: "stage",       sector: "Médias",     postedAt: "2026-06-14", tags: ["After Effects", "Premiere"] },
  { id: "9",  title: "Développeur·se Full Stack",  company: "Qonto",           city: "Paris",     remote: true,  type: "alternance",  sector: "Tech",       postedAt: "2026-06-06", tags: ["Ruby", "Vue.js"] },
  { id: "10", title: "Analyste Financier·ère",     company: "BNP Paribas",     city: "Paris",     remote: false, type: "stage",       sector: "Finance",    postedAt: "2026-06-05", tags: ["Excel", "Modélisation"] },
  { id: "11", title: "Consultant·e Junior",        company: "McKinsey",        city: "Paris",     remote: false, type: "job",         sector: "Conseil",    postedAt: "2026-06-04", tags: ["Stratégie", "PowerPoint"] },
  { id: "12", title: "Brand Content Manager",      company: "LVMH",            city: "Paris",     remote: false, type: "alternance",  sector: "Marketing",  postedAt: "2026-06-03", tags: ["Rédaction", "Luxe"] },
  { id: "13", title: "Ingénieur·e DevOps",         company: "OVHcloud",        city: "Lille",     remote: true,  type: "job",         sector: "Tech",       postedAt: "2026-06-02", tags: ["Kubernetes", "CI/CD"] },
  { id: "14", title: "Chargé·e RH",               company: "Decathlon",       city: "Lille",     remote: false, type: "alternance",  sector: "RH",         postedAt: "2026-06-01", tags: ["Recrutement", "SIRH"] },
  { id: "15", title: "Designer Produit",           company: "Contentsquare",   city: "Lyon",      remote: true,  type: "stage",       sector: "Tech",       postedAt: "2026-05-30", tags: ["Figma", "Prototypage"] },
  { id: "16", title: "Développeur·se Mobile",      company: "Lydia",           city: "Paris",     remote: true,  type: "alternance",  sector: "Tech",       postedAt: "2026-05-29", tags: ["Flutter", "Kotlin"] },
  { id: "17", title: "Growth Hacker",              company: "Payfit",          city: "Bordeaux",  remote: true,  type: "stage",       sector: "Marketing",  postedAt: "2026-05-28", tags: ["A/B testing", "CRM"] },
  { id: "18", title: "Ingénieur·e Data Science",   company: "Enedis",          city: "Lyon",      remote: false, type: "job",         sector: "Énergie",    postedAt: "2026-05-27", tags: ["Python", "Machine Learning"] },
  { id: "19", title: "Responsable E-commerce",     company: "Cdiscount",       city: "Bordeaux",  remote: false, type: "job",         sector: "E-commerce", postedAt: "2026-05-26", tags: ["Shopify", "Analytics"] },
  { id: "20", title: "Coordinateur·rice Projets",  company: "Médecins Sans Frontières", city: "Paris", remote: false, type: "stage", sector: "Éducation", postedAt: "2026-06-15", tags: ["Gestion de projet", "ONG"] },
  { id: "21", title: "Ingénieur·e Logiciel",       company: "Withings",        city: "Nantes",    remote: true,  type: "job",         sector: "Tech",       postedAt: "2026-06-14", tags: ["C++", "Embedded"] },
  { id: "22", title: "Chargé·e SEO & Content",     company: "Leboncoin",       city: "Paris",     remote: true,  type: "alternance",  sector: "Marketing",  postedAt: "2026-06-13", tags: ["SEO", "WordPress"] },
  { id: "23", title: "Avocat·e Junior",            company: "Peugeot",         city: "Paris",     remote: false, type: "stage",       sector: "Conseil",    postedAt: "2026-06-11", tags: ["Droit des affaires"] },
  { id: "24", title: "UI Designer",                company: "Deezer",          city: "Paris",     remote: true,  type: "stage",       sector: "Médias",     postedAt: "2026-06-10", tags: ["Figma", "Design System"] },
];

const SECTORS = [...new Set(OFFERS.map((o) => o.sector))].sort();
const CITIES  = [...new Set(OFFERS.map((o) => o.city))].sort();

const TYPE_LABELS: Record<ContractType | "tous", string> = {
  tous: "Tous",
  stage: "Stage",
  alternance: "Alternance",
  job: "Premier job",
};

const TYPE_COLORS: Record<ContractType, string> = {
  stage:       "border-violet/40 bg-violet/15 text-violet-soft",
  alternance:  "border-lime/40  bg-lime/10   text-lime",
  job:         "border-amber-400/40 bg-amber-400/10 text-amber-300",
};

const COMPANY_COLORS = [
  "from-violet/60 to-violet/30",
  "from-lime/50 to-lime/20",
  "from-blue-500/60 to-blue-500/20",
  "from-emerald-500/50 to-emerald-500/20",
  "from-pink-500/50 to-pink-500/20",
  "from-orange-500/50 to-orange-500/20",
  "from-cyan-500/50 to-cyan-500/20",
];

function companyGradient(name: string) {
  return COMPANY_COLORS[name.charCodeAt(0) % COMPANY_COLORS.length];
}

function daysAgo(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(date));
}

/* -------------------------------------------------------------------- page */

function OpportunitesPage() {
  const [search, setSearch]       = useState("");
  const [typeFilter, setType]     = useState<ContractType | "tous">("tous");
  const [secteurFilter, setSect]  = useState("");
  const [villeFilter, setVille]   = useState("");
  const [applied, setApplied]     = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return OFFERS.filter((o) => {
      if (typeFilter !== "tous" && o.type !== typeFilter) return false;
      if (secteurFilter && o.sector !== secteurFilter) return false;
      if (villeFilter && o.city !== villeFilter) return false;
      if (q && !o.title.toLowerCase().includes(q) && !o.company.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, typeFilter, secteurFilter, villeFilter]);

  const hasFilters = typeFilter !== "tous" || secteurFilter || villeFilter || search;

  function resetFilters() {
    setSearch("");
    setType("tous");
    setSect("");
    setVille("");
  }

  function handleApply(offer: Offer) {
    if (applied.has(offer.id)) return;
    setApplied((prev) => new Set([...prev, offer.id]));
    toast.success(`Candidature envoyée pour "${offer.title}" chez ${offer.company} !`);
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      {/* ---- nav ---- */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-ink/80 border-b border-white/5">
        <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="font-display font-bold tracking-tight text-lg shrink-0">
            sprin<span className="text-violet">g</span><span className="text-lime">r.</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-mute">
            <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
            <Link to="/opportunites" className="text-white font-medium">Opportunités</Link>
            <Link to="/mentors" className="hover:text-white transition-colors">Mentors</Link>
            <Link to="/profil" className="hover:text-white transition-colors">Mon profil</Link>
          </nav>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 rounded-full bg-lime px-4 py-1.5 text-sm font-semibold text-ink hover:-translate-y-0.5 transition-transform shrink-0"
          >
            S'inscrire <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 pb-24">
        {/* ---- hero ---- */}
        <div className="mb-10">
          <div className="eyebrow mb-3">Matchées pour toi</div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
            Opportunités
          </h1>
          <p className="mt-4 text-mute text-lg max-w-xl">
            Stages, alternances et premiers emplois sélectionnés pour la génération Springr.
          </p>
        </div>

        {/* ---- filters ---- */}
        <div className="sticky top-14 z-30 -mx-5 px-5 py-4 bg-ink/90 backdrop-blur-xl border-b border-white/5 mb-8 space-y-3">
          {/* search + reset */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-mute pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Poste ou entreprise…"
                className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm placeholder:text-mute/60 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-white">
                  <X className="size-4" />
                </button>
              )}
            </div>
            {hasFilters && (
              <button onClick={resetFilters} className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-white transition-colors whitespace-nowrap">
                <X className="size-3.5" /> Réinitialiser
              </button>
            )}
          </div>

          {/* type pills + selects */}
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="size-4 text-mute shrink-0" />
            {(["tous", "stage", "alternance", "job"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                  typeFilter === t
                    ? "bg-white text-ink border-white"
                    : "border-white/15 text-mute hover:border-white/30 hover:text-white"
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}

            <div className="w-px h-4 bg-white/10 mx-1" />

            <select
              value={secteurFilter}
              onChange={(e) => setSect(e.target.value)}
              className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-mute focus:outline-none focus:border-violet/60 focus:text-white transition-colors cursor-pointer"
            >
              <option value="">Tous les secteurs</option>
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={villeFilter}
              onChange={(e) => setVille(e.target.value)}
              className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-mute focus:outline-none focus:border-violet/60 focus:text-white transition-colors cursor-pointer"
            >
              <option value="">Toutes les villes</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* ---- result count ---- */}
        <div className="flex items-center gap-3 mb-6">
          <span className="font-display font-bold text-2xl">{filtered.length}</span>
          <span className="text-mute text-sm">offre{filtered.length !== 1 ? "s" : ""} trouvée{filtered.length !== 1 ? "s" : ""}</span>
          {hasFilters && (
            <span className="text-xs font-mono text-lime bg-lime/10 border border-lime/20 rounded-full px-2 py-0.5">Filtres actifs</span>
          )}
        </div>

        {/* ---- grid ---- */}
        {filtered.length === 0 ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered
              .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
              .map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  applied={applied.has(offer.id)}
                  onApply={() => handleApply(offer)}
                />
              ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* --------------------------------------------------------------- offer card */

function OfferCard({
  offer,
  applied,
  onApply,
}: {
  offer: Offer;
  applied: boolean;
  onApply: () => void;
}) {
  const age = daysAgo(offer.postedAt);
  const isNew = age <= 3;

  return (
    <article className="group relative flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 hover:border-violet/40 hover:-translate-y-1 transition-all duration-200">
      {/* top row: logo + badges */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className={`size-10 rounded-xl bg-gradient-to-br ${companyGradient(offer.company)} flex items-center justify-center font-display font-bold text-base text-white shrink-0`}>
          {offer.company[0]}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {isNew && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-lime bg-lime/10 border border-lime/25 rounded-full px-2 py-0.5">
              Nouveau
            </span>
          )}
          <span className={`text-[10px] font-mono uppercase tracking-wider border rounded-full px-2 py-0.5 ${TYPE_COLORS[offer.type]}`}>
            {TYPE_LABELS[offer.type]}
          </span>
        </div>
      </div>

      {/* title + company */}
      <div className="flex-1 mb-4">
        <h2 className="font-display font-bold text-base leading-snug group-hover:text-lime transition-colors">
          {offer.title}
        </h2>
        <p className="mt-0.5 text-sm text-mute">{offer.company}</p>
      </div>

      {/* tags */}
      {offer.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {offer.tags.map((tag) => (
            <span key={tag} className="text-[10px] font-mono bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-mute">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* meta: city + date */}
      <div className="flex items-center gap-4 text-xs text-mute mb-5">
        <span className="flex items-center gap-1">
          <MapPin className="size-3" />
          {offer.city}{offer.remote && " · Remote"}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="size-3" />
          {age === 0 ? "Aujourd'hui" : age === 1 ? "Hier" : `${formatDate(offer.postedAt)}`}
        </span>
      </div>

      {/* apply button */}
      <button
        onClick={onApply}
        disabled={applied}
        className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-all ${
          applied
            ? "bg-lime/15 border border-lime/30 text-lime cursor-default"
            : "bg-lime text-ink hover:-translate-y-0.5 hover:shadow-[0_0_20px_-4px_rgba(181,255,61,0.5)]"
        }`}
      >
        {applied ? (
          <><Check className="size-4" /> Candidature envoyée</>
        ) : (
          <>Postuler <ArrowUpRight className="size-4" /></>
        )}
      </button>
    </article>
  );
}

/* ------------------------------------------------------------ empty state */

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
        <Briefcase className="size-7 text-mute" />
      </div>
      <h3 className="font-display text-xl font-bold mb-2">Aucun résultat</h3>
      <p className="text-mute text-sm max-w-xs mb-6">
        Aucune offre ne correspond à ces critères. Essaie d'élargir ta recherche.
      </p>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm hover:bg-white/5 transition-all"
      >
        <X className="size-4" /> Réinitialiser les filtres
      </button>
    </div>
  );
}
