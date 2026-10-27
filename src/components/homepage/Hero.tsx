import { Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, GraduationCap, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const ENTRIES = [
  {
    to: "/opportunites",
    icon: Briefcase,
    title: "Stages et alternances",
    text: "Cherche par ville et par type de contrat.",
  },
  {
    to: "/bons-plans",
    icon: Gift,
    title: "Bons plans étudiants",
    text: "Réductions et avantages réunis au même endroit.",
  },
  {
    to: "/ecoles",
    icon: GraduationCap,
    title: "Annuaire des écoles",
    text: "Compare les écoles et repère les journées portes ouvertes.",
  },
] as const;

export function Hero() {
  return (
    <section className="border-b border-border bg-background">
      <Container className="grid gap-10 py-12 md:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:py-24">
        <div className="space-y-6">
          <p className="eyebrow">Le réseau pro des 15-29 ans</p>
          <h1 className="text-display font-bold text-foreground">
            Trouve ton stage, ton alternance et tes bons plans.
          </h1>
          <p className="max-w-xl text-body-lg text-muted-foreground">
            Springr réunit au même endroit les offres, les bons plans et les écoles pour les
            étudiants, et un espace pour les recruteurs qui veulent les rencontrer.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/signup">
                Commencer gratuitement
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              {/* P5 gère la présélection du rôle côté inscription. */}
              <Link to="/signup" search={{ role: "recruteur" } as never}>
                Je recrute
              </Link>
            </Button>
          </div>
          <p className="text-small text-muted-foreground">
            Gratuit pour les étudiants, sans carte bancaire.
          </p>
        </div>

        <ul className="grid gap-3" aria-label="Ce que tu trouves sur Springr">
          {ENTRIES.map(({ to, icon: Icon, title, text }) => (
            <li key={to}>
              <Link to={to} className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                <Card interactive className="flex items-center gap-4 p-4 sm:p-5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-soft-foreground">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-h4 font-semibold text-foreground">{title}</span>
                    <span className="block text-small text-muted-foreground">{text}</span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
