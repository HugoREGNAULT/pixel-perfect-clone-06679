import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell, AuthCard, AuthHeading, Field, PasswordInput, authLink } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({ meta: [{ title: "Accès Admin — Springr" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      navigate({ to: "/admin" as any, replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check if user is admin
      const db = supabase as any;
      const { data: profile } = await db
        .from("profiles")
        .select("role")
        .eq("id", authData.user?.id)
        .single();

      if (!profile || profile.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Accès administrateur refusé");
      }

      toast.success("Connexion réussie !");
      navigate({ to: "/admin" as any, replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <AuthHeading
        eyebrow="Administration"
        title="Accès admin"
        description="Connecte-toi au panneau d'administration."
      />
      <AuthCard>
        <form onSubmit={submit} className="space-y-5">
          <Field id="email" label="E-mail administrateur">
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? <Loader2 className="animate-spin" aria-label="Connexion en cours" /> : <Lock />}
            Se connecter
          </Button>
        </form>

        <p className="mt-6 flex gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Cet espace est réservé aux administrateurs autorisés.
        </p>
      </AuthCard>
    </AuthShell>
  );
}
