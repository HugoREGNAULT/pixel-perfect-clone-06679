import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";

const emailSchema = z.string().trim().email("Email invalide").max(255);

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const res = await subscribeNewsletter({ data: { email: parsed.data } });
      if ("error" in res) throw new Error(res.error);
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="newsletter-cta" className="scroll-mt-20 bg-background py-12 md:py-20">
      <Container size="sm">
        <div className="rounded-lg border border-border bg-primary-soft p-6 text-center md:p-10">
          <SectionHeader
            align="center"
            title="Prêt à lancer ta carrière ?"
            description="Laisse ton e-mail, on te prévient au lancement."
          />
          {submitted ? (
            <p role="status" className="mt-6 rounded-md bg-success px-4 py-3 text-base font-semibold text-success-foreground">
              Merci, c'est noté !
            </p>
          ) : null}
          <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">Ton e-mail</label>
            <Input
              id="newsletter-email"
              type="email"
              placeholder="Ton e-mail étudiant"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Envoi…" : "Je m'inscris"}
            </Button>
          </form>
          <p className="mt-4 text-small text-muted-foreground">Pas de spam. Tu peux te désabonner à tout moment.</p>
        </div>
      </Container>
    </section>
  );
}
