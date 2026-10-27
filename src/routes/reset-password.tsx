import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell, AuthCard, AuthHeading, Field, PasswordInput, authLink } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Nouveau mot de passe — Springr" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [ready, setReady]       = useState(false);

  useEffect(() => {
    // Supabase reads the access_token from the URL fragment automatically.
    // The PASSWORD_RECOVERY event fires once the session is established.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      toast.error("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => navigate({ to: "/login", replace: true }), 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  }

  const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
  const score   = checks.filter(Boolean).length;

  const barColor = ["", "bg-destructive", "bg-warning-foreground", "bg-success-foreground", "bg-success-foreground"] as const;
  const mismatch = confirm.length > 0 && password !== confirm;

  return (
    <AuthShell>
      {done ? (
        <AuthCard className="text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-success text-success-foreground">
            <Check className="size-7" aria-hidden="true" />
          </div>
          <h1 className="text-h2 font-bold text-foreground mb-3">Mot de passe mis à jour !</h1>
          <p className="text-base text-muted-foreground">Redirection vers la connexion dans quelques secondes…</p>
          <Link to="/login" className={`${authLink} mt-2`}>Aller à la connexion</Link>
        </AuthCard>
      ) : !ready ? (
        <AuthCard className="text-center">
          <h1 className="text-h2 font-bold text-foreground mb-3">Vérification du lien…</h1>
          <Loader2 className="size-8 text-muted-foreground animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Ce lien n'est valable qu'une seule fois et expire après 1 heure.
          </p>
          <Link to="/forgot-password" className={`${authLink} mt-2`}>
            Redemander un lien
          </Link>
        </AuthCard>
      ) : (
        <>
          <AuthHeading
            eyebrow="Sécurité"
            title="Nouveau mot de passe"
            description="Choisis un mot de passe solide d'au moins 8 caractères."
          />
          <AuthCard>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field id="password" label="Nouveau mot de passe">
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 caractères minimum"
                  minLength={8}
                  required
                  autoComplete="new-password"
                  show={show}
                  onToggle={() => setShow(!show)}
                />
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i < score ? barColor[score] : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(["", "Faible", "Moyen", "Bon", "Fort"] as const)[score]}
                    </p>
                  </div>
                )}
              </Field>

              <Field id="confirm" label="Confirmer">
                <Input
                  id="confirm"
                  type={show ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Répète ton mot de passe"
                  required
                  autoComplete="new-password"
                  invalid={mismatch}
                />
                {mismatch && (
                  <p className="text-sm text-destructive mt-1.5" role="alert">
                    Les mots de passe ne correspondent pas.
                  </p>
                )}
              </Field>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading || !password || !confirm || password !== confirm}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Check />}
                {loading ? "Mise à jour…" : "Mettre à jour le mot de passe"}
              </Button>
            </form>
          </AuthCard>
        </>
      )}
    </AuthShell>
  );
}
