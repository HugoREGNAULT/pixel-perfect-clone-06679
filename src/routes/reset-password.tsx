import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Loader2, Check, Lock } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-ink/80 border-b border-white/5">
        <div className="mx-auto max-w-lg px-5 h-14 flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-mute hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" /> Connexion
          </Link>
          <span className="font-display font-bold tracking-tight">
            sprin<span className="text-violet">g</span><span className="text-lime">r.</span>
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          {done ? (
            <div className="text-center animate-in fade-in duration-300">
              <div className="size-16 rounded-2xl bg-lime/15 border border-lime/30 flex items-center justify-center mx-auto mb-6">
                <Check className="size-8 text-lime" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-3">Mot de passe mis à jour !</h1>
              <p className="text-mute text-sm">Redirection vers la connexion dans quelques secondes…</p>
            </div>
          ) : !ready ? (
            <div className="text-center">
              <Loader2 className="size-8 text-mute animate-spin mx-auto mb-4" />
              <p className="text-mute text-sm">Vérification du lien…</p>
              <p className="text-xs text-mute/60 mt-2">
                Ce lien n'est valable qu'une seule fois et expire après 1 heure.
              </p>
              <Link
                to="/forgot-password"
                className="mt-4 inline-flex text-lime text-sm hover:underline"
              >
                Redemander un lien
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="eyebrow mb-3">Sécurité</div>
                <h1 className="font-display text-3xl font-bold mb-3">Nouveau mot de passe</h1>
                <p className="text-mute text-sm">Choisis un mot de passe solide d'au moins 8 caractères.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-mute pointer-events-none" />
                    <input
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="8 caractères minimum"
                      minLength={8}
                      required
                      autoFocus
                      autoComplete="new-password"
                      className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-12 py-3.5 text-sm placeholder:text-mute/50 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-mute hover:text-white transition-colors"
                    >
                      {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i < score
                                ? (["", "bg-red-500", "bg-yellow-400", "bg-lime/80", "bg-lime"] as const)[score]
                                : "bg-white/10"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-mute mt-1">
                        {(["", "Faible", "Moyen", "Bon", "Fort"] as const)[score]}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-2">
                    Confirmer
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-mute pointer-events-none" />
                    <input
                      type={show ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Répète ton mot de passe"
                      required
                      autoComplete="new-password"
                      className={`w-full rounded-xl bg-white/5 border pl-10 pr-4 py-3.5 text-sm placeholder:text-mute/50 focus:outline-none focus:bg-white/[0.07] transition-colors ${
                        confirm && password !== confirm
                          ? "border-red-500/50 focus:border-red-500/70"
                          : "border-white/10 focus:border-violet/60"
                      }`}
                    />
                  </div>
                  {confirm && password !== confirm && (
                    <p className="text-xs text-red-400 mt-1">Les mots de passe ne correspondent pas.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirm || password !== confirm}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-lime py-3.5 text-sm font-semibold text-ink hover:-translate-y-0.5 hover:shadow-[0_0_24px_-4px_rgba(181,255,61,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  {loading ? "Mise à jour…" : "Mettre à jour le mot de passe"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
