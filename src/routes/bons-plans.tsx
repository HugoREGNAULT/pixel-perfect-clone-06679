// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { AppNav } from "@/components/AppNav";
import {
  X, Loader2, Copy, Check, ExternalLink, Search,
  Laptop, Play, Home, ShoppingBag, Train, Bike,
  Plane, Sun, CreditCard, Utensils, Heart, Landmark,
  Tag, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export const Route = createFileRoute("/bons-plans")({
  head: () => ({
    meta: [
      { title: "Bons Plans Étudiants — Springr" },
      { name: "description", content: "Les meilleures réductions, aides de l'État et offres gratuites pour les étudiants français. 58 bons plans sélectionnés." },
    ],
  }),
  component: BonsPlansPage,
});

/* ── Types ───────────────────────────────────────────────────────────────────*/

type BonPlan = Tables<"bons_plans">;
type BadgeCouleur = "lime" | "amber" | "violet" | "blue";

/* ── Config des catégories ───────────────────────────────────────────────────*/

const TABS = [
  { key: "Tout",      label: "Tout",         icon: Sparkles   },
  { key: "tech",      label: "Tech",          icon: Laptop     },
  { key: "streaming", label: "Streaming",     icon: Play       },
  { key: "logement",  label: "Logement",      icon: Home       },
  { key: "mode",      label: "Mode",          icon: ShoppingBag},
  { key: "transport", label: "Transport",     icon: Train      },
  { key: "velo",      label: "Vélo",          icon: Bike       },
  { key: "voyage",    label: "Voyage",        icon: Plane      },
  { key: "vacances",  label: "Vacances",      icon: Sun        },
  { key: "banque",    label: "Banque",        icon: CreditCard },
  { key: "food",      label: "Food",          icon: Utensils   },
  { key: "sante",     label: "Santé",         icon: Heart      },
  { key: "aides",     label: "Aides État",    icon: Landmark   },
] as const;

type TabKey = typeof TABS[number]["key"];

const CAT_LABEL: Record<string, string> = Object.fromEntries(TABS.map((t) => [t.key, t.label]));

/* ── Config couleurs badges ──────────────────────────────────────────────────*/

const BADGE_STYLE: Record<BadgeCouleur, { bg: string; text: string; border: string }> = {
  lime:   { bg: "bg-lime",        text: "text-ink",   border: "border-lime/30"        },
  amber:  { bg: "bg-amber-400",   text: "text-ink",   border: "border-amber-400/30"   },
  violet: { bg: "bg-violet",      text: "text-white",  border: "border-violet/30"      },
  blue:   { bg: "bg-blue-500",    text: "text-white",  border: "border-blue-500/30"    },
};

const CAT_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  tech:      { color: "text-violet-soft", bg: "bg-violet/10",    border: "border-violet/30"    },
  streaming: { color: "text-blue-400",    bg: "bg-blue-400/10",  border: "border-blue-400/30"  },
  logement:  { color: "text-cyan-400",    bg: "bg-cyan-400/10",  border: "border-cyan-400/30"  },
  mode:      { color: "text-pink-400",    bg: "bg-pink-400/10",  border: "border-pink-400/30"  },
  transport: { color: "text-amber-400",   bg: "bg-amber-400/10", border: "border-amber-400/30" },
  velo:      { color: "text-lime",        bg: "bg-lime/10",      border: "border-lime/30"      },
  voyage:    { color: "text-sky-400",     bg: "bg-sky-400/10",   border: "border-sky-400/30"   },
  vacances:  { color: "text-orange-400",  bg: "bg-orange-400/10",border: "border-orange-400/30"},
  banque:    { color: "text-emerald-400", bg: "bg-emerald-400/10",border:"border-emerald-400/30"},
  food:      { color: "text-red-400",     bg: "bg-red-400/10",   border: "border-red-400/30"   },
  sante:     { color: "text-rose-400",    bg: "bg-rose-400/10",  border: "border-rose-400/30"  },
  aides:     { color: "text-blue-400",    bg: "bg-blue-400/10",  border: "border-blue-400/30"  },
};

/* ── Page ────────────────────────────────────────────────────────────────────*/

function BonsPlansPage() {
  const [deals, setDeals]       = useState<BonPlan[]>([]);
  const [loading, setLoading]   = useState(true);
  const [active, setActive]     = useState<TabKey>("Tout");
  const [search, setSearch]     = useState("");
  const tabsRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("bons_plans")
      .select("*")
      .eq("actif", true)
      .order("categorie")
      .order("ordre_affichage")
      .then(({ data, error }) => {
        if (!error && data) setDeals(data as BonPlan[]);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return deals.filter((d) => {
      if (active !== "Tout" && d.categorie !== active) return false;
      if (q && !d.titre.toLowerCase().includes(q) && !d.description.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [deals, active, search]);

  function selectTab(key: TabKey) {
    setActive(key);
    setSearch("");
  }

  const showAidesWarning = active === "aides" || (active === "Tout" && filtered.some((d) => d.categorie === "aides"));

  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />

      <main className="mx-auto max-w-6xl px-5 py-10 pb-24">

        {/* ── Hero ──────────────────────────────────────────────────────────*/}
        <div className="mb-8">
          <div className="eyebrow mb-3">Sélectionnés pour les étudiants · Mis à jour régulièrement</div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
            Bons Plans
          </h1>
          <p className="mt-4 text-mute text-lg max-w-xl">
            Réductions, outils gratuits, aides de l'État — tout ce qui te fait économiser vraiment.
          </p>
        </div>

        {/* ── Compteur ──────────────────────────────────────────────────────*/}
        {!loading && (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 mb-8">
            <Tag className="size-5 text-lime shrink-0" />
            <p className="text-sm">
              <span className="font-display font-bold text-white text-lg">{deals.length}</span>
              <span className="text-mute ml-2">bons plans disponibles</span>
              {active !== "Tout" && (
                <> · <span className="text-lime font-semibold">{filtered.length}</span>
                <span className="text-mute"> dans <span className="text-white">{CAT_LABEL[active]}</span></span></>
              )}
            </p>
          </div>
        )}

        {/* ── Filtres sticky ────────────────────────────────────────────────*/}
        <div className="sticky top-14 z-30 -mx-5 px-5 py-3 bg-ink/90 backdrop-blur-xl border-b border-white/5 mb-8 space-y-3">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-mute pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un bon plan…"
              className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-9 py-2.5 text-sm placeholder:text-mute/60 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-white">
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Category tabs — horizontal scroll */}
          <div ref={tabsRef} className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => selectTab(key as TabKey)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border whitespace-nowrap transition-all shrink-0 ${
                  active === key
                    ? "bg-white text-ink border-white"
                    : "border-white/15 text-mute hover:border-white/30 hover:text-white"
                }`}
              >
                <Icon className="size-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Bannière Aides État ────────────────────────────────────────────*/}
        {showAidesWarning && !search && (
          <div className="flex items-start gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 px-5 py-4 mb-6">
            <Landmark className="size-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white mb-0.5">
                💰 Ces aides sont des droits — vérifie ce à quoi tu as droit !
              </p>
              <p className="text-xs text-mute leading-relaxed">
                Bourse, APL, Pass Culture, prime d'activité... Millions d'étudiants ne réclament pas les aides auxquelles ils ont droit. Simule ta situation sur les sites officiels.
              </p>
            </div>
          </div>
        )}

        {/* ── Résultats ─────────────────────────────────────────────────────*/}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="size-7 text-mute animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Tag className="size-10 text-mute mb-4" />
            <h3 className="font-display text-xl font-bold mb-2">Aucun résultat</h3>
            <p className="text-mute text-sm max-w-xs mb-5">Essaie un autre mot-clé ou change de catégorie.</p>
            <button
              onClick={() => { setSearch(""); setActive("Tout"); }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm hover:bg-white/5 transition-all"
            >
              <X className="size-4" /> Réinitialiser
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((deal) => <DealCard key={deal.id} deal={deal} />)}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Carte bon plan ──────────────────────────────────────────────────────────*/

function DealCard({ deal }: { deal: BonPlan }) {
  const [copied, setCopied] = useState(false);
  const couleur   = (deal.badge_couleur as BadgeCouleur) in BADGE_STYLE ? deal.badge_couleur as BadgeCouleur : "amber";
  const badgeStyle = BADGE_STYLE[couleur];
  const catStyle   = CAT_STYLE[deal.categorie] ?? CAT_STYLE["tech"];
  const Tab        = TABS.find((t) => t.key === deal.categorie);
  const Icon       = Tab?.icon ?? Tag;
  const isAide     = deal.categorie === "aides";

  async function copyPromo() {
    if (!deal.code_promo) return;
    try {
      await navigator.clipboard.writeText(deal.code_promo);
      setCopied(true);
      toast.success(`Code "${deal.code_promo}" copié !`);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Impossible de copier le code.");
    }
  }

  return (
    <article className={`group relative flex flex-col rounded-2xl border bg-gradient-to-b from-white/[0.04] to-transparent p-5 hover:-translate-y-1 transition-all duration-200 ${
      isAide ? "border-blue-500/20 hover:border-blue-500/40" : "border-white/10 hover:border-white/20"
    }`}>
      {/* Badge valeur (top-right) */}
      {deal.badge_texte && (
        <div className="absolute top-4 right-4">
          <span className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2.5 py-1 ${badgeStyle.bg} ${badgeStyle.text}`}>
            {deal.badge_texte}
          </span>
        </div>
      )}

      {/* Catégorie pill */}
      <div className={`inline-flex items-center gap-1.5 self-start rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider mb-4 ${catStyle.bg} ${catStyle.border} ${catStyle.color}`}>
        <Icon className="size-3" />
        {CAT_LABEL[deal.categorie] ?? deal.categorie}
      </div>

      {/* Titre */}
      <h2 className="font-display font-bold text-base leading-snug mb-2 group-hover:text-lime transition-colors pr-20">
        {deal.titre}
      </h2>

      {/* Description */}
      <p className="text-sm text-mute leading-relaxed flex-1 mb-4">
        {deal.description}
      </p>

      {/* Code promo */}
      {deal.code_promo && (
        <div className="flex items-center gap-2 rounded-xl border border-violet/30 bg-violet/5 px-3 py-2.5 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-widest text-mute mb-0.5">Code promo</p>
            <p className="font-mono font-bold text-sm text-violet-soft tracking-wider truncate">
              {deal.code_promo}
            </p>
          </div>
          <button
            onClick={copyPromo}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              copied
                ? "bg-lime/20 text-lime border border-lime/30"
                : "bg-violet/20 text-violet-soft border border-violet/30 hover:bg-violet/30"
            }`}
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      )}

      {/* CTA */}
      {deal.lien_url ? (
        <a
          href={deal.lien_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-auto inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-all ${
            isAide
              ? "border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50"
              : couleur === "lime"
              ? "bg-lime text-ink hover:-translate-y-0.5 hover:shadow-[0_0_20px_-4px_rgba(181,255,61,0.4)]"
              : "border border-white/15 text-white hover:bg-white/5 hover:border-white/30"
          }`}
        >
          {isAide ? "Vérifier mon éligibilité" : "Voir l'offre"}
          <ExternalLink className="size-3.5" />
        </a>
      ) : (
        <span className="mt-auto inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm text-mute border border-white/10">
          Bientôt disponible
        </span>
      )}
    </article>
  );
}
