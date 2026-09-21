import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Lock, Mail, AlertCircle, Users2, Briefcase } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Accès Admin — Springr" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--color-admin-bg-light)' }}>
      {/* Header */}
      <header className="border-b-2 border-black bg-white sticky top-0">
        <div className="max-w-7xl mx-auto px-7 lg:px-28 h-20 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 border-2 border-black rounded-2xl flex items-center justify-center text-white font-bold text-lg drop-shadow-[3px_3px_0px_black]" style={{ backgroundColor: 'var(--color-admin-primary)' }}>
              U
            </div>
            <span className="font-bold text-2xl text-black tracking-tight">UpNest</span>
            <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-admin-bg-light-red)', color: 'var(--color-admin-red-dark)' }}>ADMIN</span>
          </Link>
          <Link to="/" className="text-foreground font-medium text-sm flex items-center gap-1">
            <span className="text-lg">←</span> Retour au site
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="relative py-12 lg:py-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
        {/* Background blur elements */}
        <div className="absolute top-1/2 right-0 w-64 h-64 blur-3xl opacity-70 rounded-full pointer-events-none" style={{ backgroundColor: 'var(--color-admin-highlight)' }} />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 blur-3xl opacity-70 rounded-full pointer-events-none" style={{ backgroundColor: 'var(--color-admin-primary)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 blur-3xl opacity-30 rounded-full pointer-events-none" style={{ backgroundColor: 'var(--color-admin-red)' }} />

        <div className="relative z-10 w-full max-w-md px-5">
          {/* Login Card */}
          <div className="bg-white border-2 border-black rounded-3xl p-8 lg:p-9 drop-shadow-[12px_12px_0px_black] relative mb-8">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-20 h-20 border-b-2 border-l-2 border-black rounded-bl-3xl" style={{ backgroundColor: 'var(--color-admin-highlight)' }} />

            {/* Lock Icon */}
            <div className="flex justify-center mb-8 relative pt-4">
              <div className="w-20 h-20 bg-black border-2 border-black rounded-4xl flex items-center justify-center drop-shadow-[4px_4px_0px_black]">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-black text-black text-center mb-2 tracking-tight">
              Accès Admin
            </h1>
            <p className="text-center text-gray-600 mb-8 text-base font-medium">
              Connectez-vous au panneau d'administration
            </p>

            {/* Form */}
            <form onSubmit={submit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="flex items-center gap-2 font-bold text-foreground text-sm mb-2">
                  <Mail className="w-3.5 h-3.5" />
                  Email administrateur
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@upnest.app"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-black rounded-2xl text-base font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0"
                  style={{ '--tw-ring-color': 'var(--color-admin-primary)' } as any}
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="flex items-center gap-2 font-bold text-foreground text-sm mb-2">
                  <Lock className="w-3.5 h-3.5" />
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-black rounded-2xl text-base font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0"
                    style={{ '--tw-ring-color': 'var(--color-admin-primary)' } as any}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 border border-gray-400 rounded cursor-pointer"
                  />
                  <span className="text-gray-700 font-medium">Rester connecté</span>
                </label>
                <Link to="/forgot-password" className="font-bold hover:underline" style={{ color: 'var(--color-admin-primary)' }}>
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full border-2 border-black text-white font-bold py-4 px-6 rounded-2xl disabled:opacity-70 drop-shadow-[4px_4px_0px_black] flex items-center justify-center gap-2 text-base"
                style={{
                  backgroundColor: 'var(--color-admin-primary)',
                  '--hover-bg': 'var(--color-admin-primary-hover)'
                } as any}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-admin-primary-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-admin-primary)'}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>🔐</span>}
                Se connecter
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 border-2 rounded-2xl" style={{ backgroundColor: 'var(--color-admin-bg-light-yellow)', borderColor: 'var(--color-admin-yellow-bright)' }}>
              <div className="flex gap-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-admin-yellow-text)' }} />
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--color-admin-yellow-text)' }}>Accès sécurisé</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-badge-yellow-text)' }}>
                    Cet espace est réservé aux administrateurs autorisés.<br/>
                    Toutes les connexions sont enregistrées.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-2 border-black rounded-2xl p-4 drop-shadow-[4px_4px_0px_black]">
              <div className="w-8 h-8 border border-black rounded-2xl flex items-center justify-center mb-4 mx-auto" style={{ backgroundColor: 'var(--color-admin-success)' }}>
                <Users2 className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-black text-center">1,247</p>
              <p className="text-xs text-gray-600 text-center mt-1">Utilisateurs actifs</p>
            </div>
            <div className="bg-white border-2 border-black rounded-2xl p-4 drop-shadow-[4px_4px_0px_black]">
              <div className="w-8 h-8 border border-black rounded-2xl flex items-center justify-center mb-4 mx-auto" style={{ backgroundColor: 'var(--color-admin-red)' }}>
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-black text-center">89</p>
              <p className="text-xs text-gray-600 text-center mt-1">Offres en ligne</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-black bg-black text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-7 lg:px-28 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2025 UpNest Admin Panel. Tous droits réservés.</p>
            <div className="flex gap-6 items-center text-sm">
              <a href="#" className="hover:text-white transition-colors">Support technique</a>
              <a href="#" className="hover:text-white transition-colors">Documentation API</a>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-admin-green-bright)' }}></span>
                <span>Système opérationnel</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
