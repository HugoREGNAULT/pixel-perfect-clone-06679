import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/founder/success")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({ meta: [{ title: "Bienvenue Founder ⚡ — Springr" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  return (
    <main className="min-h-screen grid place-items-center px-5">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-pink-glow shadow-lg shadow-primary/30">
          <Check className="h-8 w-8 text-white" strokeWidth={3} />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold">
          Bienvenue parmi les Founders <Sparkles className="inline h-6 w-6 text-pink-glow" />
        </h1>
        <p className="mt-3 text-muted-foreground">
          Ton paiement a bien été reçu. Tu recevras un email dès qu'on ouvrira la beta. Merci de
          croire en Springr 💜
        </p>
        <Button asChild className="mt-8">
          <Link to="/">Retour à l'accueil</Link>
        </Button>
      </div>
    </main>
  );
}
