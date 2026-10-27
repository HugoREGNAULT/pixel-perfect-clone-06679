import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { RECRUITER_FREE, STUDENT_FREE, STUDENT_PREMIUM } from "@/lib/pricing";

/** Résumé des tarifs, alimenté uniquement par src/lib/pricing.ts. Détail et achat : /tarifs. */
const SUMMARY = [
  {
    audience: "Étudiants",
    name: STUDENT_FREE.name,
    price: STUDENT_FREE.price,
    period: "",
    features: STUDENT_FREE.features.slice(0, 3),
  },
  {
    audience: "Étudiants",
    name: STUDENT_PREMIUM.name,
    price: STUDENT_PREMIUM.price,
    period: STUDENT_PREMIUM.period,
    features: STUDENT_PREMIUM.features.filter((f) => !/mentor/i.test(f)).slice(1, 4),
  },
  {
    audience: "Recruteurs",
    name: RECRUITER_FREE.name,
    price: RECRUITER_FREE.price,
    period: RECRUITER_FREE.period,
    features: RECRUITER_FREE.features.slice(0, 3),
  },
] as const;

export function Pricing() {
  return (
    <section id="tarifs" className="scroll-mt-20 bg-background py-12 md:py-20">
      <Container>
        <SectionHeader
          align="center"
          eyebrow="Tarifs"
          title="Gratuit pour commencer"
          description="Les étudiants et les recruteurs peuvent démarrer sans payer. Les options payantes sont détaillées sur la page Tarifs."
        />
        <div className="mt-8 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
          {SUMMARY.map((plan) => (
            <Card key={`${plan.audience}-${plan.name}`} className="flex flex-col gap-4 p-5 md:p-6">
              <div>
                <p className="eyebrow">{plan.audience}</p>
                <h3 className="text-h3 font-semibold text-foreground">{plan.name}</h3>
              </div>
              <p className="font-display text-h2 font-bold text-foreground">
                {plan.price}
                {plan.period ? (
                  <span className="text-small font-medium text-muted-foreground"> {plan.period}</span>
                ) : null}
              </p>
              <ul className="flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-base text-foreground-2">
                    <Check className="mt-1 size-4 shrink-0 text-success-foreground" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Button asChild variant="secondary" size="lg">
            <Link to="/tarifs">Voir tous les tarifs</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
