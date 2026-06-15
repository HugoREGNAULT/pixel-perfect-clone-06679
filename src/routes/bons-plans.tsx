import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppNav } from "@/components/AppNav";
import { ExternalLink, Home, Tag, Percent, UtensilsCrossed, X, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/bons-plans")({
  head: () => ({ meta: [{ title: "Bons Plans — Springr" }] }),
  component: BonsPlansPage,
});

/* ------------------------------------------------------------------- types */

type Category = "Logement" | "Réductions" | "Codes promo" | "Restos";

interface Deal {
  id: string;
  title: string;
  description: string;
  category: Category;
  badge?: string;
  url: string;
  highlight?: boolean;
}

/* -------------------------------------------------------------------- data */

const DEALS: Deal[] = [
  /* Logement */
  { id: "l1", category: "Logement",    title: "CROUS — Résidences universitaires",   description: "Logements étudiants subventionnés à partir de 150€/mois. Dossier via Mon Dossier CROUS.", badge: "À partir de 150€/mois", url: "#", highlight: true },
  { id: "l2", category: "Logement",    title: "Garantme — Garant en ligne",          description: "Obtiens un garant certifié instantanément, sans CDI ni parent co-signataire.", badge: "Gratuit à l'inscription", url: "#" },
  { id: "l3", category: "Logement",    title: "Action Logement — LOCA-PASS",         description: "Avance gratuite du dépôt de garantie et garantie loyer impayé pour les alternants.", badge: "0€ d'intérêt", url: "#" },
  { id: "l4", category: "Logement",    title: "Studapart — Logements vérifiés",      description: "Plateforme de colocations et studios entre étudiants, avec contrats sécurisés.", badge: "Sans frais d'agence", url: "#" },
  { id: "l5", category: "Logement",    title: "Visale — Caution CAF",               description: "Caution locative gratuite accordée par Action Logement pour les moins de 30 ans.", badge: "Gratuit", url: "#" },

  /* Réductions */
  { id: "r1", category: "Réductions",  title: "Carte ISIC — Réductions mondiales",  description: "La carte étudiante internationale valable dans 130 pays pour des milliers de réductions.", badge: "-10% à -50%", url: "#", highlight: true },
  { id: "r2", category: "Réductions",  title: "UNiDAYS — Mode & Tech",             description: "Réductions exclusives chez Nike, Apple, Samsung, ASOS et 800+ marques partenaires.", badge: "Gratuit", url: "#" },
  { id: "r3", category: "Réductions",  title: "Spotify Premium Étudiant",           description: "Spotify + Hulu à moitié prix. Éligible avec ton adresse email universitaire.", badge: "5,99€/mois", url: "#" },
  { id: "r4", category: "Réductions",  title: "Apple Education",                    description: "MacBook, iPad et AirPods à prix réduit avec justificatif étudiant sur l'Apple Store.", badge: "Jusqu'à -200€", url: "#" },
  { id: "r5", category: "Réductions",  title: "SNCF Carte Avantage Jeune",         description: "Voyages en TGV et Intercités réduits jusqu'à 60% pour les 12-27 ans.", badge: "49€/an", url: "#" },
  { id: "r6", category: "Réductions",  title: "Carte Musées Nationaux",            description: "Accès gratuit aux collections permanentes pour tous les moins de 26 ans ressortissants UE.", badge: "Gratuit -26 ans UE", url: "#" },

  /* Codes promo */
  { id: "c1", category: "Codes promo", title: "GitHub Student Developer Pack",      description: "Accès gratuit à 100+ outils dev : GitHub Pro, Copilot, AWS, Figma, Notion et plus.", badge: "100% gratuit", url: "#", highlight: true },
  { id: "c2", category: "Codes promo", title: "Notion — Plan Plus gratuit 1 an",   description: "Notion Plan Plus offert 1 an pour les étudiants avec email universitaire vérifié.", badge: "0€ pendant 1 an", url: "#" },
  { id: "c3", category: "Codes promo", title: "Adobe Creative Cloud Étudiant",     description: "Accès à toutes les apps Adobe (Photoshop, Premiere, Illustrator…) à prix étudiant.", badge: "-65% vs tarif normal", url: "#" },
  { id: "c4", category: "Codes promo", title: "Canva Pro — Gratuit",               description: "Canva Pro offert à vie avec email étudiant. Templates, backgrounds et assets premium.", badge: "Gratuit", url: "#" },
  { id: "c5", category: "Codes promo", title: "Microsoft 365 Éducation",           description: "Word, Excel, PowerPoint, Teams et 1 To OneDrive gratuits avec email académique.", badge: "Gratuit", url: "#" },

  /* Restos */
  { id: "f1", category: "Restos",      title: "Restaurants Universitaires CROUS",  description: "Repas complet à 1€ pour les boursiers, 3,30€ pour tous les étudiants. 800 restos en France.", badge: "Dès 1€/repas", url: "#", highlight: true },
  { id: "f2", category: "Restos",      title: "Too Good To Go — Anti-gaspi",       description: "Récupère des paniers-surprises de restaurants et boulangeries à partir de 2,99€.", badge: "À partir de 2,99€", url: "#" },
  { id: "f3", category: "Restos",      title: "Deliveroo — 50% le premier mois",  description: "Deliveroo Plus offert 1 mois à l'inscription : livraison gratuite sur toutes tes commandes.", badge: "Livraison offerte", url: "#" },
  { id: "f4", category: "Restos",      title: "Lunchr / Swile — Titre-restaurant", description: "Si ton employeur le propose, le titre-restaurant couvre 50-60% de tes repas du midi.", badge: "Jusqu'à 13,09€/jour", url: "#" },
  { id: "f5", category: "Restos",      title: "Youzful — Resto à -50%",           description: "Plateforme qui négocie des deals restos pour les étudiants : midi à moitié prix.", badge: "-50% le midi", url: "#" },
];

const CATEGORIES: ("Tous" | Category)[] = ["Tous", "Logement", "Réductions", "Codes promo", "Restos"];

const CAT_CONFIG: Record<Category, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }> = {
  "Logement":    { icon: Home,             color: "text-cyan-400",   bg: "bg-cyan-400/10",   border: "border-cyan-400/30"  },
  "Réductions":  { icon: Percent,          color: "text-violet-soft",bg: "bg-violet/10",     border: "border-violet/30"    },
  "Codes promo": { icon: Tag,              color: "text-lime",       bg: "bg-lime/10",       border: "border-lime/30"      },
  "Restos":      { icon: UtensilsCrossed,  color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/30" },
};

/* -------------------------------------------------------------------- page */

function BonsPlansPage() {
  const [active, setActive] = useState<"Tous" | Category>("Tous");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return DEALS.filter((d) => {
      if (active !== "Tous" && d.category !== active) return false;
      if (q && !d.title.toLowerCase().includes(q) && !d.description.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [active, search]);

  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />

      <main className="mx-auto max-w-6xl px-5 py-10 pb-24">
        {/* hero */}
        <div className="mb-10">
          <div className="eyebrow mb-3">Sélectionnés pour les étudiants</div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
            Bons Plans
          </h1>
          <p className="mt-4 text-mute text-lg max-w-xl">
            Logement, réductions, outils gratuits et restos — tout ce qui te fait économiser vraiment.
          </p>
        </div>

        {/* filters */}
        <div className="sticky top-14 z-30 -mx-5 px-5 py-4 bg-ink/90 backdrop-blur-xl border-b border-white/5 mb-8 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un bon plan…"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm placeholder:text-mute/60 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-white">
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="size-4 text-mute shrink-0" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                  active === cat
                    ? "bg-white text-ink border-white"
                    : "border-white/15 text-mute hover:border-white/30 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* count */}
        <div className="flex items-center gap-3 mb-6">
          <span className="font-display font-bold text-2xl">{filtered.length}</span>
          <span className="text-mute text-sm">bon{filtered.length !== 1 ? "s" : ""} plan{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Tag className="size-10 text-mute mb-4" />
            <p className="text-mute">Aucun résultat. <button onClick={() => { setSearch(""); setActive("Tous"); }} className="text-lime underline">Réinitialiser</button></p>
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

/* -------------------------------------------------------------- deal card */

function DealCard({ deal }: { deal: Deal }) {
  const cfg = CAT_CONFIG[deal.category];
  const Icon = cfg.icon;

  return (
    <article className={`group relative flex flex-col rounded-2xl border bg-gradient-to-b from-white/[0.04] to-transparent p-5 hover:-translate-y-1 transition-all duration-200 ${
      deal.highlight ? "border-violet/30 hover:border-violet/50" : "border-white/10 hover:border-white/20"
    }`}>
      {deal.highlight && (
        <div className="absolute top-4 right-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-lime bg-lime/10 border border-lime/25 rounded-full px-2 py-0.5">
            Top
          </span>
        </div>
      )}

      {/* category badge */}
      <div className={`inline-flex items-center gap-1.5 self-start rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider mb-4 ${cfg.bg} ${cfg.border} ${cfg.color}`}>
        <Icon className="size-3" />
        {deal.category}
      </div>

      {/* content */}
      <h2 className="font-display font-bold text-base leading-snug mb-2 group-hover:text-lime transition-colors pr-8">
        {deal.title}
      </h2>
      <p className="text-sm text-mute leading-relaxed flex-1 mb-4">
        {deal.description}
      </p>

      {/* badge + link */}
      <div className="flex items-center justify-between gap-3 mt-auto">
        {deal.badge && (
          <span className={`text-xs font-semibold ${cfg.color}`}>{deal.badge}</span>
        )}
        <a
          href={deal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-mute hover:text-white transition-colors ml-auto"
        >
          Voir le bon plan <ExternalLink className="size-3" />
        </a>
      </div>
    </article>
  );
}
