import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Briefcase, Check, Gift, GraduationCap, Loader2, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { FounderCheckoutDialog } from "@/components/FounderCheckoutDialog";
import { AppNav } from "@/components/AppNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";

export const Route = createFileRoute("/lancement")({
  head: () => ({
    meta: [
      { title: "Lancement — Springr — Le réseau pro des étudiants" },
      {
        name: "description",
        content:
          "Rejoins Springr avant le lancement officiel. Accès anticipé, newsletter exclusive et avantages Founder.",
      },
    ],
  }),
  component: LaunchPage,
});

const emailSchema = z.string().trim().email("Email invalide").max(255);

const FOUNDER_BENEFITS = [
  "Badge Founder à vie",
  "Accès anticipé aux features",
  "Prix bloqué garanti",
  "Support communauté exclusif",
] as const;

const WHAT = [
  { icon: Briefcase, title: "Opportunités", text: "Des offres de stage, d'alternance et d'emploi pensées pour les 15-29 ans." },
  { icon: Gift, title: "Bons plans", text: "Des réductions et avantages réunis pour les étudiants." },
  { icon: GraduationCap, title: "Écoles", text: "Un annuaire pour comparer les écoles et repérer leurs journées portes ouvertes." },
] as const;

function LaunchPage() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [founderOpen, setFounderOpen] = useState(false);

  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(newsletterEmail);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setNewsletterLoading(true);
    try {
      const res = await subscribeNewsletter({ data: { email: parsed.data } });
      if ("error" in res) throw new Error(res.error);
      setNewsletterSubmitted(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterSubmitted(false), 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setNewsletterLoading(false);
    }
  }

  return (
    <>
      <div className="min-h-screen overflow-x-clip bg-background text-foreground">
        <AppNav />

        <main id="main">
          <section className="border-b border-border">
            <Container size="md" className="space-y-6 py-12 text-center md:py-20">
              <Badge variant="secondary">Pré-lancement · Accès limité</Badge>
              <h1 className="text-display font-bold text-foreground">Découvre Springr en avant-première</h1>
              <p className="mx-auto max-w-2xl text-body-lg text-muted-foreground">
                Sois parmi les premiers à accéder au réseau pro pensé par et pour la nouvelle génération.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" onClick={() => document.getElementById("newsletter-section")?.scrollIntoView({ behavior: "smooth" })}>
                  <Mail aria-hidden />
                  Newsletter
                </Button>
                <Button size="lg" variant="secondary" onClick={() => setFounderOpen(true)}>
                  <Sparkles aria-hidden />
                  Founder Member
                </Button>
              </div>
            </Container>
          </section>

          <section id="newsletter-section" className="scroll-mt-20 bg-muted py-12 md:py-20">
            <Container size="sm">
              <SectionHeader
                align="center"
                title="Reste informé du lancement"
                description="Reçois les mises à jour et les bons plans en avant-première."
              />
              {newsletterSubmitted ? (
                <p role="status" className="mt-6 rounded-md bg-success px-4 py-3 text-center text-base font-semibold text-success-foreground">
                  Merci, c'est noté !
                </p>
              ) : null}
              <form onSubmit={handleNewsletterSubmit} className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
                <label htmlFor="launch-email" className="sr-only">Ton e-mail</label>
                <Input
                  id="launch-email"
                  type="email"
                  placeholder="Ton e-mail étudiant"
                  autoComplete="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  disabled={newsletterLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={newsletterLoading}>
                  {newsletterLoading ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden />
                      Inscription…
                    </>
                  ) : (
                    "Je m'inscris"
                  )}
                </Button>
              </form>
              <p className="mt-4 text-center text-small text-muted-foreground">
                Pas de spam. Tu peux te désabonner à tout moment.
              </p>
            </Container>
          </section>

          <section className="py-12 md:py-20">
            <Container size="md">
              <SectionHeader align="center" title="Qui est Springr ?" />
              <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
                {WHAT.map(({ icon: Icon, title, text }) => (
                  <Card key={title} className="flex flex-col gap-3 p-5 md:p-6">
                    <span className="flex size-11 items-center justify-center rounded-md bg-primary-soft text-primary-soft-foreground">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="text-h4 font-semibold text-foreground">{title}</h3>
                    <p className="text-base text-muted-foreground">{text}</p>
                  </Card>
                ))}
              </div>
            </Container>
          </section>

          <section className="border-t border-border bg-muted py-12 md:py-20">
            <Container size="sm">
              <SectionHeader
                align="center"
                title="Devenir Founder Member"
                description="Soutiens Springr dès le départ et bénéficie d'avantages exclusifs à vie."
              />
              <Card className="mx-auto mt-8 max-w-md p-6 md:p-8">
                <p className="mb-6 text-center font-display text-h2 font-bold text-foreground">
                  4,99 € <span className="text-small font-medium text-muted-foreground">paiement unique</span>
                </p>
                <ul className="mb-8 space-y-3">
                  {FOUNDER_BENEFITS.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-base text-foreground">
                      <Check className="mt-1 size-4 shrink-0 text-success-foreground" aria-hidden />
                      {b}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" size="lg" onClick={() => setFounderOpen(true)}>
                  <Sparkles aria-hidden />
                  Devenir Founder
                </Button>
              </Card>
            </Container>
          </section>

          <section className="py-12 text-center md:py-16">
            <Container size="sm" className="space-y-3">
              <p className="text-base text-muted-foreground">Une question ?</p>
              <Link to="/contact" className="inline-flex min-h-11 items-center text-h4 font-semibold text-primary hover:underline">
                Contacte-nous
              </Link>
            </Container>
          </section>
        </main>
      </div>

      <FounderCheckoutDialog open={founderOpen} onOpenChange={setFounderOpen} />
    </>
  );
}
