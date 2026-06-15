import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DASHBOARD_ROUTE } from "@/lib/dashboard";
import { toast } from "sonner";
import { ArrowUpRight, Loader2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Connexion — Springr" }] }),
  component: LoginPage,
});

function Logo() {
  return (
    <Link to="/" className="font-display font-bold tracking-tight text-xl">
      sprin<span className="text-violet">g</span>
      <span className="text-lime">r</span>
      <span className="text-lime">.</span>
    </Link>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      const role = data.session.user.user_metadata?.role as string | undefined;
      const dest = (role && DASHBOARD_ROUTE[role]) ? DASHBOARD_ROUTE[role] : "/";
      navigate({ to: dest as any, replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Bon retour !");
      const role = authData.user?.user_metadata?.role as string | undefined;
      const dest = (role && DASHBOARD_ROUTE[role]) ? DASHBOARD_ROUTE[role] : "/";
      navigate({ to: dest as any, replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink text-white overflow-x-hidden">
      <div className="grid-bg absolute inset-0 opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-violet/20 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-md px-5 pt-8 pb-20">
        <div className="mb-10">
          <Logo />
        </div>

        <div className="mb-2">
          <span className="eyebrow">Bon retour</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-2">
          Reconnecte-toi.
        </h1>
        <p className="text-mute mb-10">
          Pas encore de compte ?{" "}
          <Link to="/signup" className="text-violet-soft hover:text-white transition-colors underline underline-offset-4">
            Inscris-toi
          </Link>
        </p>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@email.com"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm placeholder:text-mute/60 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Mot de passe
              </label>
              <a href="#" className="text-xs text-mute hover:text-white transition-colors">
                Mot de passe oublié ?
              </a>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 pr-12 text-sm placeholder:text-mute/60 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-mute hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group w-full inline-flex items-center justify-center gap-2 rounded-full bg-lime px-6 py-4 text-base font-semibold text-ink hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:cursor-not-allowed glow-lime"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                Se connecter
                <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" />
              </>
            )}
          </button>

          <div className="relative flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-mute">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <Link
            to="/signup"
            className="group w-full inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-4 text-base font-medium text-white hover:bg-white/5 hover:-translate-y-0.5 transition-all"
          >
            Créer un compte
          </Link>
        </form>
      </div>
    </div>
  );
}
