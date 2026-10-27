import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DASHBOARD_ROUTE } from "@/lib/dashboard";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AuthShell,
  AuthCard,
  AuthHeading,
  Field,
  PasswordInput,
  authLink,
} from "@/components/auth/AuthShell";
import { safeRedirect } from "@/lib/safe-redirect";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Connexion — Springr" }] }),
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const r = safeRedirect(search.redirect);
    return r ? { redirect: r } : {};
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function destination(role: string | undefined) {
    if (redirect) return redirect;
    return role && DASHBOARD_ROUTE[role] ? DASHBOARD_ROUTE[role] : "/";
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      const role = data.session.user.user_metadata?.role as string | undefined;
      navigate({ to: destination(role) as any, replace: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Bon retour !");
      const role = authData.user?.user_metadata?.role as string | undefined;
      navigate({ to: destination(role) as any, replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <AuthHeading title="Connexion" description="Content de te revoir." />
      <AuthCard>
        <form onSubmit={submit} className="space-y-5">
          <Field id="email" label="E-mail">
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
            />
          </Field>

          <Field id="password" label="Mot de passe">
            <PasswordInput
              id="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              show={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
            />
            <Link to="/forgot-password" className={`${authLink} mt-1 text-sm`}>
              Mot de passe oublié ?
            </Link>
          </Field>

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? <Loader2 className="animate-spin" aria-label="Connexion en cours" /> : "Se connecter"}
          </Button>
        </form>
      </AuthCard>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link to="/signup" search={redirect ? { redirect } : undefined} className={authLink}>
          Créer un compte
        </Link>
      </p>
    </AuthShell>
  );
}
