import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ArrowUpRight, Sparkles, Loader2, Zap } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { supabase } from "@/integrations/supabase/client";
import { createSpringrCheckout } from "@/lib/springr.payments.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs Étudiants — Springr" },
      { name: "description", content: "Plans Premium pour étudiants et lycéens Springr." },
    ],
  }),
  component: TarifsPage,
});

// ─── Data ────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "gratuit",
    lookupKey: null,
    name: "Gratuit",
    monthly: "0€",
    yearly: "0€",
    sub: "Pour commencer",
    color: "border-white/15",
    accent: "text-mute",
    featured: false,
    cta: "Commencer gratuitement",
    ctaStyle: "border border-white/20 text-white hover:bg-white/5",
    features: [
      "Profil étudiant complet",
      "Accès aux offres de stage/alternance",
      "1 candidature par jour",
      "Accès aux JPO",
      "Annuaire des écoles",
    ],
    missing: [
      "Candidatures illimitées",
      "Badge Premium visible",
      "Accès aux mentors en DM",
      "Alertes offres en temps réel",
    ],
  },
  {
    id: "premium",
    lookupKey: { monthly: "student_premium_monthly", yearly: "student_premium_yearly" },
    name: "Premium",
    monthly: "4,99€",
    yearly: "49,99€",
    yearlyMonth: "4,17€",
    sub: "Recommandé",
    color: "border-violet/50",
    accent: "text-violet-soft",
    featured: true,
    cta: "Devenir Premium",
    ctaStyle: "bg-violet text-white hover:bg-violet/90",
    features: [
      "Tout du plan Gratuit",
      "Candidatures illimitées",
      "Badge Premium sur ton profil",
      "Alertes offres en temps réel",
      "Accès aux mentors en DM",
      "Support prioritaire",
    ],
    missing: [
      "Badge Premium+ exclusif",
      "Coaching CV & lettre de motivation",
    ],
  },
  {
    id: "premium_plus",
    lookupKey: { monthly: "student_premium_plus_monthly", yearly: "student_premium_plus_yearly" },
    name: "Premium+",
    monthly: "9,99€",
    yearly: "99,99€",
    yearlyMonth: "8,33€",
    sub: "Tout débloqué",
    color: "border-lime/40",
    accent: "text-lime",
    featured: false,
    cta: "Choisir Premium+",
    ctaStyle: "bg-lime text-ink hover:-translate-y-0.5",
    features: [
      "Tout du plan Premium",
      "Badge Premium+ exclusif visible",
      "Coaching CV & lettre de motivation",
      "Accès anticipé aux nouvelles features",
      "Canal Discord privé avec l'équipe",
      "Ton avis dans la roadmap",
    ],
    missing: [],
  },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

function TarifsPage() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(planId: string, lookupKey: string | null) {
    if (!lookupKey) {
      navigate({ to: "/signup" });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Connecte-toi pour souscrire à un plan.");
      navigate({ to: "/login" });
      return;
    }

    setLoading(planId);
    try {
      const origin = window.location.origin;
      const result = await createSpringrCheckout({
        data: {
          lookupKey,
          successUrl: `${origin}/success?plan=${planId.replace("student_", "").replace("_monthly", "").replace("_yearly", "")}&session_id={CHECKOUT_SESSION_ID}`,
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

      <main className="mx-auto max-w-5xl px-5 py-16 pb-24">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <Zap className="size-4 text-lime" />
            <span className="eyebrow">Étudiants & Lycéens</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] mb-5">
            Choisis ton plan
          </h1>
          <p className="text-mute text-lg max-w-xl mx-auto mb-8">
            Commence gratuitement. Passe Premium quand tu es prêt·e.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1 gap-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                billing === "monthly"
                  ? "bg-white text-ink"
                  : "text-mute hover:text-white"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`relative rounded-full px-5 py-2 text-sm font-medium transition-all ${
                billing === "yearly"
                  ? "bg-white text-ink"
                  : "text-mute hover:text-white"
              }`}
            >
              Annuel
              <span className="absolute -top-2 -right-2 rounded-full bg-lime text-ink text-[9px] font-bold px-1.5 py-0.5 leading-none">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const price = billing === "monthly" ? plan.monthly : plan.yearly;
            const period = plan.id === "gratuit" ? "" : billing === "monthly" ? "/mois" : "/an";
            const monthlyEquiv = billing === "yearly" && "yearlyMonth" in plan ? (plan as any).yearlyMonth : null;
            const currentLookup =
              plan.lookupKey && billing === "monthly"
                ? (plan.lookupKey as any).monthly
                : plan.lookupKey
                  ? (plan.lookupKey as any).yearly
                  : null;

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
                      <Sparkles className="size-3" /> Recommandé
                    </span>
                  </div>
                )}

                <div className="mb-6 pt-2">
                  <div className={`text-xs font-mono uppercase tracking-wider mb-2 ${plan.accent}`}>
                    {plan.sub}
                  </div>
                  <h2 className="font-display font-bold text-xl mb-4">{plan.name}</h2>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display font-bold text-4xl">{price}</span>
                    {period && <span className="text-mute text-sm">{period}</span>}
                  </div>
                  {monthlyEquiv && (
                    <p className="text-xs text-mute mt-1">soit {monthlyEquiv}/mois</p>
                  )}
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
                  onClick={() => handleCheckout(plan.id, currentLookup)}
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
          Paiement sécurisé par Stripe · Annulation à tout moment · Sans engagement
        </p>

        {/* Recruteurs link */}
        <div className="mt-16 text-center border-t border-white/5 pt-12">
          <p className="text-mute mb-3">Tu es recruteur ou entreprise ?</p>
          <Link
            to="/recruteurs"
            className="inline-flex items-center gap-2 text-violet-soft hover:text-white transition-colors text-sm"
          >
            Voir les offres Entreprises <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
