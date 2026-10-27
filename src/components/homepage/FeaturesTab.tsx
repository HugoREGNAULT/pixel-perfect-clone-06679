import { Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, GraduationCap, Gift } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";

const FEATURES = [
  {
    to: "/opportunites",
    icon: Briefcase,
    title: "Offres",
    text: "Stages, alternances et premiers emplois au même endroit, au lieu d'être éparpillés sur dix sites.",
    cta: "Voir les offres",
  },
  {
    to: "/bons-plans",
    icon: Gift,
    title: "Bons plans",
    text: "Des réductions et avantages pensés pour les étudiants, faciles à retrouver.",
    cta: "Voir les bons plans",
  },
  {
    to: "/ecoles",
    icon: GraduationCap,
    title: "Écoles",
    text: "Un annuaire pour comparer les écoles et repérer leurs journées portes ouvertes.",
    cta: "Explorer les écoles",
  },
] as const;

/** Section « Fonctionnalités » (ancre #fonctionnalites : remplace l'ancienne page /fonctionnalites). */
export function FeaturesTab() {
  return (
    <section id="fonctionnalites" className="scroll-mt-20 border-y border-border bg-muted py-12 md:py-20">
      <Container>
        <SectionHeader
          align="center"
          title="Tout ce qu'il te faut, au même endroit"
          description="Springr rassemble les offres, les bons plans et les écoles pour t'éviter de multiplier les onglets."
        />
        <div className="mt-8 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
          {FEATURES.map(({ to, icon: Icon, title, text, cta }) => (
            <Card key={to} className="flex flex-col gap-3 p-5 md:p-6">
              <span className="flex size-11 items-center justify-center rounded-md bg-primary-soft text-primary-soft-foreground">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="text-h4 font-semibold text-foreground">{title}</h3>
              <p className="flex-1 text-base text-muted-foreground">{text}</p>
              <Link
                to={to}
                className="inline-flex min-h-11 items-center gap-1.5 text-base font-semibold text-primary hover:underline"
              >
                {cta}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
