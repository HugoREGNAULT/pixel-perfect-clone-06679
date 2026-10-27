import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, CalendarDays, LayoutDashboard, MessageSquareText } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";

export const Route = createFileRoute("/pour-les-ecoles")({
  head: () => ({
    meta: [
      { title: "Pour les écoles — Springr" },
      {
        name: "description",
        content:
          "Écoles et universités : présente ton établissement aux lycéens et étudiants, fais connaître tes portes ouvertes et lis les avis de tes étudiants.",
      },
    ],
  }),
  component: PourLesEcolesPage,
});

const SIGNUP_SCHOOL = "/signup?role=ecole";

/** Uniquement ce qui existe dans le produit : fiche annuaire, JPO, avis, espace école. */
const BENEFITS = [
  {
    icon: BookOpen,
    title: "Une fiche dans l'annuaire",
    desc: "Les lycéens et étudiants découvrent ton établissement dans l'annuaire des écoles. La fiche école est gratuite.",
  },
  {
    icon: CalendarDays,
    title: "Tes portes ouvertes visibles",
    desc: "Les journées portes ouvertes apparaissent sur la fiche de l'école et dans la page Événements.",
  },
  {
    icon: MessageSquareText,
    title: "Les avis de tes étudiants",
    desc: "Les étudiants notent leur école par critère et laissent un avis. Les avis sont publics sur la fiche de l'école.",
  },
  {
    icon: LayoutDashboard,
    title: "Un espace école",
    desc: "Un tableau de bord avec des raccourcis vers les événements, les offres, les mentors et les recruteurs.",
  },
];

function PourLesEcolesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />

      <main id="main" className="flex-1">
        <Container size="md" className="py-14 text-center md:py-20">
          <p className="eyebrow text-primary">Pour les écoles</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-display font-bold text-foreground">
            Fais connaître ton école aux 15-29 ans
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-body-lg text-muted-foreground">
            Springr est un réseau pour les lycéens, étudiants et jeunes diplômés. Les écoles y ont une place : une
            fiche dans l'annuaire, des portes ouvertes et les avis de leurs étudiants.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <a href={SIGNUP_SCHOOL}>
                Créer un compte école
                <ArrowUpRight aria-hidden />
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/ecoles">Voir l'annuaire des écoles</Link>
            </Button>
          </div>
        </Container>

        <section className="border-y border-border bg-muted py-12 md:py-16">
          <Container size="md">
            <SectionHeader title="Ce que Springr t'apporte" align="center" />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {BENEFITS.map(({ icon: Icon, title, desc }) => (
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

        <Container size="sm" className="py-12 md:py-16">
          <SectionHeader
            title="Pas la même chose que l'annuaire"
            description="L'annuaire des écoles s'adresse aux lycéens et étudiants qui comparent des établissements. Cette page s'adresse à toi, côté école : tu crées un compte pour avoir ton espace sur Springr."
          />
          <p className="mt-4 text-base text-muted-foreground">
            Une question avant de te lancer, ou ton école n'apparaît pas encore dans l'annuaire ? Écris-nous depuis la
            page Contact.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href={SIGNUP_SCHOOL}>
                Créer un compte école
                <ArrowUpRight aria-hidden />
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/contact">Nous contacter</Link>
            </Button>
          </div>
        </Container>
      </main>
    </div>
  );
}
