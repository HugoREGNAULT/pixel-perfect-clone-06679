import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/cancel")({
  validateSearch: (s: Record<string, unknown>) => ({
    plan: typeof s.plan === "string" ? s.plan : undefined,
  }),
  head: () => ({ meta: [{ title: "Paiement annulé — Springr" }] }),
  component: CancelPage,
});

function CancelPage() {
  const { plan } = Route.useSearch();
  const backTo = plan?.startsWith("company") ? "/recruteurs" : "/tarifs";

  return (
    <div className="min-h-screen bg-ink text-white flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto size-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8">
          <XCircle className="size-10 text-mute" strokeWidth={1.5} />
        </div>

        <h1 className="font-display text-3xl font-bold mb-3">Paiement annulé</h1>

        <p className="text-mute text-lg mb-10">
          Aucun montant n'a été prélevé. Tu peux reprendre à tout moment.
        </p>

        <Link
          to={backTo as never}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="size-4" />
          Retour aux tarifs
        </Link>
      </div>
    </div>
  );
}
