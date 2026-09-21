// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppNav } from "@/components/AppNav";
import { SiteFooter } from "@/components/SiteFooter";
import {
  ExternalLink,
  Loader2,
  MessageCircle,
  Activity,
  Tag,
  Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/communaute")({
  head: () => ({
    meta: [
      { title: "Communauté Springr — Bons Plans & JPO" },
      {
        name: "description",
        content:
          "Rejoignez la communauté Springr. Découvrez les bons plans, les JPO et connectez-vous avec d'autres étudiants.",
      },
    ],
  }),
  component: CommunautePage,
});

type BonPlan = Tables<"bons_plans">;
type JpoSubmission = Tables<"jpo_submissions">;

function CommunautePage() {
  const [bonPlans, setBonPlans] = useState<BonPlan[]>([]);
  const [jpos, setJpos] = useState<JpoSubmission[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingJpos, setLoadingJpos] = useState(true);

  useEffect(() => {
    // Fetch approved bons plans
    supabase
      .from("bons_plans")
      .select("*")
      .eq("actif", true)
      .order("ordre_affichage")
      .then(({ data, error }) => {
        if (!error && data) setBonPlans((data as BonPlan[]).slice(0, 6));
        setLoadingPlans(false);
      });

    // Fetch approved JPOs
    supabase
      .from("jpo_submissions")
      .select("*")
      .eq("status", "approved")
      .order("date_jpo", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setJpos((data as JpoSubmission[]).slice(0, 6));
        setLoadingJpos(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col">
      <AppNav />

      <main className="flex-1 mx-auto max-w-6xl px-5 py-10 w-full">
        {/* ── Hero Section ──────────────────────────────────────────────────*/}
        <div className="mb-16">
          <div className="eyebrow mb-3">Connectez-vous · Partagez · Prograssez</div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] mb-4">
            Communauté Springr
          </h1>
          <p className="text-mute text-lg max-w-2xl">
            Rejoignez une communauté bienveillante de jeunes talents. Accédez à des ressources
            exclusives, bons plans et événements.
          </p>
        </div>

        {/* ── Bons Plans Section ────────────────────────────────────────────*/}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Tag className="size-6 text-lime" />
            <h2 className="font-display text-3xl font-bold">Bons Plans</h2>
          </div>

          {loadingPlans ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-8 animate-spin text-mute" />
            </div>
          ) : bonPlans.length === 0 ? (
            <div className="text-center py-12 text-mute">Pas de bons plans disponibles</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bonPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-white/20 transition-all"
                >
                  {/* Badge */}
                  {plan.badge_texte && (
                    <div
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide mb-4 ${
                        plan.badge_couleur === "lime"
                          ? "bg-lime text-ink"
                          : plan.badge_couleur === "amber"
                            ? "bg-amber-400 text-ink"
                            : plan.badge_couleur === "violet"
                              ? "bg-violet text-white"
                              : "bg-blue-500 text-white"
                      }`}
                    >
                      {plan.badge_texte}
                    </div>
                  )}

                  {/* Content */}
                  <h3 className="font-display text-xl font-bold mb-2 line-clamp-2">
                    {plan.titre}
                  </h3>
                  {plan.description && (
                    <p className="text-mute text-sm mb-4 line-clamp-2">{plan.description}</p>
                  )}

                  {/* Code or General Discount */}
                  {plan.code_promo && (
                    <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs text-mute mb-1">Code promo</p>
                      <p className="font-mono font-bold text-white">{plan.code_promo}</p>
                    </div>
                  )}

                  {/* CTA */}
                  {plan.lien_url && (
                    <a
                      href={plan.lien_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-lime hover:text-lime/80 transition-colors"
                    >
                      Découvrir
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── JPO Section ───────────────────────────────────────────────────*/}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="size-6 text-lime" />
            <h2 className="font-display text-3xl font-bold">Journées Portes Ouvertes</h2>
          </div>

          {loadingJpos ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-8 animate-spin text-mute" />
            </div>
          ) : jpos.length === 0 ? (
            <div className="text-center py-12 text-mute">Pas de JPO disponibles</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jpos.map((jpo) => (
                <div
                  key={jpo.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-white/20 transition-all"
                >
                  {/* Date */}
                  <div className="mb-4">
                    <p className="text-xs text-mute uppercase tracking-wide mb-1">Date</p>
                    <p className="font-display text-2xl font-bold text-lime">
                      {new Date(jpo.date_jpo).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* School */}
                  <h3 className="font-display text-xl font-bold mb-2 line-clamp-2">
                    {jpo.nom_ecole}
                  </h3>

                  {/* Description */}
                  {jpo.description && (
                    <p className="text-mute text-sm mb-4 line-clamp-3">{jpo.description}</p>
                  )}

                  {/* Link */}
                  {jpo.lien && (
                    <a
                      href={jpo.lien}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-lime hover:text-lime/80 transition-colors"
                    >
                      Accéder
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Forum Section (Coming Soon) ───────────────────────────────────*/}
        <section className="mb-16 opacity-60 pointer-events-none">
          <div className="flex items-center gap-3 mb-8">
            <MessageCircle className="size-6 text-mute" />
            <h2 className="font-display text-3xl font-bold">Forum & Discussions</h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <MessageCircle className="size-12 text-mute/40 mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold mb-2">Bientôt disponible</h3>
            <p className="text-mute max-w-sm mx-auto">
              Un espace pour échanger avec la communauté et poser vos questions aux mentors.
            </p>
          </div>
        </section>

        {/* ── Activity Section (Coming Soon) ────────────────────────────────*/}
        <section className="mb-16 opacity-60 pointer-events-none">
          <div className="flex items-center gap-3 mb-8">
            <Activity className="size-6 text-mute" />
            <h2 className="font-display text-3xl font-bold">Activité Récente</h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <Activity className="size-12 text-mute/40 mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold mb-2">Bientôt disponible</h3>
            <p className="text-mute max-w-sm mx-auto">
              Découvrez ce que font les autres membres de la communauté.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
