import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppNav } from "@/components/AppNav";
import { supabase } from "@/integrations/supabase/client";
import { createSpringrCheckout } from "@/lib/springr.payments.functions";
import { toast } from "sonner";
import {
  Check,
  ArrowUpRight,
  Zap,
  BarChart3,
  Users,
  Sparkles,
  Shield,
  Rocket,
  Star,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/recruteurs")({
  head: () => ({ meta: [{ title: "Pour les recruteurs — Springr" }] }),
  component: RecruteursPage,
});

/* -------------------------------------------------------------------- data */

const PLANS = [
  {
    id: "gratuit",
    lookupKey: null,
    name: "Gratuit",
    price: "0€",
    period: "",
    sub: "Pour commencer",
    color: "border-white/15",
    accent: "text-mute",
    cta: "Commencer gratuitement",
    ctaStyle: "border border-white/20 text-white hover:bg-white/5",
    featured: false,
    features: [
      "Jusqu'à 3 offres par mois",
      "Profil entreprise basique",
      "Accès aux candidatures",
      "Listing standard dans les résultats",
      "Support par email",
    ],
    missing: ["Mise en avant", "Analytics", "Tableau de bord", "Accès aux profils étudiants"],
  },
  {
    id: "company_starter",
    lookupKey: "company_starter_per_job",
    name: "Starter",
    price: "29,99€",
    period: "/offre",
    sub: "Le plus populaire",
    color: "border-violet/50",
    accent: "text-violet-soft",
    cta: "Publier une offre",
    ctaStyle: "bg-violet text-white hover:bg-violet/90",
    featured: true,
    features: [
      "1 annonce mise en avant",
      "Badge « Sponsorisée » visible",
      "Boost visibilité ×10",
      "Analytics de l'annonce (vues, clics)",
      "Position prioritaire dans les résultats",
      "Support prioritaire sous 24h",
    ],
    missing: ["Offres illimitées", "Tableau de bord complet", "Accès aux profils"],
  },
  {
    id: "company_pro",
    lookupKeyMonthly: "company_pro_monthly",
    lookupKeyYearly: "company_pro_yearly",
    name: "Pro Illimité",
    priceMonthly: "199€",
    priceYearly: "1 990€",
    period: "/mois",
    periodYearly: "/an",
    sub: "Pour les équipes RH",
    color: "border-lime/40",
    accent: "text-lime",
    cta: "Passer Pro",
    ctaStyle: "bg-lime text-ink hover:-translate-y-0.5",
    featured: false,
    features: [
      "Offres illimitées chaque mois",
      "Tableau de bord recruteur complet",
      "Stats avancées (vues, candidatures, taux)",
      "Accès aux profils étudiants open-to-work",
      "Sourcing proactif par domaine",
      "Export CSV des candidatures",
      "Account manager dédié",
      "Intégration ATS disponible",
    ],
    missing: [],
  },
] as const;

const TRUST_STATS = [
  { n: "2 400+", label: "étudiants inscrits" },
  { n: "48",     label: "écoles représentées" },
  { n: "120",    label: "mentors actifs" },
  { n: "94%",    label: "taux de réponse" },
];

const ADVANTAGES = [
  { icon: Users,     title: "Talent qualifié & ciblé",      desc: "Des profils étudiants vérifiés, avec compétences, projets et écoles — pas des CVs vides." },
  { icon: Zap,       title: "Mise en ligne en 2 minutes",   desc: "Publie une offre depuis ton tableau de bord sans friction. Visible immédiatement." },
  { icon: BarChart3, title: "Stats en temps réel",          desc: "Vues, clics, candidatures : tu sais exactement ce qui fonctionne." },
  { icon: Shield,    title: "Profils vérifiés",             desc: "Chaque étudiant a une adresse email académique vérifiée et un profil complet." },
];

/* -------------------------------------------------------------------- page */

function RecruteursPage() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  async function handlePlan(planId: string, lookupKey: string | null) {
    if (!lookupKey) {
      navigate({ to: "/signup" });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Connecte-toi pour accéder aux offres payantes.");
      navigate({ to: "/login" });
      return;
    }

    setLoading(planId);
    try {
      const origin = window.location.origin;
      const result = await createSpringrCheckout({
        data: {
          lookupKey,
          successUrl: `${origin}/success?plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl:  `${origin}/cancel?plan=${planId}`,
          userId:     session.user.id,
          userEmail:  session.user.email!,
        },
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      window.location.href = result.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de la redirection.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />

      <main className="pb-24">
        {/* ---- hero ---- */}
        <section className="relative overflow-hidden">
          <div className="grid-bg absolute inset-0 opacity-30 pointer-events-none" />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-violet/25 blur-[120px] pointer-events-none" />

          <div className="relative mx-auto max-w-5xl px-5 pt-16 pb-20 text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <Rocket className="size-4 text-lime" />
              <span className="eyebrow">Pour les recruteurs</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[72px] font-bold leading-[1.0] mb-6">
              Touche les talents<br />
              <span className="text-violet">avant tout le monde.</span>
            </h1>
            <p className="text-mute text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              2 400 étudiants qualifiés sur Springr, actifs dans leurs recherches.
              Publie tes offres là où ça compte.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/signup" className="group inline-flex items-center gap-2 rounded-full bg-lime px-7 py-4 text-base font-semibold text-ink hover:-translate-y-0.5 transition-transform glow-lime">
                Créer un compte recruteur
                <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" />
              </Link>
              <a href="#tarifs" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-4 text-base text-white hover:bg-white/5 transition-all">
                Voir les tarifs
              </a>
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
              {TRUST_STATS.map(({ n, label }) => (
                <div key={label} className="text-center">
                  <div className="font-display text-2xl font-bold text-white">{n}</div>
                  <div className="text-xs text-mute mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- advantages ---- */}
        <section className="border-y border-white/5 bg-ink-2/40 py-16">
          <div className="mx-auto max-w-5xl px-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {ADVANTAGES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex flex-col gap-3">
                  <div className="size-10 rounded-xl bg-lime/10 border border-lime/20 flex items-center justify-center">
                    <Icon className="size-5 text-lime" />
                  </div>
                  <h3 className="font-display font-bold text-base">{title}</h3>
                  <p className="text-sm text-mute leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- pricing ---- */}
        <section id="tarifs" className="mx-auto max-w-5xl px-5 py-20">
          <div className="text-center mb-14">
            <div className="eyebrow mb-4">Tarifs</div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold">
              Simple et transparent.
            </h2>
            <p className="mt-4 text-mute text-lg">Commence gratuitement, monte en puissance quand tu veux.</p>

            {/* Billing toggle (only relevant for Pro plan) */}
            <div className="mt-6 inline-flex rounded-full border border-white/15 bg-white/5 p-1 gap-1">
              <button
                onClick={() => setBilling("monthly")}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${billing === "monthly" ? "bg-white text-ink" : "text-mute hover:text-white"}`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={`relative rounded-full px-5 py-2 text-sm font-medium transition-all ${billing === "yearly" ? "bg-white text-ink" : "text-mute hover:text-white"}`}
              >
                Annuel
                <span className="absolute -top-2 -right-2 rounded-full bg-lime text-ink text-[9px] font-bold px-1.5 py-0.5 leading-none">
                  -17%
                </span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {PLANS.map((plan) => {
              const isPro = plan.id === "company_pro";
              const price = isPro
                ? billing === "monthly"
                  ? (plan as any).priceMonthly
                  : (plan as any).priceYearly
                : (plan as any).price;
              const period = isPro
                ? billing === "monthly" ? "/mois" : "/an"
                : (plan as any).period;
              const lookupKey = isPro
                ? billing === "monthly"
                  ? (plan as any).lookupKeyMonthly
                  : (plan as any).lookupKeyYearly
                : (plan as any).lookupKey;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border p-6 ${plan.color} ${
                    plan.featured
                      ? "bg-gradient-to-b from-violet/15 to-transparent shadow-[0_0_60px_-20px_rgba(124,92,250,0.4)]"
                      : "bg-gradient-to-b from-white/[0.04] to-transparent"
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-white">
                        <Sparkles className="size-3" /> Populaire
                      </span>
                    </div>
                  )}

                  <div className="mb-6 pt-2">
                    <div className={`text-xs font-mono uppercase tracking-wider mb-2 ${plan.accent}`}>{plan.sub}</div>
                    <h3 className="font-display font-bold text-xl mb-4">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display font-bold text-4xl">{price}</span>
                      {period && <span className="text-mute text-sm">{period}</span>}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className="size-4 text-lime shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                    {plan.missing.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-mute/50 line-through">
                        <Check className="size-4 text-white/10 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePlan(plan.id, lookupKey ?? null)}
                    disabled={loading === plan.id}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all ${plan.ctaStyle} disabled:opacity-60`}
                  >
                    {loading === plan.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowUpRight className="size-4" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-mute mt-8">
            Tous les prix sont HT · Paiement sécurisé par Stripe · Annulation à tout moment
          </p>
        </section>

        {/* ---- testimonial / CTA ---- */}
        <section className="mx-auto max-w-5xl px-5 pb-10">
          <div className="relative rounded-3xl border border-violet/30 bg-gradient-to-br from-violet/20 via-ink-2 to-ink-2 p-8 sm:p-14 overflow-hidden noise">
            <div className="absolute -top-20 -right-20 size-80 rounded-full bg-violet/30 blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-lime/15 blur-[100px]" />

            <div className="relative text-center max-w-2xl mx-auto">
              <Star className="size-8 text-lime mx-auto mb-5 fill-lime/30" />
              <blockquote className="font-display text-2xl sm:text-3xl font-bold leading-snug mb-6">
                « On a trouvé 3 alternants en moins d'une semaine via Springr. Des profils qu'on n'aurait jamais croisés sur LinkedIn. »
              </blockquote>
              <p className="text-mute text-sm mb-8">— Léa, RH chez Pennylane · Utilisatrice beta</p>
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 rounded-full bg-lime px-7 py-4 text-base font-semibold text-ink hover:-translate-y-0.5 transition-transform glow-lime"
              >
                Rejoindre en tant que recruteur
                <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
