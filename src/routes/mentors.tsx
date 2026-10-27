import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Users } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { subscribeNewsletter } from "@/lib/newsletter.functions";

export const Route = createFileRoute("/mentors")({
  head: () => ({
    meta: [
      { title: "Mentors | Springr" },
      { name: "description", content: "Les mentors Springr arrivent bientôt. Laisse ton e-mail pour être prévenu." },
    ],
  }),
  component: MentorsPage,
});

const emailSchema = z.string().trim().email("E-mail invalide").max(255);

function MentorsPage() {
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
      const res = await subscribeNewsletter({ data: { email: parsed.data, source: "mentors" } });
      if ("error" in res) throw new Error(res.error);
      setSubmitted(true);
      setEmail("");
      toast.success("Merci ! On te prévient dès que c'est prêt.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue, réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-background text-foreground">
      <AppNav />

      <PageShell size="sm">
        <div className="flex flex-col items-center gap-8 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground" aria-hidden="true">
            <Users className="size-7" />
          </span>
          <SectionHeader
            as="h1"
            align="center"
            eyebrow="Bientôt"
            title="Les mentors arrivent"
            description="Cette page n'est pas encore ouverte. Laisse ton e-mail : on te prévient quand elle le sera."
          />

          <Card className="w-full p-5 text-left sm:p-6">
            {submitted ? (
              <p role="status" className="font-semibold text-success-foreground">
                C'est noté. On te prévient dès que c'est prêt.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                <label htmlFor="mentors-email" className="block text-sm font-semibold">Ton e-mail</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    id="mentors-email"
                    type="email"
                    autoComplete="email"
                    placeholder="toi@exemple.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? "Envoi…" : "Préviens-moi"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Pas de spam, promis.</p>
              </form>
            )}
          </Card>

          <p className="text-muted-foreground">En attendant, il y a déjà de quoi explorer.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/opportunites" className={buttonVariants({ variant: "secondary" })}>Voir les offres</Link>
            <Link to="/ecoles" className={buttonVariants({ variant: "secondary" })}>Annuaire des écoles</Link>
          </div>
        </div>
      </PageShell>
    </div>
  );
}
