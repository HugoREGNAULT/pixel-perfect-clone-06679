import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lookupCode } from "@/lib/referral";
import { Gift, Star, Zap, Users, ArrowUpRight, Loader2, AlertCircle, CheckCircle2, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/invite/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Tu es invité sur Springr par un ami !` },
      { name: "description", content: "Crée ton compte Springr et reçois 7 jours de Premium offerts." },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { code } = Route.useParams();
  const [referrerName, setName] = useState("");
  const [loading, setLoading]   = useState(true);
  const [valid, setValid]       = useState(false);

  useEffect(() => {
    lookupCode(code).then(result => {
      if (result) {
        setName(result.first_name || "un ami");
        setValid(true);
      }
      setLoading(false);
    });
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <Loader2 className="size-6 text-mute animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col">
      {/* Simple nav */}
      <nav className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <Link to="/" className="font-display font-bold text-xl">
          Spring<span className="text-lime">r</span>
        </Link>
        <Link to="/login" className="text-sm text-mute hover:text-white transition-colors">Connexion</Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {!valid ? (
            /* Invalid code */
            <div className="text-center">
              <div className="size-16 rounded-2xl bg-red-400/10 border border-red-400/20 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="size-8 text-red-400" />
              </div>
              <h1 className="font-display font-bold text-2xl mb-3">Lien invalide</h1>
              <p className="text-mute mb-8">Ce code de parrainage n'existe pas ou a expiré.</p>
              <Link to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-lime text-ink px-8 py-3.5 font-semibold hover:-translate-y-0.5 transition-transform">
                Rejoindre Springr <ArrowUpRight className="size-4" />
              </Link>
            </div>
          ) : (
            /* Valid invite */
            <div>
              {/* Referrer avatar */}
              <div className="text-center mb-8">
                <div className="relative inline-flex">
                  <div className="size-20 rounded-2xl bg-gradient-to-br from-violet to-lime/50 flex items-center justify-center font-display font-bold text-3xl text-ink">
                    {referrerName[0]?.toUpperCase() ?? "S"}
                  </div>
                  <div className="absolute -bottom-2 -right-2 size-8 rounded-xl bg-lime flex items-center justify-center">
                    <Gift className="size-4 text-ink" />
                  </div>
                </div>
                <p className="text-mute text-sm mt-4">Tu as été invité par</p>
                <p className="font-display font-bold text-2xl text-white mt-1">{referrerName}</p>
              </div>

              {/* Offer card */}
              <div className="rounded-3xl border border-lime/25 bg-lime/8 p-6 mb-6 text-center">
                <p className="text-xs font-mono uppercase tracking-wider text-lime mb-2">Offre exclusive</p>
                <p className="font-display font-bold text-4xl text-white mb-1">7 jours</p>
                <p className="text-lg text-lime font-semibold mb-3">de Premium offerts</p>
                <p className="text-sm text-mute">Uniquement en t'inscrivant via ce lien.</p>
              </div>

              {/* Benefits */}
              <div className="space-y-3 mb-8">
                {[
                  { icon: Zap,           text: "Accès à toutes les offres en avant-première" },
                  { icon: Star,          text: "Profil mis en avant auprès des recruteurs" },
                  { icon: Users,         text: "Accès aux mentors Premium" },
                  { icon: GraduationCap, text: "JPO et événements exclusifs" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="size-7 rounded-lg bg-violet/15 border border-violet/25 flex items-center justify-center shrink-0">
                      <Icon className="size-3.5 text-violet-soft" />
                    </div>
                    <p className="text-sm text-mute">{text}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                to={`/signup?ref=${encodeURIComponent(code)}` as any}
                className="block w-full text-center rounded-2xl bg-lime text-ink px-6 py-4 font-display font-bold text-lg hover:-translate-y-0.5 transition-transform glow-lime"
              >
                Rejoindre Springr gratuitement
              </Link>
              <p className="text-xs text-mute text-center mt-3 flex items-center justify-center gap-1">
                <CheckCircle2 className="size-3 text-lime" />
                7 jours Premium activés automatiquement à l'inscription
              </p>

              {/* Code badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-mute">
                <span>Code :</span>
                <span className="font-mono font-bold text-violet-soft border border-violet/25 rounded-full px-2.5 py-0.5 bg-violet/10">{code.toUpperCase()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
