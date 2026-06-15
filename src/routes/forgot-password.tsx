import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Mail, Loader2, Check } from "lucide-react";

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
    <div className="min-h-screen bg-ink text-white flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-ink/80 border-b border-white/5">
        <div className="mx-auto max-w-lg px-5 h-14 flex items-center justify-between">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-mute hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" /> Retour à la connexion
          </Link>
          <span className="font-display font-bold tracking-tight">
            sprin<span className="text-violet">g</span><span className="text-lime">r.</span>
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          {sent ? (
            <div className="text-center animate-in fade-in duration-300">
              <div className="size-16 rounded-2xl bg-lime/15 border border-lime/30 flex items-center justify-center mx-auto mb-6">
                <Check className="size-8 text-lime" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-3">Vérifie tes mails</h1>
              <p className="text-mute text-sm leading-relaxed mb-6">
                Un lien de réinitialisation a été envoyé à{" "}
                <strong className="text-white">{email}</strong>.<br />
                Le lien est valable 1 heure.
              </p>
              <p className="text-xs text-mute">
                Pas reçu ?{" "}
                <button
                  onClick={() => setSent(false)}
                  className="text-lime hover:underline"
                >
                  Renvoyer
                </button>
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="eyebrow mb-3">Réinitialisation</div>
                <h1 className="font-display text-3xl font-bold mb-3">Mot de passe oublié ?</h1>
                <p className="text-mute text-sm leading-relaxed">
                  Saisis ton adresse email et on t'envoie un lien pour créer un nouveau mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-mute pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="toi@email.com"
                      required
                      autoFocus
                      autoComplete="email"
                      className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3.5 text-sm placeholder:text-mute/50 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-lime py-3.5 text-sm font-semibold text-ink hover:-translate-y-0.5 hover:shadow-[0_0_24px_-4px_rgba(181,255,61,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
                  {loading ? "Envoi…" : "Envoyer le lien"}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-mute">
                Tu t'en souviens finalement ?{" "}
                <Link to="/login" className="text-lime hover:underline">
                  Se connecter
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
