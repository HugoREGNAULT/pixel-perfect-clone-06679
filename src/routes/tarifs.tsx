import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ArrowUpRight, Sparkles, Loader2, ChevronDown } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { createSpringrCheckout } from "@/lib/springr.payments.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Des tarifs transparents pour tous — Springr" },
      { name: "description", content: "Découvrez les plans de tarification Springr. Étudiants et entreprises." },
    ],
  }),
  component: TarifsPage,
});

// ─── Data ────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "startup",
    lookupKey: null,
    name: "Startup",
    monthly: "0€",
    yearly: "0€",
    sub: "Commencer",
    color: "border-[#e5e7eb]",
    accent: "text-[#6b7280]",
    featured: false,
    cta: "Commencer gratuitement",
    ctaStyle: "border border-[#e5e7eb] text-[#111827] hover:bg-[#f3f4f6]",
    features: [
      "Accès aux offres",
      "Profil étudiant",
      "1 candidature par jour",
      "Accès aux JPO",
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
    color: "border-[#0066ff]",
    accent: "text-[#0066ff]",
    featured: true,
    cta: "Devenir Premium",
    ctaStyle: "bg-[#0066ff] text-white hover:bg-[#0052cc]",
    features: [
      "Tout du plan Startup",
      "Candidatures illimitées",
      "Alertes offres",
      "Badge Premium",
      "Accès aux mentors",
      "Support prioritaire",
    ],
  },
  {
    id: "entreprises",
    lookupKey: null,
    name: "Entreprises",
    monthly: "189€",
    yearly: "1890€",
    sub: "Plan personnalisé",
    color: "border-[#fdcb58]",
    accent: "text-[#fdcb58]",
    featured: false,
    cta: "Nous contacter",
    ctaStyle: "bg-[#fdcb58] text-[#111827] hover:bg-[#fdc73c]",
    features: [
      "Offres illimitées",
      "Support 24/7",
      "Reporting avancé",
      "Manager dédié",
      "Marque blanche",
      "API access",
    ],
  },
] as const;

const COMPARISON_TABLE = [
  {
    feature: "Fonctionnalités de base",
    startup: "✓",
    premium: "✓",
    entreprises: "✓",
  },
  {
    feature: "Candidatures par jour",
    startup: "1",
    premium: "Illimitées",
    entreprises: "Illimitées",
  },
  {
    feature: "Offres visibles",
    startup: "N/A",
    premium: "N/A",
    entreprises: "Illimitées",
  },
  {
    feature: "Badge Premium",
    startup: "N/A",
    premium: "✓",
    entreprises: "N/A",
  },
  {
    feature: "Alertes offres",
    startup: "N/A",
    premium: "✓",
    entreprises: "✓",
  },
  {
    feature: "Accès mentors",
    startup: "N/A",
    premium: "✓",
    entreprises: "Prioritaire",
  },
  {
    feature: "Support",
    startup: "Standard",
    premium: "Prioritaire",
    entreprises: "24/7 dédié",
  },
  {
    feature: "Manager dédié",
    startup: "N/A",
    premium: "N/A",
    entreprises: "✓",
  },
];

const FAQS = [
  {
    question: "Puis-je changer de plan n'importe quand ?",
    answer: "Oui, vous pouvez modifier votre plan à tout moment. Les changements prennent effet immédiatement.",
  },
  {
    question: "L'essai gratuit est-il vraiment gratuit ?",
    answer: "Oui, notre plan Startup est complètement gratuit. Aucune carte bancaire requise pour commencer.",
  },
  {
    question: "Puis-je annuler mon abonnement ?",
    answer: "Bien sûr ! Vous pouvez annuler votre abonnement à tout moment via votre profil. Aucun engagement requis.",
  },
  {
    question: "Proposez-vous une facturation annuelle ?",
    answer: "Oui, nous offrons une réduction de 17% sur la facturation annuelle pour les plans Premium.",
  },
  {
    question: "Avez-vous des tarifs pour les étudiants ?",
    answer: "Notre plan Premium à 4,99€/mois est déjà très accessible pour les étudiants. Vous pouvez commencer gratuitement.",
  },
  {
    question: "Comment contacter le support ?",
    answer: "Nos équipes répondent via support@springr.fr. Les clients Premium+ ont accès au support prioritaire.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

function TarifsPage() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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
    <div className="min-h-screen bg-[#f9fafb]">
      <AppNav />

      <main className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-white overflow-hidden py-20 lg:py-32 px-4 lg:px-0">
          {/* Decorative blurs */}
          <div className="absolute top-20 right-0 w-64 h-64 bg-[#fdcb58] rounded-full blur-3xl opacity-30 mix-blend-multiply" />
          <div className="absolute bottom-20 left-0 w-64 h-64 bg-[#00d084] rounded-full blur-3xl opacity-30 mix-blend-multiply" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-[#111827] mb-4 leading-tight">
              Des tarifs transparents pour tous
            </h1>
            <p className="text-[#6b7280] text-lg max-w-2xl mx-auto mb-8">
              Découvrez l'offre qui correspond à votre projet. Débuter est gratuit, sans engagement.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex rounded-full border border-[#e5e7eb] bg-[#f3f4f6] p-1 gap-1">
              <button
                onClick={() => setBilling("monthly")}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                  billing === "monthly"
                    ? "bg-white text-[#111827] shadow-sm border border-[#e5e7eb]"
                    : "text-[#6b7280] hover:text-[#111827]"
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={`relative rounded-full px-6 py-2 text-sm font-medium transition-all ${
                  billing === "yearly"
                    ? "bg-white text-[#111827] shadow-sm border border-[#e5e7eb]"
                    : "text-[#6b7280] hover:text-[#111827]"
                }`}
              >
                Annuel
                <span className="absolute -top-2 -right-2 rounded-full bg-[#fdcb58] text-[#111827] text-xs font-bold px-2 py-0.5 leading-none">
                  -17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-6xl mx-auto px-4 py-16 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {PLANS.map((plan) => {
              const price = billing === "monthly" ? plan.monthly : plan.yearly;
              const period = billing === "monthly" ? "/mois" : "/an";
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
                  className={`relative flex flex-col rounded-2xl border p-8 ${
                    plan.featured
                      ? `${plan.color} bg-gradient-to-br from-[#0066ff]/5 to-transparent shadow-lg scale-105 md:scale-100`
                      : `${plan.color} bg-white`
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#0066ff] px-4 py-1.5 text-xs font-semibold text-white">
                        <Sparkles className="size-4" /> Recommandé
                      </span>
                    </div>
                  )}

                  <div className="mb-8">
                    <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${plan.accent}`}>
                      {plan.sub}
                    </div>
                    <h2 className="font-display font-bold text-2xl text-[#111827] mb-4">{plan.name}</h2>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display font-bold text-4xl text-[#111827]">{price}</span>
                      {plan.id !== "startup" && <span className="text-[#6b7280] text-sm">{period}</span>}
                    </div>
                    {monthlyEquiv && (
                      <p className="text-xs text-[#6b7280] mt-2">soit {monthlyEquiv}/mois en moyenne</p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-[#111827]">
                        <Check className="size-5 text-[#00d084] shrink-0 flex-none mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleCheckout(plan.id, currentLookup)}
                    disabled={loading === plan.id}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-semibold transition-all ${plan.ctaStyle} disabled:opacity-60`}
                  >
                    {loading === plan.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        {plan.cta}
                        {plan.id !== "startup" && <ArrowUpRight className="size-4" />}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-[#6b7280] mt-8">
            Paiement sécurisé par Stripe · Annulation à tout moment · Sans engagement
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white py-16 px-4 lg:px-0">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-[#111827] text-center mb-12">
              Comparaison détaillée
            </h2>

            <div className="overflow-x-auto border border-[#e5e7eb] rounded-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                    <th className="text-left py-4 px-6 font-semibold text-[#111827]">Fonctionnalité</th>
                    <th className="text-center py-4 px-6 font-semibold text-[#111827]">Startup</th>
                    <th className="text-center py-4 px-6 font-semibold text-[#111827]">Premium</th>
                    <th className="text-center py-4 px-6 font-semibold text-[#111827]">Entreprises</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_TABLE.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-[#e5e7eb] ${idx % 2 === 0 ? "bg-white" : "bg-[#f9fafb]"}`}
                    >
                      <td className="py-4 px-6 text-[#111827] font-medium">{row.feature}</td>
                      <td className="text-center py-4 px-6 text-[#6b7280]">{row.startup}</td>
                      <td className="text-center py-4 px-6 text-[#00d084] font-medium">{row.premium}</td>
                      <td className="text-center py-4 px-6 text-[#0066ff] font-medium">{row.entreprises}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-[#f9fafb] py-16 px-4 lg:px-0">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-[#111827] text-center mb-12">
              Questions fréquentes
            </h2>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <button
                  key={idx}
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full text-left border border-[#e5e7eb] rounded-xl p-6 bg-white hover:border-[#d1d5db] transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-[#111827]">{faq.question}</h3>
                    <ChevronDown
                      className={`size-5 text-[#6b7280] flex-none transition-transform ${
                        expandedFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {expandedFaq === idx && (
                    <p className="text-[#6b7280] mt-4 text-sm leading-relaxed">{faq.answer}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#111827] text-white py-16 px-4 lg:px-0">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold mb-4">Prêt à booster votre carrière ?</h2>
            <p className="text-[#d1d5db] mb-8 text-lg">
              Rejoignez des milliers d'étudiants qui ont trouvé leur stage ou alternance grâce à Springr.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate({ to: "/signup" })}
                className="px-8 py-3 rounded-xl bg-[#fdcb58] text-[#111827] font-semibold hover:bg-[#fdc73c] transition-colors"
              >
                Commencer gratuitement
              </button>
              <Link
                to="/login"
                className="px-8 py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors inline-flex items-center justify-center"
              >
                Passer à Premium
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <SiteFooter />
      </main>
    </div>
  );
}
