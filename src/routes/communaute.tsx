import { createFileRoute, redirect } from "@tanstack/react-router";

// /communaute doublonnait /bons-plans et /evenements. Seuls les bons plans (données réelles) sont conservés ;
// les sections « Forum » et « Activité récente » n'étaient que des « Bientôt » sans contenu.
export const Route = createFileRoute("/communaute")({
  beforeLoad: () => {
    throw redirect({ to: "/bons-plans", replace: true });
  },
});
