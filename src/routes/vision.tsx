import { createFileRoute, redirect } from "@tanstack/react-router";

// Page supprimée : contenu redondant avec l'accueil (et chiffres non vérifiables).
export const Route = createFileRoute("/vision")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "comment-ca-marche", replace: true });
  },
});
