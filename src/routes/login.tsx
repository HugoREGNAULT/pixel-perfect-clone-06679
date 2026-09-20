import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DASHBOARD_ROUTE } from "@/lib/dashboard";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Connexion — Springr" }] }),
  component: LoginPage,
});

function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2">
      <div className="w-10 h-10 bg-[#0066ff] border-2 border-black rounded-2xl flex items-center justify-center text-white font-bold text-lg drop-shadow-[2px_2px_0px_black]">
        S
      </div>
      <span className="font-bold text-xl text-[#111827]">Springr</span>
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
    <div className="min-h-screen bg-gradient-to-br from-[#f9fafb] via-white to-[#f9fafb] overflow-x-hidden">
      {/* Background blurs */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-[#fdcb58] blur-3xl opacity-30 rounded-full pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-[#0066ff] blur-3xl opacity-30 rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 border-b-2 border-black bg-white sticky top-0">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-20 flex items-center justify-between">
          <Logo />
          <Link to="/" className="text-[#111827] font-medium text-sm">
            Retour à l'accueil
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-5 max-w-6xl mx-auto px-5 lg:px-8 py-12 lg:py-20">
        <div className="max-w-md mx-auto">
          {/* Heading */}
          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#111827] mb-4">
              Connexion
            </h1>
            <p className="text-[#4b5563] text-lg">
              Bon retour parmi nous !
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border-2 border-black rounded-3xl p-8 lg:p-10 drop-shadow-[8px_8px_0px_black]">
            <form onSubmit={submit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block font-bold text-[#111827] text-sm mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full bg-white border-2 border-[#d1d5db] rounded-2xl px-5 py-4 text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#0066ff] transition-colors"
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block font-bold text-[#111827] text-sm">
                    Mot de passe
                  </label>
                  <Link to="/forgot-password" className="text-[#0066ff] font-bold text-sm">
                    Mot de passe oublié ?
                  </Link>
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
                    className="w-full bg-white border-2 border-[#d1d5db] rounded-2xl px-5 py-4 pr-12 text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#0066ff] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4b5563] hover:text-[#111827] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me & forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border border-[#767676] rounded cursor-pointer"
                  />
                  <span className="text-sm text-[#4b5563]">Se souvenir de moi</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00d084] border-2 border-black text-white font-bold text-lg py-4 rounded-3xl drop-shadow-[4px_4px_0px_black] hover:translate-y-[-2px] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Se connecter"
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center gap-4 py-2">
                <div className="flex-1 h-0.5 bg-[#d1d5db]" />
                <span className="text-sm font-bold text-[#6b7280]">OU</span>
                <div className="flex-1 h-0.5 bg-[#d1d5db]" />
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => toast.info("OAuth non configuré")}
                  className="w-full border-2 border-[#d1d5db] rounded-2xl px-5 py-3 font-bold text-[#111827] hover:bg-[#f3f4f6] transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuer avec Google
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("OAuth non configuré")}
                  className="w-full border-2 border-[#d1d5db] rounded-2xl px-5 py-3 font-bold text-[#111827] hover:bg-[#f3f4f6] transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                  </svg>
                  Continuer avec LinkedIn
                </button>
              </div>

              {/* Sign up link */}
              <div className="text-center text-sm text-[#4b5563]">
                Pas encore de compte ?{" "}
                <Link to="/signup" className="text-[#0066ff] font-bold hover:underline">
                  Créer un compte
                </Link>
              </div>
            </form>
          </div>

          {/* Trust badges */}
          <div className="mt-12 bg-white border-2 border-black rounded-3xl p-6 drop-shadow-[6px_6px_0px_black] flex flex-wrap gap-6 lg:gap-8 items-center justify-center text-center">
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6 text-[#111827]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-bold text-sm text-[#111827]">Données sécurisées</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6 text-[#111827]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold text-sm text-[#111827]">100% gratuit</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6 text-[#111827]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-bold text-sm text-[#111827]">+10k membres</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
