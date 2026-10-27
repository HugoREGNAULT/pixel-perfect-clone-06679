import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Minus, ArrowUpRight, Sparkles, Loader2, Users, FileText, BarChart3, LayoutDashboard } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { FaqSection, FAQ_COMMON, FAQ_RECRUITER } from "@/components/Faq";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { supabase } from "@/integrations/supabase/client";
import { createSpringrCheckout } from "@/lib/springr.payments.functions";
import { toast } from "sonner";
import { RECRUITER_FREE, RECRUITER_STARTER, RECRUITER_PRO } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/recruteurs")({
  head: () => ({
    meta: [
      { title: "Pour les recruteurs — Springr" },
      { name: "description", content: "Publie tes offres de stage, d'alternance et de premier emploi auprès des 15-29 ans. Gratuit pour commencer." },
    ],
  }),
  component: RecruteursPage,
});

const SIGNUP_RECRUITER = "/signup?role=recruteur";

/** Uniquement des fonctionnalités qui existent dans le produit. */
const ADVANTAGES = [
  { icon: Users, title: "Une audience de 15 à 29 ans", desc: "Tes offres de stage, d'alternance et de premier emploi s'adressent à des étudiants et de jeunes diplômés." },
  { icon: FileText, title: "Des profils détaillés", desc: "Chaque étudiant renseigne ses compétences, ses projets et son école sur son profil." },
  { icon: LayoutDashboard, title: "Un tableau de bord recruteur", desc: "Publie tes offres et retrouve les candidatures reçues au même endroit." },
  { icon: BarChart3, title: "Des statistiques d'annonce", desc: "Avec Starter et Pro, suis les vues et les clics de tes annonces." },
];

type Plan = {
  id: string;
  name: string;
  sub: string;
  price: string;
  period: string;
  features: readonly string[];
  missing: readonly string[];
  cta: string;
  featured: boolean;
  lookupKey: string | null;
};

function RecruteursPage() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  const plans: Plan[] = [
    { ...RECRUITER_FREE, lookupKey: null, featured: false },
    { ...RECRUITER_STARTER, sub: "Pour une annonce", lookupKey: RECRUITER_STARTER.lookupKey, featured: true },
    {
      ...RECRUITER_PRO,
      price: billing === "monthly" ? RECRUITER_PRO.priceMonthly : RECRUITER_PRO.priceYearly,
      period: billing === "monthly" ? RECRUITER_PRO.period : RECRUITER_PRO.periodYearly,
      lookupKey: billing === "monthly" ? RECRUITER_PRO.lookupKeyMonthly : RECRUITER_PRO.lookupKeyYearly,
      featured: false,
    },
  ];

  async function handlePlan(planId: string, lookupKey: string | null) {
    if (!lookupKey) {
      window.location.href = SIGNUP_RECRUITER;
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
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />

      <main id="main" className="flex-1">
        {/* Hero */}
        <Container size="md" className="py-14 text-center md:py-20">
          <p className="eyebrow text-primary">Pour les recruteurs</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-display font-bold text-foreground">
            Recrute des étudiants et de jeunes diplômés
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-body-lg text-muted-foreground">
            Publie tes offres de stage, d'alternance et de premier emploi auprès des 15-29 ans. Commencer est gratuit.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <a href={SIGNUP_RECRUITER}>
                Publier une offre
                <ArrowUpRight aria-hidden />
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#tarifs">Voir les tarifs</a>
            </Button>
          </div>
        </Container>

        {/* Avantages */}
        <section className="border-y border-border bg-muted py-12 md:py-16">
          <Container size="md">
            <SectionHeader title="Ce que tu trouves sur Springr" align="center" />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {ADVANTAGES.map(({ icon: Icon, title, desc }) => (
                <li key={title}>
                  <Card className="flex h-full gap-4 p-5">
                    <span className="flex size-11 flex-none items-center justify-center rounded-md bg-primary-soft text-primary-soft-foreground">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-display text-h4 font-semibold text-foreground">{title}</h3>
                      <p className="mt-1 text-base text-muted-foreground">{desc}</p>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* Tarifs */}
        <section id="tarifs" className="scroll-mt-20 py-12 md:py-16">
          <Container>
            <SectionHeader
              align="center"
              eyebrow="Tarifs recruteurs"
              title="Simple et transparent"
              description="Commence gratuitement, passe à un plan payant quand tu en as besoin."
            />

            <div
              role="group"
              aria-label="Périodicité du plan Pro"
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
                    "inline-flex min-h-11 min-w-28 cursor-pointer items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    billing === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-small text-muted-foreground">La périodicité concerne le plan Pro.</p>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={cn("relative flex flex-col p-6 sm:p-8", plan.featured && "border-primary shadow-md")}
                >
                  {plan.featured && (
                    <Badge className="absolute -top-3 left-6 gap-1">
                      <Sparkles className="size-3.5" aria-hidden /> Par offre
                    </Badge>
                  )}
                  <p className={cn("eyebrow", plan.featured ? "text-primary" : "text-muted-foreground")}>{plan.sub}</p>
                  <h3 className="mt-2 font-display text-h3 font-semibold text-foreground">{plan.name}</h3>
                  <p className="mt-4 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.period && <span className="text-small text-muted-foreground">{plan.period}</span>}
                  </p>

                  <ul className="my-6 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-base text-foreground">
                        <Check className="mt-0.5 size-5 flex-none text-success-foreground" aria-hidden />
                        <span>{f}</span>
                      </li>
                    ))}
                    {plan.missing.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-base text-muted-foreground">
                        <Minus className="mt-0.5 size-5 flex-none" aria-hidden />
                        <span>
                          {f}
                          <span className="sr-only"> : non inclus</span>
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="lg"
                    variant={plan.featured ? "primary" : "secondary"}
                    className="w-full"
                    disabled={loading === plan.id}
                    onClick={() => handlePlan(plan.id, plan.lookupKey)}
                  >
                    {loading === plan.id ? (
                      <Loader2 className="animate-spin" aria-label="Redirection en cours" />
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowUpRight aria-hidden />
                      </>
                    )}
                  </Button>
                </Card>
              ))}
            </div>

            <p className="mt-6 text-center text-small text-muted-foreground">
              Tous les prix sont HT · Paiement sécurisé par Stripe · Annulation à tout moment
            </p>
          </Container>
        </section>

        <FaqSection id="faq" title="Questions fréquentes des recruteurs" items={[...FAQ_RECRUITER, ...FAQ_COMMON]} />

        {/* CTA final */}
        <Container size="sm" className="py-12 text-center md:py-16">
          <SectionHeader
            align="center"
            title="Prêt à publier ta première offre ?"
            description="Crée ton compte recruteur gratuitement."
          />
          <div className="mt-6 flex justify-center">
            <Button asChild size="lg">
              <a href={SIGNUP_RECRUITER}>
                Publier une offre
                <ArrowUpRight aria-hidden />
              </a>
            </Button>
          </div>
        </Container>
      </main>
    </div>
  );
}
