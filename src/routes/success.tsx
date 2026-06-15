import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/success")({
  validateSearch: (s: Record<string, unknown>) => ({
    session_id: typeof s.session_id === "string" ? s.session_id : undefined,
    plan: typeof s.plan === "string" ? s.plan : undefined,
  }),
  head: () => ({ meta: [{ title: "Paiement réussi — Springr" }] }),
  component: SuccessPage,
});

const PLAN_LABELS: Record<string, string> = {
  student_premium:      "Premium Étudiant",
  student_premium_plus: "Premium+ Étudiant",
  company_starter:      "Starter Recruteur",
  company_pro:          "Pro Illimité",
};

function SuccessPage() {
  const { plan } = Route.useSearch();
  const navigate   = useNavigate();
  const [seconds, setSeconds] = useState(3);
  const [dashPath, setDashPath] = useState("/");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const role = data.session?.user?.user_metadata?.role as string | undefined;
      if (role === "etudiant" || role === "lyceen") {
        setDashPath("/dashboard/etudiant");
      } else if (role === "entreprise") {
        setDashPath("/dashboard/recruteur");
      } else {
        setDashPath("/");
      }
    });
  }, []);

  useEffect(() => {
    if (seconds <= 0) {
      navigate({ to: dashPath as never });
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, navigate, dashPath]);

  const planLabel = plan ? (PLAN_LABELS[plan] ?? plan) : null;

  return (
    <div className="min-h-screen bg-ink text-white flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        {/* Icône succès */}
        <div className="mx-auto size-20 rounded-full bg-lime/15 border border-lime/30 flex items-center justify-center mb-8 animate-in zoom-in duration-500">
          <CheckCircle className="size-10 text-lime" strokeWidth={1.5} />
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
          Paiement réussi !
        </h1>

        <p className="text-mute text-lg mb-2">
          {planLabel ? (
            <>Bienvenue sur le plan <strong className="text-white">{planLabel}</strong>.</>
          ) : (
            "Ton paiement a bien été reçu."
          )}
        </p>

        <p className="text-mute text-sm mb-10">
          Tu vas recevoir un email de confirmation. Tes accès sont activés immédiatement.
        </p>

        {/* Countdown */}
        <div className="inline-flex items-center gap-2 text-sm text-mute">
          <Loader2 className="size-4 animate-spin" />
          Redirection vers le dashboard dans {seconds}s…
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate({ to: dashPath as never })}
            className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-ink hover:-translate-y-0.5 transition-transform"
          >
            Accéder au dashboard maintenant
          </button>
        </div>
      </div>
    </div>
  );
}
