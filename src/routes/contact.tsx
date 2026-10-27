import { createFileRoute } from "@tanstack/react-router";
import { Mail, HelpCircle, Flag, Handshake } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { PageShell } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Springr" },
      { name: "description", content: "Contacte l'équipe Springr par e-mail." },
    ],
  }),
  component: ContactPage,
});

const EMAIL = "hello@springr.app";

const REASONS = [
  {
    icon: HelpCircle,
    title: "Une question",
    text: "Sur ton compte, une offre, une école ou le fonctionnement de Springr.",
    subject: "Question",
  },
  {
    icon: Flag,
    title: "Signaler un contenu",
    text: "Une offre, un avis ou un profil qui te semble inapproprié ou erroné. Indique le lien de la page.",
    subject: "Signalement d'un contenu",
  },
  {
    icon: Handshake,
    title: "Presse ou partenariat",
    text: "Tu représentes un média, une école, une entreprise ou une association ? Dis-nous ce que tu as en tête.",
    subject: "Presse / partenariat",
  },
] as const;

function ContactPage() {
  return (
    <div className="bg-background">
      <AppNav />
      <PageShell size="md">
        <SectionHeader
          as="h1"
          eyebrow="Une question ?"
          title="Contact"
          description="Écris-nous, on te répond par e-mail."
        />

        <div className="mt-8 flex flex-col items-start gap-3">
          <Button asChild size="lg">
            <a href={`mailto:${EMAIL}`}>
              <Mail /> {EMAIL}
            </a>
          </Button>
        </div>

        <h2 className="text-h3 font-semibold text-foreground mt-12 mb-4">Pourquoi nous écrire</h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {REASONS.map(({ icon: Icon, title, text, subject }) => (
            <li key={title}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-3 p-5 pt-5">
                  <span className="flex size-10 items-center justify-center rounded-md bg-primary-soft text-primary-soft-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-h4 font-semibold text-foreground">{title}</h3>
                  <p className="text-base text-muted-foreground">{text}</p>
                  <a
                    href={`mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`}
                    className="mt-auto inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Écrire un e-mail
                  </a>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </PageShell>
    </div>
  );
}
