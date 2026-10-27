import { createFileRoute, redirect } from "@tanstack/react-router";

// Page fusionnée dans l'accueil (section « Fonctionnalités »).
export const Route = createFileRoute("/fonctionnalites")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "fonctionnalites", replace: true });
  },
});
