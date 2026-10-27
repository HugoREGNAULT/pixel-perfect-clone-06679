import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Minus, ArrowUpRight, Sparkles, Loader2, Building2 } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { FaqSection, FAQ_COMMON, FAQ_STUDENT } from "@/components/Faq";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { supabase } from "@/integrations/supabase/client";
import { createSpringrCheckout } from "@/lib/springr.payments.functions";
import { toast } from "sonner";
import { STUDENT_FREE, STUDENT_PREMIUM, RECRUITER_FREE } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs étudiants — Springr" },
      { name: "description", content: "Découvre les plans Springr pour les étudiants : Gratuit et Premium. Les plans recruteurs sont sur la page Recruteurs." },
    ],
  }),
  component: TarifsPage,
});

// ─── Données (tout vient de src/lib/pricing.ts) ──────────────────────────────

const COMPARISON_TABLE = [
  { feature: "Profil et candidatures illimitées", gratuit: true, premium: true },
  { feature: "Badge Premium", gratuit: false, premium: true },
  { feature: "Alertes offres", gratuit: false, premium: true },
  { feature: "Accès aux mentors", gratuit: false, premium: true },
  { feature: "Support prioritaire", gratuit: false, premium: true },
];

function Mark({ on, label }: { on: boolean; label: string }) {
  return on ? (
    <>
      <Check className="mx-auto size-5 text-success-foreground" aria-hidden />
      <span className="sr-only">{label} : inclus</span>
    </>
  ) : (
    <>
      <Minus className="mx-auto size-5 text-muted-foreground" aria-hidden />
      <span className="sr-only">{label} : non inclus</span>
    </>
  );
}

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

  const premiumLookup = billing === "monthly" ? STUDENT_PREMIUM.lookupKeys.monthly : STUDENT_PREMIUM.lookupKeys.yearly;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />

      <main id="main" className="flex-1">
        {/* En-tête */}
        <Container size="md" className="pb-6 pt-12 md:pt-16">
          <SectionHeader
            as="h1"
            align="center"
            eyebrow="Tarifs étudiants"
            title="Commence gratuitement, passe Premium quand tu veux"
            description="Débuter est gratuit, sans engagement. Tu es recruteur ? Les plans entreprises sont sur la page Recruteurs."
          />

          <div
            role="group"
            aria-label="Périodicité de facturation"
            className="mx-auto mt-8 flex w-fit rounded-full border border-border bg-muted p-1"
          >
            {([
              ["monthly", "Mensuel"],
              ["yearly", "Annuel"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={billing === value}
                onClick={() => setBilling(value)}
                className={cn(
                  "inline-flex min-h-11 min-w-28 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  billing === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
                {value === "yearly" && <Badge variant="highlight">-17%</Badge>}
              </button>
            ))}
          </div>
        </Container>

        {/* Plans étudiants */}
        <Container size="md" className="py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Gratuit */}
            <Card className="flex flex-col p-6 sm:p-8">
              <p className="eyebrow text-muted-foreground">{STUDENT_FREE.sub}</p>
              <h2 className="mt-2 font-display text-h3 font-semibold text-foreground">{STUDENT_FREE.name}</h2>
              <p className="mt-4 font-display text-4xl font-bold text-foreground">{STUDENT_FREE.price}</p>
              <ul className="my-6 flex-1 space-y-3">
                {STUDENT_FREE.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-base text-foreground">
                    <Check className="mt-0.5 size-5 flex-none text-success-foreground" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant="secondary" size="lg" className="w-full" onClick={() => handleCheckout("gratuit", null)}>
                {STUDENT_FREE.cta}
              </Button>
            </Card>

            {/* Premium */}
            <Card className="relative flex flex-col border-primary p-6 shadow-md sm:p-8">
              <Badge className="absolute -top-3 left-6 gap-1">
                <Sparkles className="size-3.5" aria-hidden /> {STUDENT_PREMIUM.sub}
              </Badge>
              <p className="eyebrow text-primary">Pour aller plus loin</p>
              <h2 className="mt-2 font-display text-h3 font-semibold text-foreground">{STUDENT_PREMIUM.name}</h2>
              <p className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-foreground">
                  {billing === "monthly" ? STUDENT_PREMIUM.price : STUDENT_PREMIUM.priceYearly}
                </span>
                <span className="text-small text-muted-foreground">{billing === "monthly" ? "/mois" : "/an"}</span>
              </p>
              {billing === "yearly" && (
                <p className="mt-1 text-small text-muted-foreground">
                  soit {STUDENT_PREMIUM.priceYearlyMonthly}/mois en moyenne
                </p>
              )}
              <ul className="my-6 flex-1 space-y-3">
                {STUDENT_PREMIUM.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-base text-foreground">
                    <Check className="mt-0.5 size-5 flex-none text-success-foreground" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                className="w-full"
                disabled={loading === "premium"}
                onClick={() => handleCheckout("premium", premiumLookup)}
              >
                {loading === "premium" ? (
                  <Loader2 className="animate-spin" aria-label="Redirection en cours" />
                ) : (
                  <>
                    {STUDENT_PREMIUM.cta}
                    <ArrowUpRight aria-hidden />
                  </>
                )}
              </Button>
            </Card>
          </div>

          <p className="mt-6 text-center text-small text-muted-foreground">
            Paiement sécurisé par Stripe · Annulation à tout moment · Sans engagement
          </p>

          {/* Renvoi recruteurs */}
          <Card className="mt-10 flex flex-col gap-4 bg-primary-soft p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <Building2 className="mt-1 size-6 flex-none text-primary-soft-foreground" aria-hidden />
              <div>
                <h2 className="font-display text-h4 font-semibold text-foreground">Tu recrutes ?</h2>
                <p className="mt-1 text-base text-foreground-2">
                  Publier des offres est gratuit ({RECRUITER_FREE.features[0].toLowerCase()}). Découvre les plans
                  entreprises sur la page Recruteurs.
                </p>
              </div>
            </div>
            <Button asChild variant="secondary" className="flex-none">
              <Link to="/recruteurs" hash="tarifs">
                Voir les tarifs recruteurs
                <ArrowUpRight aria-hidden />
              </Link>
            </Button>
          </Card>
        </Container>

        {/* Comparaison */}
        <Container size="md" className="py-10 md:py-12">
          <SectionHeader title="Gratuit ou Premium, en détail" align="center" />
          <div className="mt-8 overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-base">
              <caption className="sr-only">Comparaison des plans étudiants Gratuit et Premium</caption>
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th scope="col" className="px-4 py-4 text-left font-semibold text-foreground sm:px-6">Fonctionnalité</th>
                  <th scope="col" className="px-4 py-4 text-center font-semibold text-foreground sm:px-6">{STUDENT_FREE.name}</th>
                  <th scope="col" className="px-4 py-4 text-center font-semibold text-primary sm:px-6">{STUDENT_PREMIUM.name}</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_TABLE.map((row) => (
                  <tr key={row.feature} className="border-b border-border last:border-b-0">
                    <th scope="row" className="px-4 py-4 text-left font-medium text-foreground sm:px-6">{row.feature}</th>
                    <td className="px-4 py-4 text-center sm:px-6"><Mark on={row.gratuit} label={row.feature} /></td>
                    <td className="bg-primary-soft/50 px-4 py-4 text-center sm:px-6"><Mark on={row.premium} label={row.feature} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>

        <FaqSection items={[...FAQ_STUDENT, ...FAQ_COMMON]} />

        {/* CTA final */}
        <Container size="sm" className="py-12 text-center md:py-16">
          <SectionHeader
            align="center"
            title="Prêt à trouver ton stage ou ton alternance ?"
            description="Crée ton profil gratuitement, tu pourras passer Premium plus tard."
          />
          <div className="mt-6 flex justify-center">
            <Button asChild size="lg">
              <Link to="/signup">Commencer gratuitement</Link>
            </Button>
          </div>
        </Container>
      </main>
    </div>
  );
}
