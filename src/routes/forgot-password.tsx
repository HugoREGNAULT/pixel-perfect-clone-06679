import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell, AuthCard, AuthHeading, Field, authLink } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Mot de passe oublié — Springr" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      {sent ? (
        <AuthCard className="text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-success text-success-foreground">
            <Check className="size-7" aria-hidden="true" />
          </div>
          <h1 className="text-h2 font-bold text-foreground mb-3">Vérifie tes mails</h1>
          <p className="text-base text-muted-foreground">
            Un lien de réinitialisation a été envoyé à{" "}
            <strong className="text-foreground break-all">{email}</strong>.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">Le lien est valable 1 heure.</p>
          <Button variant="secondary" className="mt-6 w-full" onClick={() => setSent(false)}>
            Renvoyer le lien
          </Button>
        </AuthCard>
      ) : (
        <>
          <AuthHeading
            eyebrow="Réinitialisation"
            title="Mot de passe oublié ?"
            description="Saisis ton adresse e-mail, on t'envoie un lien pour créer un nouveau mot de passe."
          />
          <AuthCard>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field id="email" label="Adresse e-mail">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton@email.com"
                  required
                  autoComplete="email"
                />
              </Field>
              <Button type="submit" size="lg" disabled={loading || !email.trim()} className="w-full">
                {loading ? <Loader2 className="animate-spin" /> : <Mail />}
                {loading ? "Envoi…" : "Envoyer le lien"}
              </Button>
            </form>
          </AuthCard>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Tu t'en souviens finalement ?{" "}
            <Link to="/login" className={authLink}>
              Se connecter
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
