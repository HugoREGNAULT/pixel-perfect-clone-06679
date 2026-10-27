// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { AppNav } from "@/components/AppNav";
import {
  X, WifiOff, RefreshCw, Copy, Check, ExternalLink, Search,
  Laptop, Play, Home, ShoppingBag, Train, Bike,
  Plane, Sun, CreditCard, Utensils, Heart, Landmark,
  Tag, Sparkles,
} from "lucide-react";
import { PageShell } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export const Route = createFileRoute("/bons-plans")({
  head: () => ({
    meta: [
      { title: "Bons Plans Étudiants — Springr" },
      { name: "description", content: "Les meilleures réductions, aides de l'État et offres gratuites pour les étudiants français." },
    ],
  }),
  component: BonsPlansPage,
});

/* ── Types ───────────────────────────────────────────────────────────────────*/

type BonPlan = Tables<"bons_plans">;

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

const BADGE_VARIANT: Record<string, "highlight" | "warning" | "default" | "success"> = {
  lime: "success",
  amber: "warning",
  violet: "default",
  blue: "default",
};

/* ── Page ────────────────────────────────────────────────────────────────────*/

function BonsPlansPage() {
  const [deals, setDeals]       = useState<BonPlan[]>([]);
  const [loading, setLoading]   = useState(true);
  const [failed, setFailed]     = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [active, setActive]     = useState<TabKey>("Tout");
  const [search, setSearch]     = useState("");

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    supabase
      .from("bons_plans")
      .select("*")
      .eq("actif", true)
      .order("categorie")
      .order("ordre_affichage")
      .then(({ data, error }) => {
        if (error) setFailed(true);
        else setDeals((data ?? []) as BonPlan[]);
        setLoading(false);
      })
      .catch(() => { setFailed(true); setLoading(false); });
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return deals.filter((d) => {
      if (active !== "Tout" && d.categorie !== active) return false;
      if (q && !d.titre.toLowerCase().includes(q) && !d.description.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [deals, active, search]);

  const showAidesWarning = active === "aides" || (active === "Tout" && filtered.some((d) => d.categorie === "aides"));

  return (
    <>
      <AppNav />
      <PageShell className="pb-20">
        <SectionHeader
          as="h1"
          eyebrow="Pour les étudiants"
          title="Bons plans"
          description="Réductions, outils gratuits et aides de l'État. Vérifie toujours les conditions sur le site de l'offre avant d'en profiter."
        />

        <div className="mt-8 space-y-4">
          <div className="relative max-w-md">
            <label htmlFor="bp-search" className="sr-only">Rechercher un bon plan</label>
            <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="bp-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un bon plan" className="pl-10" />
          </div>

          <div role="group" aria-label="Catégorie" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} type="button" aria-pressed={active === key}
                onClick={() => setActive(key as TabKey)}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  active === key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-card text-foreground hover:bg-muted",
                )}>
                <Icon aria-hidden className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {showAidesWarning && !search && (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-primary-soft p-4 text-primary-soft-foreground">
            <Landmark aria-hidden className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Les aides sont des droits : vérifie celles auxquelles tu peux prétendre.</p>
              <p className="mt-0.5 text-sm">
                Bourse, APL, Pass Culture, prime d'activité... Simule ta situation sur les sites officiels.
              </p>
            </div>
          </div>
        )}

        <div className="mt-8" aria-live="polite">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
              {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-56 rounded-lg" />)}
            </div>
          ) : failed ? (
            <EmptyState
              icon={<WifiOff />}
              title="Les bons plans sont indisponibles pour le moment"
              description="Nous n'arrivons pas à charger la liste. Ça ne vient pas de ta recherche : réessaie dans quelques instants."
              action={<Button onClick={() => setReloadKey((k) => k + 1)}><RefreshCw /> Réessayer</Button>}
            />
          ) : deals.length === 0 ? (
            <EmptyState icon={<Tag />} title="Pas encore de bons plans" description="Aucun bon plan n'est publié pour l'instant. Reviens bientôt." />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Tag />}
              title="Aucun bon plan ne correspond"
              description="Essaie un autre mot-clé ou une autre catégorie."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  {search && <Button variant="secondary" onClick={() => setSearch("")}>Retirer le mot-clé</Button>}
                  {active !== "Tout" && <Button variant="secondary" onClick={() => setActive("Tout")}>Voir toutes les catégories</Button>}
                </div>
              }
            />
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                <strong className="font-display text-lg text-foreground">{filtered.length}</strong>{" "}
                bon{filtered.length > 1 ? "s" : ""} plan{filtered.length > 1 ? "s" : ""}
                {active !== "Tout" ? ` dans « ${CAT_LABEL[active]} »` : ""}
              </p>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((deal) => <li key={deal.id} className="flex"><DealCard deal={deal} /></li>)}
              </ul>
            </>
          )}
        </div>
      </PageShell>
    </>
  );
}

/* ── Carte bon plan ──────────────────────────────────────────────────────────*/

function DealCard({ deal }: { deal: BonPlan }) {
  const [copied, setCopied] = useState(false);
  const Icon   = TABS.find((t) => t.key === deal.categorie)?.icon ?? Tag;
  const isAide = deal.categorie === "aides";

  async function copyPromo() {
    if (!deal.code_promo) return;
    try {
      await navigator.clipboard.writeText(deal.code_promo);
      setCopied(true);
      toast.success(`Code « ${deal.code_promo} » copié.`);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Impossible de copier le code.");
    }
  }

  return (
    <Card interactive className="flex w-full flex-col p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Badge variant="secondary"><Icon aria-hidden className="size-3.5" />{CAT_LABEL[deal.categorie] ?? deal.categorie}</Badge>
        {deal.badge_texte && <Badge variant={BADGE_VARIANT[deal.badge_couleur] ?? "warning"}>{deal.badge_texte}</Badge>}
      </div>

      <h2 className="mb-2 font-display text-base font-semibold leading-snug text-foreground">{deal.titre}</h2>
      <p className="mb-4 flex-1 text-sm text-muted-foreground">{deal.description}</p>

      {deal.code_promo && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Code promo</p>
            <p className="truncate font-mono text-sm font-bold tracking-wider text-foreground">{deal.code_promo}</p>
          </div>
          <Button type="button" variant="secondary" size="icon" onClick={copyPromo}
            aria-label={copied ? "Code copié" : `Copier le code ${deal.code_promo}`}>
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>
      )}

      {deal.lien_url ? (
        <Button asChild variant={isAide ? "secondary" : "primary"} className="mt-auto w-full">
          <a href={deal.lien_url} target="_blank" rel="noopener noreferrer">
            {isAide ? "Vérifier mon éligibilité" : "Voir l'offre"}
            <ExternalLink />
          </a>
        </Button>
      ) : (
        <p className="mt-auto rounded-md border border-border py-2.5 text-center text-sm text-muted-foreground">Lien bientôt disponible</p>
      )}
    </Card>
  );
}
